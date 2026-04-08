/**
 * POST /api/agent/respond — User responds to an agent input request
 *
 * Body: { requestId: string, value: string, cancelled?: boolean }
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { resolveUserInput } from '@/lib/computerUse/sessionStore'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() { /* read-only */ },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body = await request.json()
  const { requestId, value, cancelled } = body as {
    requestId: string
    value: string
    cancelled?: boolean
  }

  if (!requestId) {
    return NextResponse.json({ error: 'requestId requis' }, { status: 400 })
  }

  const resolved = resolveUserInput(requestId, { requestId, value: value || '', cancelled })

  if (!resolved) {
    return NextResponse.json({ error: 'Requête expirée ou introuvable' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
