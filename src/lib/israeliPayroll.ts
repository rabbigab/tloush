/**
 * Israeli Payroll Calculator — 2025
 *
 * Calculates gross-to-net salary with all mandatory Israeli deductions:
 * - Income tax (mas hachnasa) with progressive brackets
 * - National Insurance (Bituah Leumi)
 * - Health Insurance (mas briut)
 * - Pension contributions
 * - Tax credit points (nekudot zikui)
 *
 * Sources:
 *   - Bituah Leumi official rates: https://www.btl.gov.il
 *   - Israel Tax Authority brackets: https://www.gov.il/he/departments/israel_tax_authority
 *   - Last verified: January 2025
 */

// ─── 2025 Tax Brackets (Annual Income) ───
// Source: Israel Tax Authority, effective January 2025
const TAX_BRACKETS_2025 = [
  { from: 0, to: 84_120, rate: 0.10 },
  { from: 84_120, to: 120_720, rate: 0.14 },
  { from: 120_720, to: 193_800, rate: 0.20 },
  { from: 193_800, to: 269_280, rate: 0.31 },
  { from: 269_280, to: 560_280, rate: 0.35 },
  { from: 560_280, to: 721_560, rate: 0.47 },
  { from: 721_560, to: Infinity, rate: 0.50 },
]
// Surtax (mas yoter): additional 3% above 721,560₪/year (effective 53%)
const SURTAX_THRESHOLD_ANNUAL = 721_560
const SURTAX_RATE = 0.03

// ─── Bituah Leumi (National Insurance) 2025 ───
// Employee rates - salaried workers
// Source: https://www.btl.gov.il — effective January 2025
// 60% of average wage (שכר ממוצע) = 12,536 × 0.6 = 7,522
const BL_RATES_2025 = {
  reducedThresholdMonthly: 7_522,  // 60% of average wage 2025
  reducedRate: 0.004,   // 0.4% employee NI (reduced bracket)
  normalRate: 0.07,     // 7% employee NI (normal bracket)
  maxInsurableMonthly: 50_695,     // 5× average wage ceiling 2025
}

// ─── Health Insurance (Mas Briut) 2025 ───
// Source: https://www.btl.gov.il — effective January 2025
const HEALTH_RATES_2025 = {
  reducedThresholdMonthly: 7_522,  // Same threshold as BL
  reducedRate: 0.0323,  // 3.23% (updated from 3.1%)
  normalRate: 0.052,    // 5.2% (updated from 5%)
  maxInsurableMonthly: 50_695,
}

// ─── Pension 2025 ───
const PENSION_RATES = {
  employeeRate: 0.06,     // 6% employee contribution
  employerRate: 0.065,    // 6.5% employer contribution
  severanceRate: 0.06,    // 6% employer severance (standard). Section 14 = 8.33% to cover full obligation
  severanceSection14Rate: 0.0833, // 8.33% under Section 14 (last salary × years)
}

// ─── Keren Hishtalmut default rates ───
const KEREN_HISHTALMUT_DEFAULTS = {
  employeeRate: 0.025, // 2.5%
  employerRate: 0.075, // 7.5%
  taxFreeYears: 6,     // Tax-free withdrawal after 6 years
  educationYears: 3,   // Early withdrawal for education after 3 years
  annualCeiling: 15_712, // Tax-free gains ceiling
}

// ─── Tax Credit Points (Nekudot Zikui) 2025 ───
// Value of one credit point per month
const CREDIT_POINT_VALUE_MONTHLY = 242 // ~₪2,904/year ÷ 12

// Default credit points for Israeli resident
const DEFAULT_CREDIT_POINTS = {
  resident: 2.25,    // All Israeli residents get 2.25 points
  woman_bonus: 0.5,  // Additional 0.5 for women
  new_oleh_year1: 3, // New olim: 3 extra points year 1 (total ~5.25)
  new_oleh_year2: 2, // 2 extra points year 2
  new_oleh_year3: 1, // 1 extra point year 3
}

