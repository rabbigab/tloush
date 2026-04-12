import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { scanUserRights } from '@/lib/rightsDetector'

// =====================================================
// GET /api/rights-detector
// Liste les droits detectes pour l'utilisateur
// =====================================================
export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  const { data, error } = await supabase
    .from('detected_rights')
    .select('*')
    .eq('user_id', user.id)
    .order('confidence_score', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ rights: data || [] })
}

// =====================================================
// POST /api/rights-detector
// Lance un scan complet du profil + documents pour detecter les droits
// =====================================================
export async function POST() {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  // Recuperer le profil
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) {
    return NextResponse.json(
      { error: 'Vous devez d\'abord completer votre profil.', needs_profile: true },
      { status: 400 }
    )
  }

  // Recuperer les documents pertinents
  const { data: documents } = await supabase
    .from('documents')
    .select('id, document_type, analysis_data, period, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  // Lancer le scan
  const detected = scanUserRights(profile, documents || [])

  // Upsert dans detected_rights (preserve les status existants)
  const now = new Date().toISOString()
  for (const right of detected) {
    // Verifier si deja detecte (pour preserver le status)
    const { data: existing } = await supabase
      .from('detected_rights')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('right_slug', right.slug)
      .maybeSingle()

    await supabase
      .from('detected_rights')
      .upsert(
        {
          user_id: user.id,
          right_slug: right.slug,
          right_title_fr: right.title_fr,
          right_description_fr: right.description_fr,
          authority: right.authority,
          category: right.category,
          confidence_score: right.confidence_score,
          confidence_level: right.confidence_level,
          estimated_value: right.estimated_value,
          value_unit: right.value_unit,
          source: right.source,
          source_doc_id: right.source_doc_id || null,
          action_url: right.action_url,
          action_label: right.action_label,
          disclaimer: right.disclaimer,
          // Preserve existing status if any
          status: existing?.status || 'suggested',
          detected_at: now,
          updated_at: now,
        },
        { onConflict: 'user_id,right_slug' }
      )
  }

  // Retourner la liste a jour
  const { data: final } = await supabase
    .from('detected_rights')
    .select('*')
    .eq('user_id', user.id)
    .order('confidence_score', { ascending: false })

  return NextResponse.json({
    rights: final || [],
    detected_count: detected.length,
  })
}

// =====================================================
// PATCH /api/rights-detector
// Met a jour le status d'un droit (claimed/dismissed)
// =====================================================
export async function PATCH(req: Request) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  const body = await req.json().catch(() => ({}))
  const { id, status, note } = body

  if (!id || !['suggested', 'claimed', 'dismissed', 'verified'].includes(status)) {
    return NextResponse.json({ error: 'Parametres invalides' }, { status: 400 })
  }

  const { error } = await supabase
    .from('detected_rights')
    .update({
      status,
      status_note: note || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
