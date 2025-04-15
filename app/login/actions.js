'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

// export async function login(formData) {
//   const supabase = await createClient()

//   const data = {
//     email: formData.get('email'),
//     password: formData.get('password'),
//   }

//   const { error } = await supabase.auth.signInWithPassword(data)

//   if (error) {
//     redirect('/error')
//   }

//   revalidatePath('/', 'layout')
//   redirect('/')
// }

export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: process.env.CALLBACK,
      scopes: process.env.GMAIL_SCOPES,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (data.url) {
    revalidatePath('/', 'layout')
    redirect(data.url) // use the redirect API for your server framework
  }

  if (error) {
    redirect('/error')
  }

}

// export async function signup(formData) {
//   const supabase = await createClient()

//   const data = {
//     email: formData.get('email'),
//     password: formData.get('password'),
//   }

//   const { error } = await supabase.auth.signUp(data)

//   if (error) {
//     redirect('/error')
//   }

//   revalidatePath('/', 'layout')
//   redirect('/')
// }
