import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'


export async function POST(req) {
  try {
    const supabase = await createClient()    

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Missing email or token' }, { status: 400 });

    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    
    // Extract the token (Bearer format)
    const accessToken = authHeader.split("Bearer ")[1];
    if (!accessToken) return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });


    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.REDIRECT_URL,
      );
      oauth2Client.setCredentials({
        access_token: accessToken, // Google access token
      });
    
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Step 1: Search all unread messages from this sender
    const query = `from:${email} is:unread`;
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      q: query,
    });

    const messageIds = listRes.data.messages?.map((msg) => msg.id) || [];

    // Step 2: Mark them as read
    if (messageIds.length > 0) {
      await gmail.users.messages.batchModify({
        userId: 'me',
        requestBody: {
          ids: messageIds,
          removeLabelIds: ['UNREAD'],
        },
      });
    }

    // Step 3: Update Supabase sender unread_count to 0
    const { error } = await supabase
      .from('senders_list')
      .update({ unread_count: 0 })
      .eq('email', email);
    
    if (error) {
        console.error('Supabase update error:', error);
        return new Response(JSON.stringify({ error: 'Supabase update failed' }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, modified: messageIds.length }), { status: 200 });
  } catch (err) {
    console.error('Error in /mark_read:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
