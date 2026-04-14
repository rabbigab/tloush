import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  const { id } = await params

  const { error } = await supabase
    .from('recurring_expenses')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  const { id } = await params
  const body = await req.json()

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof body.amount === 'number' && body.amount > 0) updates.amount = body.amount
  if (typeof body.frequency === 'string') updates.frequency = body.frequency
  if (typeof body.provider_name === 'string' && body.provider_name.trim()) {
    updates.provider_name = body.provider_name.trim()
  }

  const { data, error } = await supabase
    .from('recurring_expenses')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }

  return NextResponse.json({ expense: data })
}
