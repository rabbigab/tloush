'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Silently applies the referral code stored in localStorage after signup.
 * Works for both email signup (ref in user_metadata) and Google OAuth (ref in localStorage).
 * Runs once, then clears the stored code.
 */
export default function ReferralApply() {
  useEffect(() => {
    async function apply() {
      const stored = localStorage.getItem('tloush_referral_code')
      if (!stored) return

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Also check user_metadata in case it was set during email signup
      const code = stored || user.user_metadata?.referral_code
      if (!code) return

      try {
        const res = await fetch('/api/referral', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ referralCode: code }),
        })
        if (res.ok) {
          localStorage.removeItem('tloush_referral_code')
        }
      } catch {
        // Silent fail — will retry next page load
      }
    }

    apply()
  }, [])

  return null
}
