import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { scanUnclaimedBenefits, type DetectedBenefit } from '@/lib/rightsDetector'

// =====================================================
// GET /api/rights-detector
// Liste les droits detectes pour l'utilisateur (persistes en DB).
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
// Lance un scan complet via rightsDetector (base sur benefitsCatalog).
// =====================================================
export async function POST() {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  // Recuperer le profil enrichi
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

  // Scan avec le detecteur V2 (base sur benefitsCatalog.ts)
  // On filtre les benefices deja declares comme recus par l'utilisateur.
  const detected: DetectedBenefit[] = scanUnclaimedBenefits(profile)

  // Upsert dans detected_rights (preserve les status existants)
  const now = new Date().toISOString()
  for (const benefit of detected) {
    // Verifier si deja detecte (pour preserver le status)
    const { data: existing } = await supabase
      .from('detected_rights')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('right_slug', benefit.slug)
      .maybeSingle()

    await supabase
      .from('detected_rights')
      .upsert(
        {
          user_id: user.id,
          right_slug: benefit.slug,
          right_title_fr: benefit.title_fr,
          right_description_fr: benefit.description_fr,
          authority: benefit.authority,
          category: benefit.category,
          confidence_score: benefit.confidence_score,
          confidence_level: benefit.confidence_level,
          estimated_value: benefit.estimated_value,
          value_unit: benefit.value_unit,
          source: 'profile',  // V2 scanne essentiellement le profil
          source_doc_id: null,
          action_url: benefit.action_url,
          action_label: benefit.action_label,
          disclaimer: benefit.disclaimer || null,
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

  // Calculer la valeur totale potentielle
  const totalValue = detected.reduce((sum, b) => sum + (b.estimated_value || 0), 0)

  return NextResponse.json({
    rights: final || [],
    detected_count: detected.length,
    total_estimated_annual_value: totalValue,
    engine_version: 'v2',
  })
}

// =====================================================
// PATCH /api/rights-detector
// Met a jour le status d'un droit (claimed/dismissed).
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
