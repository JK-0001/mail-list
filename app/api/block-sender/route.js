// app/api/block_sender/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'


export async function POST(req) {

  const supabase = await createClient()    

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized: User not found" }, { status: 401 });
  }
  
  const user_id = user.id; // Authenticated user's ID

  const body = await req.json()
  const { email, type } = body

  const { data: data, error} = await supabase
      .from('senders_list')
      .select('*')
      .eq('user_id', user_id)
      .eq('email', email)
      .single();

  // 1. Add to blocked_senders
  const { error: insertError } = await supabase.from('blocked_senders').insert({
    user_id,
    email,
    name: data.name,
    unread_count: data.unread_count,
    last_received: data.last_received,
    unsubscribe_link: data.unsubscribe_link,
    reason: type,
  })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // 2. Remove from senders_list
  const { error: deleteError } = await supabase
    .from('senders_list')
    .delete()
    .eq('user_id', user_id)
    .eq('email', email)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
