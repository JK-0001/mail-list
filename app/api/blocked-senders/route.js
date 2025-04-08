// app/api/blocked_senders/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'


export async function GET(req) {

    const supabase = await createClient()

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized: User not found" }, { status: 401 });
    }

    const user_id = user.id; // Authenticated user's ID

  const { data, error } = await supabase
    .from('blocked_senders')
    .select('*')
    .eq('user_id', user_id)
    .order('blocked_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