// ─── Convalescence (Dmei Havra'a) 2025 ───
const HAVRA_A_DAILY_RATE = 418 // ₪/day
const HAVRA_A_DAYS_BY_SENIORITY = [
  { years: 1, days: 5 },
  { years: 2, days: 6 },
  { years: 3, days: 6 },
  { years: 4, days: 7 },
  { years: 5, days: 7 },
  { years: 6, days: 7 },
  { years: 7, days: 7 },
  { years: 8, days: 7 },
  { years: 9, days: 7 },
  { years: 10, days: 7 },
  { years: 11, days: 8 },
  { years: 15, days: 9 },
  { years: 20, days: 10 },
]

// ─── Minimum Wage 2025 ───
export const MINIMUM_WAGE = {
  monthly: 5_880.02,
  hourly: 32.30,
  dailyFullTime: 271.38, // 5 day work week
}

// ─── Overtime Rates ───
export const OVERTIME_RATES = {
  first2hours: 1.25,  // 125% for first 2 hours beyond 8h/day
  beyond: 1.50,       // 150% after that
  shabbat: 1.50,      // 150% on rest day (some agreements: 200%)
}

// ─── Vacation Days by Seniority ───
// Vacation days based on 6-day work week. For 5-day week, multiply by 5/6
const VACATION_DAYS_BY_SENIORITY = [
  { years: 1, days: 12 },  // Years 1-4
  { years: 5, days: 16 },
  { years: 6, days: 18 },
  { years: 7, days: 21 },
  { years: 8, days: 22 },  // 8+
  { years: 14, days: 28 }, // 14+ (max by law)
]

// ─── Notice Periods (Hoda'a Mukdemet) ───
// Required advance notice before termination
const NOTICE_PERIODS = [
  { months: 1, noticeDays: 1 },
  { months: 2, noticeDays: 2 },
  { months: 3, noticeDays: 3 },
  { months: 4, noticeDays: 4 },
  { months: 5, noticeDays: 5 },
  { months: 6, noticeDays: 6 },
  { months: 7, noticeDays: 7 + 2.5 * 1 },   // 6 days + 2.5 per additional month
  { months: 8, noticeDays: 7 + 2.5 * 2 },
  { months: 9, noticeDays: 7 + 2.5 * 3 },
  { months: 10, noticeDays: 7 + 2.5 * 4 },
  { months: 11, noticeDays: 7 + 2.5 * 5 },
  { months: 12, noticeDays: 30 },            // 1 month after 1 year
]

// ─── Maternity Leave ───
export const MATERNITY = {
  totalWeeks: 26,
  paidWeeks: 15,       // Paid by Bituah Leumi
  jobProtectionDays: 60, // Cannot fire 60 days after return
  paternityDays: 5,
  transferableWeeks: 6,  // Father can take up to 6 weeks from mother's allowance
}

// ─── Severance (Pitzuim) ───
export const SEVERANCE = {
  formula: 'last_monthly_salary × years_of_service',
  paymentDeadlineDays: 15,
  section14Rate: 0.0833,  // Monthly deposit that covers full obligation
  taxExemptPerYear: 13_750, // ₪13,750 per year of service
}

// ─── Sick Days ───
export const SICK_DAYS = {
  accrualPerMonth: 1.5,
  maxAccumulated: 90,
  day1Pay: 0,      // 0% first day
  day2_3Pay: 0.50, // 50% days 2-3
  day4PlusPay: 1,  // 100% day 4+
}

// ────────────────────────────────────────────────
// Core calculation types
// ────────────────────────────────────────────────

export interface PayrollInput {
  grossMonthlySalary: number
  creditPoints?: number       // Default: 2.25 (resident). Pass 2.75 for women, add oleh bonus etc.
  pensionEmployeeRate?: number // Default: 6%
  pensionEmployerRate?: number // Default: 6.5%
  includeSeverance?: boolean   // Default: true (Section 14)
  kerenHishtalmutEmployee?: number // Optional: e.g. 2.5%
  kerenHishtalmutEmployer?: number // Optional: e.g. 7.5%
}

export interface PayrollResult {
  gross: number

  // Deductions
  incomeTax: number
  bituahLeumi: number
  healthInsurance: number
  pensionEmployee: number
  kerenHishtalmutEmployee: number
  totalDeductions: number

  // Net
  net: number

