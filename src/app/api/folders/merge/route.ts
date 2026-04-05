import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'

// POST { sourceIds: string[], targetId: string } — move all documents from
// sourceIds into targetId, then delete the source folders.
export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  const body = await req.json()
  const sourceIds: string[] = Array.isArray(body.sourceIds) ? body.sourceIds : []
  const targetId: string | undefined = body.targetId

  if (!targetId || sourceIds.length === 0) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  // Verify target belongs to user
  const { data: target } = await supabase
    .from('folders')
    .select('id')
    .eq('id', targetId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!target) return NextResponse.json({ error: 'Dossier cible introuvable' }, { status: 404 })

  // Move documents
  await supabase
    .from('documents')
    .update({ folder_id: targetId })
    .in('folder_id', sourceIds)
    .eq('user_id', user.id)

  // Delete source folders
  const sourcesToDelete = sourceIds.filter(id => id !== targetId)
  if (sourcesToDelete.length > 0) {
    await supabase
      .from('folders')
      .delete()
      .in('id', sourcesToDelete)
      .eq('user_id', user.id)
  }

  return NextResponse.json({ ok: true })
}
