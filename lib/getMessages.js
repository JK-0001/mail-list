// lib/gmail/getMessages.js
import { google } from "googleapis";

export async function getMessages(new_access_token, query) {

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.REDIRECT_URL
    );
    oauth2Client.setCredentials({ access_token: new_access_token });
    
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const messages = [];
    let nextPageToken = null;
    const maxFetch = 500;
    const batchSize = 100;
  
    do {
      const res = await gmail.users.messages.list({
        userId: "me",
        maxResults: batchSize,
        pageToken: nextPageToken || undefined,
        ...(query ? { q: query } : {}),
      });
  
      const batch = res.data.messages || [];
      messages.push(...batch);
      nextPageToken = res.data.nextPageToken;
  
      if (messages.length >= maxFetch) break;
    } while (nextPageToken);
  
    return messages;
  }
  