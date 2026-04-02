import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data } = await supabase
    .from('user_preferences')
    .select('email_digest_enabled, digest_day')
    .eq('user_id', user.id)
    .single()

  if (!data) {
    // Create default preferences
    const { data: newPrefs } = await supabase
      .from('user_preferences')
      .insert({ user_id: user.id, email_digest_enabled: true, digest_day: 1 })
      .select('email_digest_enabled, digest_day')
      .single()
    return NextResponse.json(newPrefs)
  }

  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await req.json()
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (typeof body.email_digest_enabled === 'boolean') {
    updates.email_digest_enabled = body.email_digest_enabled
  }
  if (typeof body.digest_day === 'number' && body.digest_day >= 0 && body.digest_day <= 6) {
    updates.digest_day = body.digest_day
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
}
