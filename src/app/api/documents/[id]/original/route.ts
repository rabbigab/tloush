import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'

/**
 * Redirects to a signed URL for the original uploaded document.
 * The signed URL is valid for 1 hour.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  const { id } = await params

  const { data: doc } = await supabase
    .from('documents')
    .select('file_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!doc || !doc.file_path) {
    return NextResponse.json({ error: 'Document introuvable' }, { status: 404 })
  }

  const { data: signedData, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(doc.file_path, 3600)

  if (error || !signedData?.signedUrl) {
    return NextResponse.json({ error: 'Impossible de générer le lien' }, { status: 500 })
  }

  return NextResponse.redirect(signedData.signedUrl)
}
