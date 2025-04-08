import { google } from 'googleapis';

async function fetchPromotionalEmails(accessToken) {
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
      q: 'category:promotions', // Fetch promotional emails
      maxResults: 50, // Adjust as needed
    });

    return response.data.messages || [];
  } catch (error) {
    console.error('Error fetching promotional emails:', error);
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

function isNewsletter(email) {
  const subject = email.payload.headers.find((header) => header.name === 'Subject')?.value || '';
  const from = email.payload.headers.find((header) => header.name === 'From')?.value || '';
  const body = email.payload.body?.data || '';

  // Decode the email body (base64 encoded)
  const decodedBody = Buffer.from(body, 'base64').toString('utf-8');

  // Check for newsletter indicators
  const isNewsletterSubject = /newsletter|digest|update/i.test(subject);
  const isNewsletterSender = /substack\.com|mailchimp\.com|newsletter/i.test(from);
  const hasUnsubscribeLink = /unsubscribe/i.test(decodedBody);

  return isNewsletterSubject || isNewsletterSender || hasUnsubscribeLink;
}

export async function fetchNewsletters(accessToken) {
  const promotionalEmails = await fetchPromotionalEmails(accessToken);

  const newsletters = [];

  for (const email of promotionalEmails) {
    const emailDetails = await fetchEmailDetails(accessToken, email.id);

    if (emailDetails && isNewsletter(emailDetails)) {
      newsletters.push({
        id: emailDetails.id,
        subject: emailDetails.payload.headers.find((header) => header.name === 'Subject')?.value,
        from: emailDetails.payload.headers.find((header) => header.name === 'From')?.value,
        snippet: emailDetails.snippet,
      });
    }
  }

  return newsletters;
}