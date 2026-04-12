import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'

// =====================================================
// GET /api/family/documents
// Liste les documents partages dans la famille de l'utilisateur
// (celle qu'il possede OU celle ou il est membre)
// =====================================================
export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  // Trouver le family_owner_id pertinent :
  // - Si le user est proprietaire d'un foyer → son propre ID
  // - Sinon si il est membre → le owner_id de son foyer
  let familyOwnerId = user.id

  const { data: membership } = await supabase
    .from('family_members')
    .select('owner_id')
    .eq('member_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (membership?.owner_id) {
    familyOwnerId = membership.owner_id
  }

  // Recuperer les docs partages de ce foyer
  const { data: shared, error } = await supabase
    .from('family_shared_documents')
    .select(`
      id,
      document_id,
      shared_by,
      shared_at,
      documents (
        id,
        file_name,
        document_type,
        period,
        is_urgent,
        action_required,
        summary_fr,
        created_at
      )
    `)
    .eq('family_owner_id', familyOwnerId)
    .order('shared_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    family_owner_id: familyOwnerId,
    is_owner: familyOwnerId === user.id,
    shared_documents: shared || [],
  })
}

// =====================================================
// POST /api/family/documents
// Partage un document avec la famille
// Body: { document_id: string }
// =====================================================
export async function POST(req: Request) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  const { document_id } = await req.json().catch(() => ({ document_id: null }))
  if (!document_id || typeof document_id !== 'string') {
    return NextResponse.json({ error: 'document_id requis' }, { status: 400 })
  }

  // Verifier que le user possede bien ce document
  const { data: doc } = await supabase
    .from('documents')
    .select('id, user_id')
    .eq('id', document_id)
    .maybeSingle()

  if (!doc || doc.user_id !== user.id) {
    return NextResponse.json({ error: 'Document introuvable' }, { status: 404 })
  }

  // Determiner le family_owner_id (si le user est membre, owner = son proprietaire)
  let familyOwnerId = user.id
  const { data: membership } = await supabase
    .from('family_members')
    .select('owner_id')
    .eq('member_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (membership?.owner_id) {
    familyOwnerId = membership.owner_id
  }

  // Upsert
  const { error } = await supabase
    .from('family_shared_documents')
    .upsert(
      {
        document_id,
        family_owner_id: familyOwnerId,
        shared_by: user.id,
        shared_at: new Date().toISOString(),
      },
      { onConflict: 'document_id' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// =====================================================
// DELETE /api/family/documents?document_id=xxx
// Arrete de partager un document
// =====================================================
export async function DELETE(req: Request) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  const url = new URL(req.url)
  const documentId = url.searchParams.get('document_id')
  if (!documentId) {
    return NextResponse.json({ error: 'document_id requis' }, { status: 400 })
  }

  const { error } = await supabase
    .from('family_shared_documents')
    .delete()
    .eq('document_id', documentId)
    .eq('shared_by', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
