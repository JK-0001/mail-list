// lib/gmail/extractSenderDetails.js
import { google } from "googleapis";
import { JSDOM } from "jsdom";


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

export async function extractSenderDetails(user_id, new_access_token, messages) {

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.REDIRECT_URL
    );
    oauth2Client.setCredentials({ access_token: new_access_token });
    
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const batchDetails = await limitedMap(
        messages,
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

    return updatedSenders;
}