// app/api/restore_sender/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'


export async function POST(req) {

  const supabase = createClient()
  
  const body = await req.json()
  const { user_id, email } = body

  // Fetch sender from blocked list
  const { data: sender, error: fetchError } = await supabase
    .from('blocked_senders')
    .select('*')
    .eq('user_id', user_id)
    .eq('email', email)
    .single()

  if (fetchError || !sender) {
    return NextResponse.json({ error: 'Sender not found in blocked list' }, { status: 404 })
  }

  // Add back to senders_list
  const { error: insertError } = await supabase.from('senders_list').insert({
    user_id,
    email: sender.email,
    name: sender.name,
    unread_count: sender.unread_count,
    last_received: sender.last_received,
    unsubscribe_link: sender.unsubscribe_link,
  })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Remove from blocked_senders
  const { error: deleteError } = await supabase
    .from('blocked_senders')
    .delete()
    .eq('user_id', user_id)
    .eq('email', email)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
