import { inngest } from "../../inngest/client";
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    const { user_id, type } = await req.json(); // type: 'full' or 'partial'

    // Validation to ensure type is either 'full' or 'partial'
    if (!['full', 'partial'].includes(type)) {
      return NextResponse.json({ error: 'Invalid sync type' }, { status: 400 });
    }

    inngest
      .send({
        name: 'app/gmail.sync',
        data: { user_id, access_token: token, type },
      })
      .then(() => {
        console.log("Inngest event sent successfully");
      })
      .catch((err) => {
        console.error("Failed to send Inngest event", err);
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[gmail-sync error]', error);
    return NextResponse.json({ error: 'Failed to start sync' }, { status: 500 });
  }
}
