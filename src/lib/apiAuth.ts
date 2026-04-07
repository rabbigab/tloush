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

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

/**
 * Authenticate and verify admin privileges.
 * Checks both the is_admin column on profiles AND the ADMIN_EMAILS env var.
 * Returns { user, supabase } on success, or a 401/403 NextResponse on failure.
 */
export async function requireAdmin(): Promise<AuthResult> {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  // Check env-based admin list (backward compat)
  if (ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
    return { user, supabase }
  }

  // Check is_admin column on profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (profile?.is_admin) {
    return { user, supabase }
  }

  return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
}
