import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

type AuthSuccess = { user: User; supabase: SupabaseClient }
type AuthResult = AuthSuccess | NextResponse

/**
 * Authenticate the current request via Supabase session cookie.
 * Returns { user, supabase } on success, or a 401 NextResponse on failure.
 *
 * Usage:
 *   const auth = await requireAuth()
 *   if (auth instanceof NextResponse) return auth
 *   const { user, supabase } = auth
 */
export async function requireAuth(): Promise<AuthResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }
  return { user, supabase }
}