  // Employer cost
  pensionEmployer: number
  severance: number
  kerenHishtalmutEmployer: number
  bituahLeumiEmployer: number
  totalEmployerCost: number

  // Effective rates
  effectiveTaxRate: number
  effectiveDeductionRate: number

  // Breakdown for display
  breakdown: {
    label: string
    amount: number
    type: 'earning' | 'deduction' | 'employer'
    rate?: string
  }[]
}

/**
 * Calculate net salary from gross monthly salary (Israeli payroll)
 */
export function calculateNetSalary(input: PayrollInput): PayrollResult {
  const gross = input.grossMonthlySalary
  const creditPoints = input.creditPoints ?? DEFAULT_CREDIT_POINTS.resident
  const pensionEmployeeRate = input.pensionEmployeeRate ?? PENSION_RATES.employeeRate
  const pensionEmployerRate = input.pensionEmployerRate ?? PENSION_RATES.employerRate
  const includeSeverance = input.includeSeverance ?? true
  const kerenHishtalmutEmployeeRate = input.kerenHishtalmutEmployee ?? 0
  const kerenHishtalmutEmployerRate = input.kerenHishtalmutEmployer ?? 0

  // 1. Income Tax
  const annualGross = gross * 12
  const annualTax = calculateIncomeTax(annualGross)
  const annualCreditValue = creditPoints * CREDIT_POINT_VALUE_MONTHLY * 12
  const monthlyTaxBeforeCredits = annualTax / 12
  const incomeTax = Math.max(0, monthlyTaxBeforeCredits - (annualCreditValue / 12))

  // 2. Bituah Leumi (Employee)
  const bituahLeumi = calculateBituahLeumi(gross)

  // 3. Health Insurance
  const healthInsurance = calculateHealthInsurance(gross)

  // 4. Pension (Employee)
  const pensionEmployee = Math.round(gross * pensionEmployeeRate * 100) / 100

  // 5. Keren Hishtalmut (Employee)
  const kerenHishtalmutEmployee = Math.round(gross * kerenHishtalmutEmployeeRate * 100) / 100

  // Total deductions
  const totalDeductions = round2(incomeTax + bituahLeumi + healthInsurance + pensionEmployee + kerenHishtalmutEmployee)

  // Net salary
  const net = round2(gross - totalDeductions)

  // Employer costs
  const pensionEmployer = round2(gross * pensionEmployerRate)
  const severance = includeSeverance ? round2(gross * PENSION_RATES.severanceRate) : 0
  const kerenHishtalmutEmployer = round2(gross * kerenHishtalmutEmployerRate)

  // Employer BL rate is approximately 3.55% (reduced) / 7.6% (normal)
  const blEmployer = calculateBituahLeumiEmployer(gross)

  const totalEmployerCost = round2(gross + pensionEmployer + severance + kerenHishtalmutEmployer + blEmployer)

  // Build breakdown
  const breakdown: PayrollResult['breakdown'] = [
    { label: 'Salaire brut', amount: gross, type: 'earning' },
    { label: 'Impôt sur le revenu (מס הכנסה)', amount: -incomeTax, type: 'deduction', rate: `${((incomeTax / gross) * 100).toFixed(1)}%` },
    { label: 'Bituah Leumi (ביטוח לאומי)', amount: -bituahLeumi, type: 'deduction', rate: `${((bituahLeumi / gross) * 100).toFixed(1)}%` },
    { label: 'Assurance santé (מס בריאות)', amount: -healthInsurance, type: 'deduction', rate: `${((healthInsurance / gross) * 100).toFixed(1)}%` },
    { label: 'Pension employé (פנסיה)', amount: -pensionEmployee, type: 'deduction', rate: `${(pensionEmployeeRate * 100).toFixed(1)}%` },
  ]

  if (kerenHishtalmutEmployee > 0) {
    breakdown.push({
      label: 'Keren Hishtalmut (קרן השתלמות)',
      amount: -kerenHishtalmutEmployee,
      type: 'deduction',
      rate: `${(kerenHishtalmutEmployeeRate * 100).toFixed(1)}%`,
    })
  }

  breakdown.push(
    { label: 'Salaire net', amount: net, type: 'earning' },
    { label: 'Pension employeur', amount: pensionEmployer, type: 'employer', rate: `${(pensionEmployerRate * 100).toFixed(1)}%` },
  )

  if (includeSeverance) {
    breakdown.push({ label: 'Pitzouim / Section 14', amount: severance, type: 'employer', rate: '8.33%' })
  }
  if (kerenHishtalmutEmployer > 0) {
    breakdown.push({ label: 'Keren Hishtalmut employeur', amount: kerenHishtalmutEmployer, type: 'employer', rate: `${(kerenHishtalmutEmployerRate * 100).toFixed(1)}%` })
  }
  breakdown.push(
    { label: 'Bituah Leumi employeur', amount: blEmployer, type: 'employer' },
    { label: 'Coût total employeur', amount: totalEmployerCost, type: 'employer' },
  )

  return {
    gross,
    incomeTax: round2(incomeTax),
    bituahLeumi: round2(bituahLeumi),
    healthInsurance: round2(healthInsurance),
    pensionEmployee,
    kerenHishtalmutEmployee,
    totalDeductions,
    net,
    pensionEmployer,
    severance,
    kerenHishtalmutEmployer,
    bituahLeumiEmployer: blEmployer,
    totalEmployerCost,
    effectiveTaxRate: round2((incomeTax / gross) * 100),
    effectiveDeductionRate: round2((totalDeductions / gross) * 100),
    breakdown,
  }
}

