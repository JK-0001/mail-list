import { google } from 'googleapis';

async function fetchEmails(accessToken) {
  // const oauth2Client = new google.auth.OAuth2();
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URL,
  );
  oauth2Client.setCredentials({
    access_token: accessToken, // Google access token
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread', // Fetch emails
      maxResults: 5, // Adjust as needed
    });

    return response.data.messages || [];
  } catch (error) {
    console.error('Error fetching emails:', error);
    return [];
  }
}

async function fetchEmailDetails(accessToken, messageId) {
    // const oauth2Client = new google.auth.OAuth2();
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.REDIRECT_URL,
    );
    oauth2Client.setCredentials({
      access_token: accessToken,
    });
  
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
    try {
      const response = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full', // Fetch full email content
      });
  
      return response.data;
    } catch (error) {
      console.error('Error fetching email details:', error);
      return null;
    }
  }


export async function fetchEmailsLists(accessToken) {
  const emails = await fetchEmails(accessToken);

  let uniqueSenders = new Set();

  for (const email of emails) {
    const emailDetails = await fetchEmailDetails(accessToken, email.id);

    if (emailDetails) {

      uniqueSenders.add(emailDetails.payload.headers.find((header) => header.name === 'From')?.value);

    }
  }

  return uniqueSenders;
}