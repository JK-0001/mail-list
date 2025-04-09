import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from '@/utils/supabase/server'
import { JSDOM } from "jsdom";
import * as cheerio from 'cheerio';

export const extractUnsubscribeLink = (html) => {
  const $ = cheerio.load(html);
  const links = $('a')
    .map((_, el) => $(el).attr('href'))
    .get();

  const unsubscribeLink = links.find(link =>
    link &&
    /unsubscribe|email-preferences|optout|stop|manage preferences/i.test(link)
  );

  return unsubscribeLink || null;
};

// Concurrency limiter helper function
async function limitedMap(items, limit, asyncFn) {
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
  }

export async function GET(req) {
    try {

        const supabase = await createClient()

        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized: User not found" }, { status: 401 });
        }

        const user_id = user.id; // Authenticated user's ID

        const authHeader = req.headers.get("authorization");
        if (!authHeader) return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });

        // Extract the token (Bearer format)
        const providerToken = authHeader.split("Bearer ")[1];
        if (!providerToken) return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.REDIRECT_URL,
          );
          oauth2Client.setCredentials({
            access_token: providerToken, // Google access token
          });
        
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        let nextPageToken = null;
        const sendersMap = new Map();
        let fetchedEmails = 0;
        const maxFetch = 3000; // fetch upto 3000 emails

        // Step 1: Build the basic senders list
        do {
        const messagesRes = await gmail.users.messages.list({
            userId: "me",
            maxResults: 500,
            pageToken: nextPageToken || undefined,
        });

        if (!messagesRes.data.messages) break;

        fetchedEmails += messagesRes.data.messages.length;
        nextPageToken = messagesRes.data.nextPageToken;

        // Fetch details for all messages in parallel with a concurrency limit
        const batchDetails = await limitedMap(
            messagesRes.data.messages,
            5, // concurrency limit
            (message) =>
            gmail.users.messages.get({
                userId: "me",
                id: message.id,
                format: "full",
            })
        );

        // Process each message's details
        batchDetails.forEach((msg) => {
            if (!msg) return;
            const headers = msg.data.payload.headers;
            const fromHeader = headers.find((h) => h.name === "From")?.value;
            const dateHeader = headers.find((h) => h.name === "Date")?.value;
            let unsubscribeHeader = headers.find(h => h.name === "List-Unsubscribe")?.value;
            if (!fromHeader) return;

            // Extract from email body if not found in headers
            if (unsubscribeHeader == undefined) {
              let parts = []
              if (msg.data.payload.parts) {
                parts = msg.data.payload.parts[0].body
              } else {
                parts = msg.data.payload.body
              }
              
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
                    text.toLowerCase().includes("preferences") ||
                    href.toLowerCase().includes("manage preferences") ||
                    text.toLowerCase().includes("manage preferences")
                  ) {
                    unsubscribeHeader = href;
                    break;
                  }
                }
              }
            }

            // Extract name and email
            const match = fromHeader.match(/(.+)?\s*<(.+)>/);
            const name = match?.[1] ? match[1].trim() : fromHeader;
            const email = match?.[2] ? match[2].trim() : fromHeader;

            // Extract unsubscribe link
            let unsubscribeLink = null;
            if (unsubscribeHeader) {
              // Some headers contain multiple links separated by commas
              const matchUnsub = unsubscribeHeader.match(/<(.*?)>/);
              unsubscribeLink = matchUnsub ? matchUnsub[1] : unsubscribeHeader;
            }
            

            // Only store basic details here; we'll update unread count later
            if (!sendersMap.has(email)) {
            sendersMap.set(email, {
                user_id,
                name,
                email,
                unread_count: 0, // temporary, will update later
                last_received: new Date(dateHeader).toISOString(),
                unsubscribe_link: unsubscribeLink || null,
            });
            } else {
            const sender = sendersMap.get(email);
            sender.last_received = new Date(sender.last_received) < new Date(dateHeader)
                ? new Date(dateHeader).toISOString()
                : sender.last_received;
            sender.unsubscribe_link = sender.unsubscribe_link || unsubscribeLink;
            }
        });
        } while (nextPageToken && fetchedEmails < maxFetch);

        // Convert map to array for further processing
        const sendersList = Array.from(sendersMap.values());

        // Step 2: Update the unread count for each sender using a separate query
        const updatedSenders = await limitedMap(
        sendersList,
        5, // concurrency limit for unread queries
        async (sender) => {
            try {
            // Query unread emails from this sender
            const query = `from:${sender.email} label:UNREAD`;
            const res = await gmail.users.messages.list({
                userId: "me",
                q: query,
            });
            // Use resultSizeEstimate for total unread count
            sender.unread_count = res.data.resultSizeEstimate || 0;
            return sender;
            } catch (err) {
            // In case of error, keep the current unread_count (default 0)
            return sender;
            }
        }
        );

        // Step 3: Store the updated senders list in Supabase
        const { error } = await supabase
        .from("senders_list")
        .upsert(updatedSenders, { onConflict: ["email"] });

        if (error) {
          console.error("Error storing senders:", error);
          return NextResponse.json({ error: "Failed to store senders in database" }, { status: 500 });
        }

        let currentISO = new Date().toISOString()
        // Step 4: Update last_synced in preferences
        await supabase.from('preferences').upsert({
          user_id: user_id,
          key: 'last_synced',
          value: String(currentISO),
        }, { onConflict: ['user_id', 'key'] });

        // Now fetch all sender data from Supabase
        const { data, err } = await supabase
          .from("senders_list")
          .select("*")
          .eq("user_id", user_id)
          .order("last_received", { ascending: false });

        if (err) throw err;

        return NextResponse.json({senders: data});

    } catch (error) {
        console.error("Error fetching senders:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}