// ────────────────────────────────────────────────
// Internal calculation functions
// ────────────────────────────────────────────────

function calculateIncomeTax(annualGross: number): number {
  let tax = 0
  for (const bracket of TAX_BRACKETS_2025) {
    if (annualGross <= bracket.from) break
    const taxableInBracket = Math.min(annualGross, bracket.to) - bracket.from
    tax += taxableInBracket * bracket.rate
  }
  // Surtax (mas yoter) for high earners
  if (annualGross > SURTAX_THRESHOLD_ANNUAL) {
    tax += (annualGross - SURTAX_THRESHOLD_ANNUAL) * SURTAX_RATE
  }
  return tax
}

function calculateBituahLeumi(monthlyGross: number): number {
  const capped = Math.min(monthlyGross, BL_RATES_2025.maxInsurableMonthly)
  const threshold = BL_RATES_2025.reducedThresholdMonthly

  if (capped <= threshold) {
    return round2(capped * BL_RATES_2025.reducedRate)
  }

  const reducedPart = threshold * BL_RATES_2025.reducedRate
  const normalPart = (capped - threshold) * BL_RATES_2025.normalRate
  return round2(reducedPart + normalPart)
}

function calculateBituahLeumiEmployer(monthlyGross: number): number {
  const capped = Math.min(monthlyGross, BL_RATES_2025.maxInsurableMonthly)
  const threshold = BL_RATES_2025.reducedThresholdMonthly

  // Employer rates: NI + health (separate, then combined)
  // Source: Bituah Leumi employer rates 2025
  const reducedRateEmployer = 0.0355 + 0.0323  // 3.55% NI + 3.23% health = 6.78%
  const normalRateEmployer = 0.076 + 0.052     // 7.6% NI + 5.2% health = 12.8%

  if (capped <= threshold) {
    return round2(capped * reducedRateEmployer)
  }

  const reducedPart = threshold * reducedRateEmployer
  const normalPart = (capped - threshold) * normalRateEmployer
  return round2(reducedPart + normalPart)
}

