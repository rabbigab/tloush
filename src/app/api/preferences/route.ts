import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  const { data } = await supabase
    .from('user_preferences')
    .select('email_digest_enabled, digest_day, urgent_alerts_enabled')
    .eq('user_id', user.id)
    .single()

  if (!data) {
    // Create default preferences
    const { data: newPrefs } = await supabase
      .from('user_preferences')
      .insert({ user_id: user.id, email_digest_enabled: true, digest_day: 1, urgent_alerts_enabled: true })
      .select('email_digest_enabled, digest_day, urgent_alerts_enabled')
      .single()
    return NextResponse.json(newPrefs)
  }

  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { user, supabase } = auth

    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
    }
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (typeof body.email_digest_enabled === 'boolean') {
      updates.email_digest_enabled = body.email_digest_enabled
    }
    if (typeof body.digest_day === 'number' && body.digest_day >= 0 && body.digest_day <= 6) {
      updates.digest_day = body.digest_day
    }
    if (typeof body.urgent_alerts_enabled === 'boolean') {
      updates.urgent_alerts_enabled = body.urgent_alerts_enabled
    }

    // Upsert: create if not exists
    const { data: existing } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      await supabase.from('user_preferences').insert({
        user_id: user.id,
        ...updates
      })
    } else {
      await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.id)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/preferences]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
