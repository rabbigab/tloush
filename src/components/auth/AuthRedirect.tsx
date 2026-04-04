'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Invisible component that detects if the user is already authenticated
 * (e.g. returning from Google OAuth redirect) and redirects to the app.
 * Place this on public pages where OAuth might redirect to.
 */
export default function AuthRedirect({ to = '/inbox' }: { to?: string }) {
  useEffect(() => {
    const supabase = createClient()

    // Listen for auth state changes (catches OAuth hash fragments or code params)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        window.location.href = to
      }
    })

    // Also check if user already has a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.href = to
      }
    })

    return () => subscription.unsubscribe()
  }, [to])

  return null
}