function calculateHealthInsurance(monthlyGross: number): number {
  const capped = Math.min(monthlyGross, HEALTH_RATES_2025.maxInsurableMonthly)
  const threshold = HEALTH_RATES_2025.reducedThresholdMonthly

  if (capped <= threshold) {
    return round2(capped * HEALTH_RATES_2025.reducedRate)
  }

  const reducedPart = threshold * HEALTH_RATES_2025.reducedRate
  const normalPart = (capped - threshold) * HEALTH_RATES_2025.normalRate
  return round2(reducedPart + normalPart)
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// ────────────────────────────────────────────────
// Payslip verification
// ────────────────────────────────────────────────

export interface PayslipVerification {
  level: 'ok' | 'info' | 'warning' | 'critical'
  title: string
  description: string
  expected?: number
  actual?: number
  difference?: number
}

/**
 * Verify a parsed payslip against calculated values.
 * Takes the extracted data from Claude's analysis and compares it
 * to what the calculator says the values should be.
 */
export function verifyPayslip(payslipData: {
  grossSalary: number
  netSalary?: number
  incomeTax?: number
  bituahLeumi?: number
  healthInsurance?: number
  pensionEmployee?: number
  hourlyRate?: number
  hoursWorked?: number
  overtimeHours125?: number
  overtimeRate125?: number
  overtimeHours150?: number
  overtimeRate150?: number
  creditPoints?: number
  seniorityYears?: number
  vacationDays?: number
  sickDaysBalance?: number
}): PayslipVerification[] {
  const checks: PayslipVerification[] = []
  const calc = calculateNetSalary({
    grossMonthlySalary: payslipData.grossSalary,
    creditPoints: payslipData.creditPoints,
  })

  // 1. Check minimum wage
  if (payslipData.hourlyRate && payslipData.hourlyRate < MINIMUM_WAGE.hourly) {
    checks.push({
      level: 'critical',
      title: 'Taux horaire inférieur au SMIC israélien',
      description: `Taux horaire : ${payslipData.hourlyRate}₪/h. Le minimum légal est ${MINIMUM_WAGE.hourly}₪/h (${MINIMUM_WAGE.monthly}₪/mois).`,
      expected: MINIMUM_WAGE.hourly,
      actual: payslipData.hourlyRate,
    })
  }

  // 2. Check net salary
  if (payslipData.netSalary) {
    const diff = Math.abs(calc.net - payslipData.netSalary)
    const pct = (diff / calc.net) * 100
    if (pct > 5) {
      checks.push({
        level: pct > 15 ? 'critical' : 'warning',
        title: 'Écart significatif sur le salaire net',
        description: `Net affiché : ${payslipData.netSalary}₪. Notre calcul donne ${calc.net}₪ (écart de ${diff.toFixed(0)}₪ soit ${pct.toFixed(1)}%). Vérifiez les déductions.`,
        expected: calc.net,
        actual: payslipData.netSalary,
        difference: diff,
      })
    } else if (diff > 50) {
      checks.push({
        level: 'info',
        title: 'Léger écart sur le salaire net',
        description: `Net affiché : ${payslipData.netSalary}₪ vs calculé : ${calc.net}₪ (écart de ${diff.toFixed(0)}₪). Probablement dû à des déductions spécifiques.`,
        expected: calc.net,
        actual: payslipData.netSalary,
        difference: diff,
      })
    }
  }

  // 3. Check income tax
  if (payslipData.incomeTax !== undefined) {
    const diff = Math.abs(calc.incomeTax - payslipData.incomeTax)
    if (diff > 100) {
      checks.push({
        level: diff > 500 ? 'warning' : 'info',
        title: 'Écart sur l\'impôt sur le revenu',
        description: `Impôt affiché : ${payslipData.incomeTax}₪ vs calculé : ${calc.incomeTax}₪. La différence peut provenir de nekudot zikui supplémentaires ou d'un palier fiscal.`,
        expected: calc.incomeTax,
        actual: payslipData.incomeTax,
        difference: diff,
      })
    }
  }

  // 4. Check Bituah Leumi
  if (payslipData.bituahLeumi !== undefined) {
    const diff = Math.abs(calc.bituahLeumi - payslipData.bituahLeumi)
    if (diff > 50) {
      checks.push({
        level: 'warning',
        title: 'Écart sur le Bituah Leumi',
        description: `BL affiché : ${payslipData.bituahLeumi}₪ vs calculé : ${calc.bituahLeumi}₪.`,
        expected: calc.bituahLeumi,
        actual: payslipData.bituahLeumi,
        difference: diff,
      })
    }
  }

  // 5. Check overtime rates
  if (payslipData.hourlyRate && payslipData.overtimeRate125) {
    const expected125 = round2(payslipData.hourlyRate * OVERTIME_RATES.first2hours)
    if (Math.abs(payslipData.overtimeRate125 - expected125) > 0.5) {
      checks.push({
        level: 'warning',
        title: 'Taux heures sup 125% incorrect',
        description: `Taux 125% affiché : ${payslipData.overtimeRate125}₪. Attendu : ${expected125}₪ (${payslipData.hourlyRate}₪ × 1.25).`,
        expected: expected125,
        actual: payslipData.overtimeRate125,
      })
    }
  }

  if (payslipData.hourlyRate && payslipData.overtimeRate150) {
    const expected150 = round2(payslipData.hourlyRate * OVERTIME_RATES.beyond)
    if (Math.abs(payslipData.overtimeRate150 - expected150) > 0.5) {
      checks.push({
        level: 'warning',
        title: 'Taux heures sup 150% incorrect',
        description: `Taux 150% affiché : ${payslipData.overtimeRate150}₪. Attendu : ${expected150}₪ (${payslipData.hourlyRate}₪ × 1.50).`,
        expected: expected150,
        actual: payslipData.overtimeRate150,
      })
    }
  }

  // 6. Check vacation days entitlement
  if (payslipData.seniorityYears && payslipData.vacationDays !== undefined) {
    const entitled = getVacationDaysEntitlement(payslipData.seniorityYears)
    if (payslipData.vacationDays < entitled) {
      checks.push({
        level: 'warning',
        title: 'Solde congés inférieur au droit légal',
        description: `Avec ${payslipData.seniorityYears} ans d'ancienneté, vous avez droit à ${entitled} jours/an minimum. Votre solde montre ${payslipData.vacationDays} jours.`,
        expected: entitled,
        actual: payslipData.vacationDays,
      })
    }
  }

  // 7. Check pension deduction exists
  if (payslipData.pensionEmployee === undefined || payslipData.pensionEmployee === 0) {
    checks.push({
      level: 'warning',
      title: 'Aucune cotisation pension détectée',
      description: 'La cotisation pension obligatoire (~6% employé) n\'apparaît pas. Si vous avez plus de 6 mois d\'ancienneté, c\'est une anomalie.',
    })
  }

  // If no issues found
  if (checks.length === 0) {
    checks.push({
      level: 'ok',
      title: 'Fiche de paie conforme',
      description: 'Tous les montants correspondent à nos calculs. Aucune anomalie détectée.',
    })
  }

  return checks
}

// ────────────────────────────────────────────────
// Helper functions (exported for use elsewhere)
// ────────────────────────────────────────────────

export function getVacationDaysEntitlement(seniorityYears: number): number {
  let days = 12
  for (const entry of VACATION_DAYS_BY_SENIORITY) {
    if (seniorityYears >= entry.years) days = entry.days
  }
  return days
}

export function getHavraaEntitlement(seniorityYears: number): { days: number; amount: number } {
  let days = 5
  for (const entry of HAVRA_A_DAYS_BY_SENIORITY) {
    if (seniorityYears >= entry.years) days = entry.days
  }
  return { days, amount: round2(days * HAVRA_A_DAILY_RATE) }
}

export function getSickDayPayRate(dayNumber: number): number {
  if (dayNumber <= 1) return SICK_DAYS.day1Pay
  if (dayNumber <= 3) return SICK_DAYS.day2_3Pay
  return SICK_DAYS.day4PlusPay
}

export function getNoticePeriodDays(monthsEmployed: number): number {
  if (monthsEmployed >= 12) return 30
  for (let i = NOTICE_PERIODS.length - 1; i >= 0; i--) {
    if (monthsEmployed >= NOTICE_PERIODS[i].months) return Math.round(NOTICE_PERIODS[i].noticeDays)
  }
  return 1
}

export function calculateSeverance(lastMonthlySalary: number, yearsOfService: number): {
  total: number
  taxExempt: number
  taxable: number
} {
  const total = round2(lastMonthlySalary * yearsOfService)
  const taxExempt = round2(SEVERANCE.taxExemptPerYear * yearsOfService)
  return { total, taxExempt, taxable: Math.max(0, round2(total - taxExempt)) }
}

export { TAX_BRACKETS_2025, BL_RATES_2025, HEALTH_RATES_2025, PENSION_RATES, DEFAULT_CREDIT_POINTS, CREDIT_POINT_VALUE_MONTHLY, KEREN_HISHTALMUT_DEFAULTS, NOTICE_PERIODS }
