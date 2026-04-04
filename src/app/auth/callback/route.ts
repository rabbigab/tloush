import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/inbox'
  const error_param = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // If Supabase/Google returns an error directly in the URL
  if (error_param) {
    console.error('[auth/callback] OAuth error:', error_param, error_description)
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(error_description || error_param)}`
    )
  }

  // Create Supabase client with explicit cookie handling for the redirect response
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  // OAuth & magic link flow (code exchange)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('[auth/callback] Code exchange error:', error.message, error)
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent('Erreur de connexion Google. Veuillez réessayer.')}`
    )
  }

  // Email confirmation flow (token_hash)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('[auth/callback] OTP verification error:', error.message)
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent('Lien de confirmation expiré. Veuillez réessayer.')}`
    )
  }

  // No code and no token_hash — something went wrong
  console.error('[auth/callback] No code or token_hash in callback URL:', request.url)
  return NextResponse.redirect(`${origin}/auth/login?error=confirmation`)
}
