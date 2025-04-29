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
  const { email} = body

  const { error: markError } = await supabase
    .from('senders_list')
    .update({
      unsubscribed: true
    })
    .eq('user_id', user_id)
    .eq('email', email)

  if (markError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
