import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { user, supabase } = auth

    const { id } = await params

    // Récupérer le document pour obtenir le file_path et folder_id
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('file_path, folder_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !doc) {
      return NextResponse.json({ error: 'Document introuvable' }, { status: 404 })
    }

    // Supprimer du Storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([doc.file_path])

    if (storageError) {
      console.error('Storage delete error:', storageError)
      // On continue quand même — supprimer la DB même si le Storage échoue
    }

    // Supprimer de la base (cascade sur conversations + messages via FK)
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (dbError) {
      console.error('DB delete error:', dbError)
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
    }

    // Nettoyer le dossier s'il est désormais vide
    if (doc.folder_id) {
      const { count } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('folder_id', doc.folder_id)
        .eq('user_id', user.id)

      if (count === 0) {
        await supabase.from('folders').delete().eq('id', doc.folder_id).eq('user_id', user.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/documents/[id]]', err)
    return NextResponse.json({ error: 'Erreur inconnue' }, { status: 500 })
  }
}
