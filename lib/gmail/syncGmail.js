// lib/gmail/syncGmail.js
import { google } from "googleapis";
import { JSDOM } from "jsdom";
import { decrypt, encrypt } from "@/lib/crypto";
import * as cheerio from "cheerio";

// const extractUnsubscribeLink = (html) => {
//   const $ = cheerio.load(html);
//   const links = $("a")
//     .map((_, el) => $(el).attr("href"))
//     .get();

//   const unsubscribeLink = links.find(
//     (link) =>
//       link &&
//       /unsubscribe|email-preferences|optout|stop|manage preferences/i.test(link)
//   );

//   return unsubscribeLink || null;
// };

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
const delayBetween = (min, max) => Math.random() * (max - min) + min;

const limitedMap = async (items, limit, asyncFn) => {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const currentIndex = index++;
      try {
        results[currentIndex] = await asyncFn(items[currentIndex]);
      } catch (err) {
        results[currentIndex] = null;
      }
    }
  }

  const workers = Array.from({ length: limit }, () => worker());
  await Promise.all(workers);
  return results;
};

export default async function syncGmail(user_id, access_token, supabase, type) {

  console.log(type)

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URL
  );

  const { data: tokenData } = await supabase
  .from("users_token")
  .select("*")
  .eq("user_id", user_id)
  .single();

  if (!tokenData) throw new Error("Missing token info");

  let refreshTokens = decrypt(tokenData.refresh_token);
  // let refreshTokens = tokenData.refresh_token
  const expiresAt = new Date(tokenData.access_token_expires_at).getTime();

  if (!tokenData.access_token_expires_at || Date.now() > expiresAt - 5 * 60 * 1000) {
    // Token missing or expires in < 5 min
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshTokens,
        grant_type: 'refresh_token',
      }),
    });

    const data = await res.json();

    if (data.error) {
      console.log(data.error_description)
      if (data.error.toLowerCase() === "invalid grant" || data.error.toLowerCase() === "invalid credentials") {
        throw new Error("force_reauth")
      }
      throw new Error(`Failed to refresh token: ${data.error_description}`);
    }

    const now = Date.now(); // in ms
    let currentISOs = new Date().toISOString()

    const access_token_expires_at = new Date(now + data.expires_in * 1000).toISOString();
    const refresh_token_expires_at = new Date(now + data.refresh_token_expires_in * 1000).toISOString();


    const { error: tokenError } = await supabase.from("users_token").update({
      access_token: encrypt(data.access_token),
      access_token_expires_at,
      refresh_token_expires_at,
      id_token: encrypt(data.id_token),
      scope: encrypt(data.scope),
      token_type: encrypt(data.token_type),
      updated_at: currentISOs
    }).eq("user_id", user_id);

    if (tokenError) {
      console.log(tokenError)
      throw new Error(`Failed to update token in DB`)
    }
    access_token = data.access_token
  }

  oauth2Client.setCredentials({ access_token });
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  let nextPageToken = null;
  // const sendersMap = new Map();
  let fetchedEmails = 0;
  const maxFetch = 500;
  const batchSize = 100;

  // 🌟 Get last_synced for partial sync
  let afterQuery = "";
  if (type === "partial") {
    const { data, error } = await supabase
      .from("preferences")
      .select("last_synced")
      .eq("user_id", user_id)
      .single();

    if (error) {
      console.error("Error fetching last_synced:", error);
    } else if (data?.last_synced) {
      const unixTime = Math.floor(new Date(data.last_synced).getTime() / 1000);
      afterQuery = `after:${unixTime}`;
    }
  }

  // Step 4: Update last_synced in preferences
  if (type == "full") { 
    const { error } = await supabase.from('preferences').upsert({
      user_id,
      loading: true,
      progress: 0,
    }, { onConflict: ['user_id'] });
    console.log(error)
  }

  do {
    const messagesRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: batchSize,
      pageToken: nextPageToken || undefined,
      ...(afterQuery ? { q: afterQuery } : {}),
    });

    if (!messagesRes.data.messages) break;

    fetchedEmails += messagesRes.data.messages.length;
    nextPageToken = messagesRes.data.nextPageToken;

    const batchDetails = await limitedMap(
      messagesRes.data.messages,
      5,
      (msg) =>
        gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "full",
        })
    );

    const batchSendersMap = new Map();

    batchDetails.forEach((msg) => {
      if (!msg) return;
      const headers = msg.data.payload.headers;
      const fromHeader = headers.find((h) => h.name === "From")?.value;
      const dateHeader = headers.find((h) => h.name === "Date")?.value;
      let unsubscribeHeader = headers.find((h) => h.name === "List-Unsubscribe")?.value;

      if (!fromHeader) return;

      if (!unsubscribeHeader) {
        let parts = msg.data.payload.parts?.[0].body || msg.data.payload.body;

        if (parts.data) {
          const html = Buffer.from(parts.data, "base64").toString("utf-8");
          const dom = new JSDOM(html);
          const links = Array.from(dom.window.document.querySelectorAll("a"));

          for (const link of links) {
            const href = link.href || "";
            const text = link.textContent || "";
            if (
              href.toLowerCase().includes("unsubscribe") ||
              text.toLowerCase().includes("unsubscribe") ||
              href.toLowerCase().includes("optout") ||
              text.toLowerCase().includes("optout") ||
              href.toLowerCase().includes("opt-out") ||
              text.toLowerCase().includes("opt-out") ||
              href.toLowerCase().includes("preferences") ||
              text.toLowerCase().includes("preferences")
            ) {
              unsubscribeHeader = href;
              break;
            }
          }
        }
      }

      const match = fromHeader.match(/(.+)?\s*<(.+)>/);
      const name = match?.[1] ? match[1].trim() : fromHeader;
      const email = match?.[2] ? match[2].trim() : fromHeader;

      let unsubscribeLink = null;
      if (unsubscribeHeader) {
        const matchUnsub = unsubscribeHeader.match(/<(.*?)>/);
        unsubscribeLink = matchUnsub ? matchUnsub[1] : unsubscribeHeader;
      }

      if (!batchSendersMap.has(email)) {
        batchSendersMap.set(email, {
          user_id,
          name,
          email,
          unread_count: 0,
          last_received: new Date(dateHeader).toISOString(),
          unsubscribe_link: unsubscribeLink || null,
        });
      } else {
        const sender = batchSendersMap.get(email);
        sender.last_received =
          new Date(sender.last_received) < new Date(dateHeader)
            ? new Date(dateHeader).toISOString()
            : sender.last_received;
        sender.unsubscribe_link = sender.unsubscribe_link || unsubscribeLink;
      }
    });

    const batchSenderList = Array.from(batchSendersMap.values());

    const updatedSenders = await limitedMap(batchSenderList, 5, async (sender) => {
      try {
        const query = `from:${sender.email} label:UNREAD`;
        const res = await gmail.users.messages.list({ userId: "me", q: query });
        sender.unread_count = res.data.resultSizeEstimate || 0;
        return sender;
      } catch (err) {
        return sender;
      }
    });

    // Insert the batch into Supabase
    const {error} = await supabase.from("senders_list").upsert(updatedSenders, { onConflict: ["user_id", "email"] });
    console.log(error)

    // Optional: Emit progress here
    if (type == "full") { 
      const { error: progressError } = await supabase.from("preferences").update({
        progress: Math.min(Math.round((fetchedEmails / maxFetch) * 100), 100),
      }).eq("user_id", user_id);
      
      if (progressError) console.log("Progress update error:", progressError);
    }

    await sleep(delayBetween(1500, 2500)); // Delay between 1.5s - 2.5s
    
  // } while (nextPageToken && fetchedEmails < maxFetch);
  } while (
    nextPageToken &&
    (type === "full" ? fetchedEmails < maxFetch : true)
  );

  // const sendersList = Array.from(sendersMap.values());

  // const updatedSenders = await limitedMap(sendersList, 5, async (sender) => {
  //   try {
  //     const query = `from:${sender.email} label:UNREAD`;
  //     const res = await gmail.users.messages.list({ userId: "me", q: query });
  //     sender.unread_count = res.data.resultSizeEstimate || 0;
  //     return sender;
  //   } catch (err) {
  //     return sender;
  //   }
  // });

  // for (let i = 0; i < updatedSenders.length; i += 100) {
  //   const chunk = updatedSenders.slice(i, i + 100);
  //   const {error} = await supabase.from("senders_list").upsert(chunk);
  //   console.log(error)
  // }

  let currentISO = new Date().toISOString()
  const { error } = await supabase
  .from('preferences')
  .update({ 
    loading: false,
    progress: 100,
    last_synced: String(currentISO)
   })
  .eq('user_id', user_id)

  if (error) {
    console.log("Error storing last_synced in preferences table " + error)
  }

  return { success: true };
}