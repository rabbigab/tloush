import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { id } = await params

    // Récupérer le document pour obtenir le file_path
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('file_path')
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

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/documents/[id]]', err)
    return NextResponse.json({ error: 'Erreur inconnue' }, { status: 500 })
  }
}
