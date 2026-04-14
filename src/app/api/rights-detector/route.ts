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
    console.error('[rights-detector GET] fetch failed:', error)
    if (error.message?.includes('does not exist') || error.code === '42P01') {
      return NextResponse.json(
        {
          error: 'La table detected_rights n\'existe pas. Appliquez la migration 20260417_rights_detector.sql via Supabase SQL Editor.',
          db_error: error.message,
        },
        { status: 500 }
      )
    }
    return NextResponse.json({ error: error.message, db_error: error.message }, { status: 500 })
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

  // 1. Recuperer le profil enrichi — avec check d'erreur explicite
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('[rights-detector POST] profile fetch failed:', profileError)
    return NextResponse.json(
      {
        error: `Impossible de lire le profil : ${profileError.message}. La migration 20260418_profile_enrichment_v2.sql est peut-etre manquante.`,
        db_error: profileError.message,
        db_code: profileError.code,
      },
      { status: 500 }
    )
  }

  if (!profile) {
    return NextResponse.json(
      { error: 'Vous devez d\'abord sauvegarder votre profil (au moins un champ).', needs_profile: true },
      { status: 400 }
    )
  }

  // 2. Scan avec le detecteur V2 (base sur benefitsCatalog.ts)
  const detected: DetectedBenefit[] = scanUnclaimedBenefits(profile)

  if (detected.length === 0) {
    // Aucun match — on vide la table et on retourne vide
    console.log('[rights-detector POST] no benefits matched for user', user.id)
    return NextResponse.json({
      rights: [],
      detected_count: 0,
      total_estimated_annual_value: 0,
      engine_version: 'v2',
      message: 'Aucun droit detecte pour votre profil actuel. Completez plus de champs (alyah, enfants, emploi, sante) pour debloquer plus de resultats.',
    })
  }

  // 3. Recuperer les status existants en 1 seule query (preserve claimed/dismissed)
  const { data: existingRows, error: existingError } = await supabase
    .from('detected_rights')
    .select('right_slug, status')
    .eq('user_id', user.id)

  if (existingError) {
    console.error('[rights-detector POST] existing rights fetch failed:', existingError)
    // Erreur probablement due a migration manquante
    if (existingError.message?.includes('does not exist') || existingError.code === '42P01') {
      return NextResponse.json(
        {
          error: 'La table detected_rights n\'existe pas. Appliquez la migration 20260417_rights_detector.sql via Supabase SQL Editor.',
          db_error: existingError.message,
        },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: existingError.message, db_error: existingError.message },
      { status: 500 }
    )
  }

  const existingMap = new Map(
    (existingRows || []).map(r => [r.right_slug, r.status])
  )

  // 4. Upsert en BATCH (1 seule query au lieu de 33)
  const now = new Date().toISOString()
  const rowsToUpsert = detected.map(benefit => ({
    user_id: user.id,
    right_slug: benefit.slug,
    right_title_fr: benefit.title_fr,
    right_description_fr: benefit.description_fr,
    authority: benefit.authority,
    category: benefit.category,
    // Round a 2 decimales pour garantir NUMERIC(3,2) safe
    confidence_score: Math.min(1, Math.max(0, Math.round(benefit.confidence_score * 100) / 100)),
    confidence_level: benefit.confidence_level,
    estimated_value: benefit.estimated_value,
    value_unit: benefit.value_unit,
    source: 'profile' as const,
    source_doc_id: null,
    action_url: benefit.action_url,
    action_label: benefit.action_label,
    disclaimer: benefit.disclaimer || null,
    status: existingMap.get(benefit.slug) || 'suggested',
    detected_at: now,
    updated_at: now,
  }))

  const { error: upsertError } = await supabase
    .from('detected_rights')
    .upsert(rowsToUpsert, { onConflict: 'user_id,right_slug' })

  if (upsertError) {
    console.error('[rights-detector POST] batch upsert failed:', {
      code: upsertError.code,
      message: upsertError.message,
      details: upsertError.details,
      hint: upsertError.hint,
      rowCount: rowsToUpsert.length,
      firstRow: rowsToUpsert[0],
    })
    return NextResponse.json(
      {
        error: `Echec de la sauvegarde des droits : ${upsertError.message}`,
        db_error: upsertError.message,
        db_code: upsertError.code,
      },
      { status: 500 }
    )
  }

  // 4b. Supprimer les droits obsoletes — ceux qui etaient en DB mais plus
  // detectes par le moteur (apres changement de profil ou correction d'une
  // regle). On preserve les lignes dont le user a un statut non-suggested
  // (claimed/dismissed/verified) pour ne pas effacer son historique.
  const detectedSlugs = new Set(detected.map(b => b.slug))
  const staleSlugs = (existingRows || [])
    .filter(row => !detectedSlugs.has(row.right_slug) && row.status === 'suggested')
    .map(row => row.right_slug)

  if (staleSlugs.length > 0) {
    const { error: deleteError } = await supabase
      .from('detected_rights')
      .delete()
      .eq('user_id', user.id)
      .in('right_slug', staleSlugs)

    if (deleteError) {
      console.error('[rights-detector POST] stale rights delete failed:', deleteError)
      // Non-bloquant : on continue avec les bonnes donnees upsert
    }
  }

  // 5. Retourner la liste a jour
  const { data: final, error: finalError } = await supabase
    .from('detected_rights')
    .select('*')
    .eq('user_id', user.id)
    .order('confidence_score', { ascending: false })

  if (finalError) {
    console.error('[rights-detector POST] final fetch failed:', finalError)
    return NextResponse.json(
      { error: finalError.message },
      { status: 500 }
    )
  }

  // Ne comptabiliser dans le total annuel QUE les benefices recurrents
  // (unite /an ou /mois). Les economies one-shot (mashkanta, reduction achat...)
  // sont affichees sur leur carte mais exclues du total pour ne pas gonfler
  // artificiellement la "valeur annuelle potentielle".
  const isAnnualRecurring = (unit: string | undefined | null): boolean => {
    if (!unit) return false
    const u = unit.toLowerCase()
    return u.includes('/an') || u.includes('/mois') || u.includes('/year') || u.includes('/month')
  }
  const totalValue = detected.reduce((sum, b) => {
    if (!b.estimated_value) return sum
    if (!isAnnualRecurring(b.value_unit)) return sum
    // Si /mois → convertir en annuel
    const u = (b.value_unit || '').toLowerCase()
    const multiplier = u.includes('/mois') || u.includes('/month') ? 12 : 1
    return sum + b.estimated_value * multiplier
  }, 0)

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
