import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { buildTimeline, extractPayslipData, getAvailableYears, type PayslipMonth } from '@/lib/payslipTimeline'

// =====================================================
// GET /api/payslips/annual?year=2025
// Retourne la timeline annuelle des fiches de paie
// =====================================================
export async function GET(req: Request) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  const url = new URL(req.url)
  const yearParam = url.searchParams.get('year')
  const year = yearParam ? Number(yearParam) : new Date().getFullYear()

  // Recuperer toutes les fiches de paie de l'utilisateur
  const { data: documents, error } = await supabase
    .from('documents')
    .select('id, period, analysis_data, created_at')
    .eq('user_id', user.id)
    .eq('document_type', 'payslip')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Extraire les donnees normalisees
  const months: PayslipMonth[] = []
  for (const doc of documents || []) {
    const extracted = extractPayslipData(doc as {
      id: string
      period: string | null
      analysis_data: Record<string, unknown> | null
    })
    if (extracted) months.push(extracted)
  }

  // Deduplication (meme periode = garder le plus recent)
  const byKey = new Map<string, PayslipMonth>()
  for (const m of months) {
    const key = `${m.year}-${m.month}`
    if (!byKey.has(key)) byKey.set(key, m)
  }
  const unique = Array.from(byKey.values())

  // Construire la timeline pour l'annee demandee
  const timeline = buildTimeline(unique, year)
  const availableYears = getAvailableYears(unique)

  return NextResponse.json({
    year,
    availableYears,
    ...timeline,
  })
}
