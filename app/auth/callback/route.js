import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { encrypt } from '@/lib/crypto'

// This disables the Edge Runtime
export const runtime = 'nodejs'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')


  const supabase = await createClient()
  if (token_hash && type) {

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      redirectTo.searchParams.delete('next')
      return NextResponse.redirect(redirectTo)
    }
  } else if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const session = data.session
      const user = session?.user
      const refreshToken = session?.provider_refresh_token
      const accessToken = session?.provider_token

      if (user && refreshToken && accessToken) {
          // Store both tokens on first login
          const encryptedRefresh = encrypt(refreshToken)
          const encryptedAccess = encrypt(accessToken)

          const {error} = await supabase.from('users_token').upsert({
            user_id: user.id,
            provider: user.identities[0].provider,
            access_token: encryptedAccess,
            refresh_token: encryptedRefresh,
          })

          if (error) {
            console.error("Error while storing tokens on intial login: " + error)
          }
      }
      

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}/dashboard`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}/dashboard`)
      } else {
        return NextResponse.redirect(`${origin}${next}/dashboard`)
      }
    }
  }


  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)

  // return the user to an error page with some instructions
  // redirectTo.pathname = '/error'
  // return NextResponse.redirect(redirectTo)
}