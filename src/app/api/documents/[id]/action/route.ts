import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'

/**
 * POST /api/documents/[id]/action
 * Marks a document's action as completed.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  const { id } = await params

  const { error } = await supabase
    .from('documents')
    .update({
      action_completed_at: new Date().toISOString(),
      action_required: false,
      is_urgent: false,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
