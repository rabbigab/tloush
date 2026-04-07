import { NextRequest, NextResponse } from 'next/server'
import { calculateNetSalary, type PayrollInput } from '@/lib/israeliPayroll'

export const dynamic = 'force-dynamic'

/**
 * POST /api/calculator
 * Public endpoint — no auth required (free tool for acquisition)
 * Calculates Israeli gross-to-net salary
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const grossMonthlySalary = Number(body.grossMonthlySalary)
    if (!grossMonthlySalary || grossMonthlySalary < 0 || grossMonthlySalary > 500_000) {
      return NextResponse.json({ error: 'Salaire brut invalide' }, { status: 400 })
    }

    const input: PayrollInput = {
      grossMonthlySalary,
      creditPoints: body.creditPoints ? Number(body.creditPoints) : undefined,
      pensionEmployeeRate: body.pensionEmployeeRate ? Number(body.pensionEmployeeRate) / 100 : undefined,
      pensionEmployerRate: body.pensionEmployerRate ? Number(body.pensionEmployerRate) / 100 : undefined,
      includeSeverance: body.includeSeverance ?? true,
      kerenHishtalmutEmployee: body.kerenHishtalmutEmployee ? Number(body.kerenHishtalmutEmployee) / 100 : undefined,
      kerenHishtalmutEmployer: body.kerenHishtalmutEmployer ? Number(body.kerenHishtalmutEmployer) / 100 : undefined,
    }

    const result = calculateNetSalary(input)

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Erreur de calcul' }, { status: 500 })
  }
}
