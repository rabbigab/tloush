import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { computeMiluimCompensation } from '@/lib/miluim'

// =====================================================
// GET /api/miluim
// Liste les periodes de miluim de l'utilisateur
// =====================================================
export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  const { data, error } = await supabase
    .from('miluim_periods')
    .select('*')
    .eq('user_id', user.id)
    .order('start_date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Calculer les agregats
  const now = new Date()
  const threeYearsAgo = new Date(now)
  threeYearsAgo.setFullYear(now.getFullYear() - 3)

  const periods = data || []
  const totalDaysAllTime = periods.reduce((s, p) => s + (p.days_count || 0), 0)
  const totalDays3Years = periods
    .filter(p => new Date(p.start_date) >= threeYearsAgo)
    .reduce((s, p) => s + (p.days_count || 0), 0)
  const totalDays12Months = periods
    .filter(p => {
      const d = new Date(p.start_date)
      const oneYearAgo = new Date(now)
      oneYearAgo.setFullYear(now.getFullYear() - 1)
      return d >= oneYearAgo
    })
    .reduce((s, p) => s + (p.days_count || 0), 0)
  const totalCompensation = periods.reduce((s, p) => s + Number(p.total_compensation || 0), 0)

  return NextResponse.json({
    periods,
    summary: {
      totalDaysAllTime,
      totalDays12Months,
      totalDays3Years,
      totalCompensation,
    },
  })
}

// =====================================================
// POST /api/miluim
// Ajoute une nouvelle periode de miluim
// =====================================================
export async function POST(req: Request) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  const body = await req.json().catch(() => ({}))
  const {
    start_date,
    end_date,
    unit,
    service_type,
    tzav_document_id,
    notes,
    monthly_avg_salary,
  } = body

  // Validation
  if (!start_date || !end_date) {
    return NextResponse.json({ error: 'Dates requises' }, { status: 400 })
  }

  const start = new Date(start_date)
  const end = new Date(end_date)
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return NextResponse.json({ error: 'Dates invalides' }, { status: 400 })
  }

  const daysCount = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

  // Calcul compensation estimee si salaire fourni
  let dailyCompensation: number | null = null
  let totalCompensation: number | null = null
  if (monthly_avg_salary && !isNaN(Number(monthly_avg_salary))) {
    const result = computeMiluimCompensation({
      monthlyAvgSalary: Number(monthly_avg_salary),
      daysServed: daysCount,
      year: start.getFullYear(),
    })
    dailyCompensation = result.dailyRate
    totalCompensation = result.totalCompensation
  }

  const { data, error } = await supabase
    .from('miluim_periods')
    .insert({
      user_id: user.id,
      start_date,
      end_date,
      unit: unit || null,
      service_type: service_type || null,
      tzav_document_id: tzav_document_id || null,
      notes: notes || null,
      daily_compensation: dailyCompensation,
      total_compensation: totalCompensation,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ period: data })
}

// =====================================================
// DELETE /api/miluim?id=xxx
// Supprime une periode
// =====================================================
export async function DELETE(req: Request) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

  const { error } = await supabase
    .from('miluim_periods')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
