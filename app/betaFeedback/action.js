'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function handleFeedback(formData) {

  const supabase = await createClient()

  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    pain_points: formData.get('pain_point'),
    is_beta_tester: formData.get('betaTester') === 'on',
  }
  console.log(data)

  const { error } = await supabase.from('beta_feedback').insert([data])
  console.log(error)

  if (error) {
    // redirect with error message
    redirect('/?status=error')
  }

  if (formData.get('betaTester') === 'on') {
    redirect('/?status=betasuccess')
  }

  redirect('/?status=success')


}