import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { estimateTaxRefund } from '@/lib/taxRefund'

// =====================================================
// POST /api/tax-refund/estimate
// Calcule l'estimation de remboursement d'impot
// =====================================================
export async function POST(req: Request) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  const body = await req.json().catch(() => ({}))
  const { tax_year, gross_annual, tax_paid, credit_points_used } = body

  // Validation
  if (!tax_year || typeof tax_year !== 'number') {
    return NextResponse.json({ error: 'tax_year requis' }, { status: 400 })
  }
  if (!gross_annual || typeof gross_annual !== 'number' || gross_annual < 0) {
    return NextResponse.json({ error: 'gross_annual invalide' }, { status: 400 })
  }
  if (typeof tax_paid !== 'number' || tax_paid < 0) {
    return NextResponse.json({ error: 'tax_paid invalide' }, { status: 400 })
  }
  if (typeof credit_points_used !== 'number' || credit_points_used < 0) {
    return NextResponse.json({ error: 'credit_points_used invalide' }, { status: 400 })
  }

  // Recuperer le profil pour les points de credit
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // Le profil est requis pour le calcul
  if (!profile) {
    return NextResponse.json(
      { error: 'Vous devez d\'abord completer votre profil pour utiliser cet outil.', needs_profile: true },
      { status: 400 }
    )
  }

  // Deduire le genre depuis user_metadata si possible (simplifie)
  // TODO : ajouter un champ gender au profil si necessaire

  const result = estimateTaxRefund({
    taxYear: tax_year,
    grossAnnual: gross_annual,
    taxPaid: tax_paid,
    creditPointsUsed: credit_points_used,
    profile: {
      aliyahYear: profile.aliyah_year,
      childrenCount: profile.children_count,
      childrenBirthDates: profile.children_birth_dates || [],
      maritalStatus: profile.marital_status,
    },
  })

  return NextResponse.json({ result })
}
