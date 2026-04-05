import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  const { id } = await params
  const body = await req.json()

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof body.name === 'string' && body.name.trim()) updates.name = body.name.trim()
  if (typeof body.category === 'string') updates.category = body.category

  const { data, error } = await supabase
    .from('folders')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  return NextResponse.json({ folder: data })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  const { id } = await params

  // Detach documents first
  await supabase
    .from('documents')
    .update({ folder_id: null })
    .eq('folder_id', id)
    .eq('user_id', user.id)

  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
