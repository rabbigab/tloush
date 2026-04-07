/**
 * Israeli Employee Rights Engine 2024-2025
 *
 * Calculates all mandatory employee rights based on seniority,
 * work schedule, and Israeli labor law.
 *
 * Sources:
 * - Israeli Employment Law (חוק עבודה)
 * - Annual Leave Law (חוק חופשה שנתית)
 * - Sick Pay Law (חוק דמי מחלה)
 * - Severance Pay Law (חוק פיצויי פיטורים)
 * - Hours of Work and Rest Law (חוק שעות עבודה ומנוחה)
 * - skills-il/legal-tech/israeli-workplace-rights-navigator
 */

import {
  MINIMUM_WAGE,
  OVERTIME_RATES,
  SICK_DAYS,
  PENSION_RATES,
  SEVERANCE,
  MATERNITY,
  getVacationDaysEntitlement,
  getHavraaEntitlement,
  getNoticePeriodDays,
  calculateSeverance,
  CREDIT_POINT_VALUE_MONTHLY,
  DEFAULT_CREDIT_POINTS,
} from './israeliPayroll'

// ─── Input type ───

export interface EmployeeProfile {
  seniorityYears: number       // Years at current employer
  seniorityMonths?: number     // Additional months (for partial years)
  workDaysPerWeek: 5 | 6      // 5-day or 6-day work week
  hoursPerDay: number          // Standard daily hours (typically 8-9)
  monthlySalary: number        // Current gross monthly salary
  hourlyRate?: number          // If hourly worker
  isWoman?: boolean
  isNewOleh?: boolean
  aliyahYear?: number          // Year of aliyah (for credit points)
  hasChildren?: boolean
  numberOfChildren?: number
  isSingleParent?: boolean
  isDisabled?: boolean
  hasPension?: boolean
  hasKerenHishtalmut?: boolean
  employmentType: 'full_time' | 'part_time' | 'hourly'
}

// ─── Output types ───

export interface RightsResult {
  vacation: VacationRights
  sickLeave: SickLeaveRights
  convalescence: ConvalescenceRights
  overtime: OvertimeRights
  pension: PensionRights
  severance: SeveranceRights
  notice: NoticeRights
  maternity: MaternityRights
  minimumWage: MinimumWageCheck
  creditPoints: CreditPointsInfo
  summary: RightsSummary[]
}

interface VacationRights {
  annualDays: number
  adjustedForWorkWeek: number // Adjusted for 5-day week if applicable
  dailyRate: number           // Salary / work days per month
  annualValue: number
  law: string
}

interface SickLeaveRights {
  monthlyAccrual: number
  maxAccumulated: number
  currentEstimate: number     // Based on seniority
  payRules: { day: string; rate: string }[]
  law: string
}

interface ConvalescenceRights {
  days: number
  dailyRate: number
  annualAmount: number
  law: string
}

interface OvertimeRights {
  maxDailyHours: number
  rate125: number            // ₪/hour at 125%
  rate150: number            // ₪/hour at 150%
  standardWeeklyHours: number
  maxOvertimePerDay: number
  law: string
}

interface PensionRights {
  isRequired: boolean
  employeeRate: number
  employerRate: number
  severanceRate: number
  monthlyEmployeeAmount: number
  monthlyEmployerAmount: number
  monthlySeveranceAmount: number
  totalMonthly: number
  law: string
}

interface SeveranceRights {
  isEligible: boolean
  estimatedAmount: number
  taxExempt: number
  taxable: number
  formula: string
  section14Covered: boolean
  law: string
}

interface NoticeRights {
  employeeDays: number
  employerDays: number
  law: string
}

interface MaternityRights {
  totalWeeks: number
  paidWeeks: number
  paidBy: string
  jobProtectionDays: number
  paternityDays: number
  law: string
}

interface MinimumWageCheck {
  currentMinimumMonthly: number
  currentMinimumHourly: number
  isAboveMinimum: boolean
  gap: number                // Positive = above, negative = below
}

interface CreditPointsInfo {
  basePoints: number
  bonusPoints: number
  totalPoints: number
  monthlyValue: number
  annualValue: number
  details: string[]
}

interface RightsSummary {
  category: string
  title: string
  value: string
  status: 'ok' | 'info' | 'warning' | 'critical'
  description: string
}

// ─── Main calculation ───

export function calculateEmployeeRights(profile: EmployeeProfile): RightsResult {
  const totalMonths = (profile.seniorityYears * 12) + (profile.seniorityMonths || 0)
  const totalYears = totalMonths / 12
  const baseHourlyRate = profile.hourlyRate || (profile.monthlySalary / (profile.hoursPerDay * (profile.workDaysPerWeek === 5 ? 21.67 : 25)))

  // ─── Vacation ───
  const rawVacationDays = getVacationDaysEntitlement(profile.seniorityYears)
  const adjustedVacation = profile.workDaysPerWeek === 5
    ? Math.round(rawVacationDays * 5 / 6)
    : rawVacationDays
  const workDaysPerMonth = profile.workDaysPerWeek === 5 ? 21.67 : 25
  const dailyRate = profile.monthlySalary / workDaysPerMonth

  const vacation: VacationRights = {
    annualDays: rawVacationDays,
    adjustedForWorkWeek: adjustedVacation,
    dailyRate: round2(dailyRate),
    annualValue: round2(adjustedVacation * dailyRate),
    law: 'חוק חופשה שנתית, תשי"א-1951',
  }

  // ─── Sick Leave ───
  const estimatedSickDays = Math.min(
    totalMonths * SICK_DAYS.accrualPerMonth,
    SICK_DAYS.maxAccumulated
  )

  const sickLeave: SickLeaveRights = {
    monthlyAccrual: SICK_DAYS.accrualPerMonth,
    maxAccumulated: SICK_DAYS.maxAccumulated,
    currentEstimate: round2(estimatedSickDays),
    payRules: [
      { day: 'Jour 1', rate: '0% (non payé)' },
      { day: 'Jours 2-3', rate: '50% du salaire' },
      { day: 'Jour 4+', rate: '100% du salaire' },
    ],
    law: 'חוק דמי מחלה, תשל"ו-1976',
  }

  // ─── Convalescence (Havra'a) ───
  const havraa = getHavraaEntitlement(profile.seniorityYears)
  const convalescence: ConvalescenceRights = {
    days: havraa.days,
    dailyRate: 418,
    annualAmount: havraa.amount,
    law: 'צו הרחבה בדבר תשלום דמי הבראה',
  }

  // ─── Overtime ───
  const overtime: OvertimeRights = {
    maxDailyHours: profile.hoursPerDay + 4,
    rate125: round2(baseHourlyRate * OVERTIME_RATES.first2hours),
    rate150: round2(baseHourlyRate * OVERTIME_RATES.beyond),
    standardWeeklyHours: 42,
    maxOvertimePerDay: 4,
    law: 'חוק שעות עבודה ומנוחה, תשי"א-1951',
  }

  // ─── Pension ───
  const pensionRequired = totalMonths >= 6
  const pension: PensionRights = {
    isRequired: pensionRequired,
    employeeRate: PENSION_RATES.employeeRate,
    employerRate: PENSION_RATES.employerRate,
    severanceRate: PENSION_RATES.severanceRate,
    monthlyEmployeeAmount: round2(profile.monthlySalary * PENSION_RATES.employeeRate),
    monthlyEmployerAmount: round2(profile.monthlySalary * PENSION_RATES.employerRate),
    monthlySeveranceAmount: round2(profile.monthlySalary * PENSION_RATES.severanceRate),
    totalMonthly: round2(profile.monthlySalary * (PENSION_RATES.employeeRate + PENSION_RATES.employerRate + PENSION_RATES.severanceRate)),
    law: 'צו הרחבה לביטוח פנסיוני מקיף במשק',
  }

  // ─── Severance ───
  const severanceCalc = calculateSeverance(profile.monthlySalary, totalYears)
  const severance: SeveranceRights = {
    isEligible: totalYears >= 1,
    estimatedAmount: severanceCalc.total,
    taxExempt: severanceCalc.taxExempt,
    taxable: severanceCalc.taxable,
    formula: `${profile.monthlySalary}₪ × ${totalYears.toFixed(1)} ans = ${severanceCalc.total}₪`,
    section14Covered: profile.hasPension || false,
    law: 'חוק פיצויי פיטורים, תשכ"ג-1963',
  }

  // ─── Notice Period ───
  const noticeDays = getNoticePeriodDays(totalMonths)
  const notice: NoticeRights = {
    employeeDays: noticeDays,
    employerDays: noticeDays, // Same for employer (symmetric by law)
    law: 'חוק הודעה מוקדמת לפיטורים ולהתפטרות, תשס"א-2001',
  }

  // ─── Maternity ───
  const maternity: MaternityRights = {
    totalWeeks: MATERNITY.totalWeeks,
    paidWeeks: MATERNITY.paidWeeks,
    paidBy: 'Bituach Leumi (ביטוח לאומי)',
    jobProtectionDays: MATERNITY.jobProtectionDays,
    paternityDays: MATERNITY.paternityDays,
    law: 'חוק עבודת נשים, תשי"ד-1954',
  }

  // ─── Minimum Wage Check ───
  const isAboveMinimum = profile.monthlySalary >= MINIMUM_WAGE.monthly
  const minimumWage: MinimumWageCheck = {
    currentMinimumMonthly: MINIMUM_WAGE.monthly,
    currentMinimumHourly: MINIMUM_WAGE.hourly,
    isAboveMinimum,
    gap: round2(profile.monthlySalary - MINIMUM_WAGE.monthly),
  }

  // ─── Credit Points ───
  const creditPoints = calculateCreditPoints(profile)

  // ─── Summary ───
  const summary = buildSummary(profile, {
    vacation, sickLeave, convalescence, overtime,
    pension, severance, notice, maternity, minimumWage, creditPoints,
  })

  return {
    vacation, sickLeave, convalescence, overtime,
    pension, severance, notice, maternity, minimumWage, creditPoints,
    summary,
  }
}

// ─── Credit Points Calculator ───

function calculateCreditPoints(profile: EmployeeProfile): CreditPointsInfo {
  let base = DEFAULT_CREDIT_POINTS.resident // 2.25
  const details: string[] = ['2.25 points — résident israélien']
  let bonus = 0

  if (profile.isWoman) {
    bonus += DEFAULT_CREDIT_POINTS.woman_bonus
    details.push('+0.5 point — femme')
  }

  if (profile.isNewOleh && profile.aliyahYear) {
    const currentYear = new Date().getFullYear()
    const yearsSinceAliyah = currentYear - profile.aliyahYear
    if (yearsSinceAliyah < 1.5) {
      bonus += 3
      details.push('+3 points — nouvel oleh (18 premiers mois)')
    } else if (yearsSinceAliyah < 2.5) {
      bonus += 2
      details.push('+2 points — oleh (12 mois suivants)')
    } else if (yearsSinceAliyah < 3.5) {
      bonus += 1
      details.push('+1 point — oleh (12 derniers mois)')
    }
  }

  if (profile.hasChildren && profile.numberOfChildren) {
    // Simplified: children under 18 give credit points
    const childPoints = profile.numberOfChildren * 1 // ~1 point per child (simplified)
    bonus += childPoints
    details.push(`+${childPoints} point${childPoints > 1 ? 's' : ''} — ${profile.numberOfChildren} enfant${profile.numberOfChildren > 1 ? 's' : ''}`)
  }

  if (profile.isSingleParent) {
    bonus += 1
    details.push('+1 point — parent isolé')
  }

  if (profile.isDisabled) {
    bonus += 2
    details.push('+2 points — invalidité')
  }

  const total = base + bonus
  return {
    basePoints: base,
    bonusPoints: bonus,
    totalPoints: total,
    monthlyValue: round2(total * CREDIT_POINT_VALUE_MONTHLY),
    annualValue: round2(total * CREDIT_POINT_VALUE_MONTHLY * 12),
    details,
  }
}

// ─── Summary Builder ───

function buildSummary(
  profile: EmployeeProfile,
  rights: Omit<RightsResult, 'summary'>
): RightsSummary[] {
  const items: RightsSummary[] = []

  // Minimum wage
  if (!rights.minimumWage.isAboveMinimum) {
    items.push({
      category: 'Salaire',
      title: 'Salaire en dessous du minimum legal',
      value: `${profile.monthlySalary}₪ < ${MINIMUM_WAGE.monthly}₪`,
      status: 'critical',
      description: `Votre salaire est inferieur au SMIC israelien de ${rights.minimumWage.gap}₪. C'est illegal.`,
    })
  } else {
    items.push({
      category: 'Salaire',
      title: 'Salaire conforme au minimum legal',
      value: `${profile.monthlySalary}₪ > ${MINIMUM_WAGE.monthly}₪`,
      status: 'ok',
      description: `Votre salaire est ${rights.minimumWage.gap}₪ au-dessus du minimum legal.`,
    })
  }

  // Vacation
  items.push({
    category: 'Conges',
    title: 'Droit aux conges payes',
    value: `${rights.vacation.adjustedForWorkWeek} jours/an`,
    status: 'info',
    description: `Avec ${profile.seniorityYears} an(s) d'anciennete, vous avez droit a ${rights.vacation.adjustedForWorkWeek} jours de conges payes par an (valeur: ${rights.vacation.annualValue}₪).`,
  })

  // Sick days
  items.push({
    category: 'Maladie',
    title: 'Cumul jours de maladie',
    value: `~${rights.sickLeave.currentEstimate} jours accumules`,
    status: 'info',
    description: `Vous accumulez 1.5 jour/mois. Estimation actuelle: ${rights.sickLeave.currentEstimate} jours (max 90).`,
  })

  // Convalescence
  items.push({
    category: 'Havra\'a',
    title: 'Prime de convalescence',
    value: `${rights.convalescence.days} jours = ${rights.convalescence.annualAmount}₪/an`,
    status: 'info',
    description: `Dmei Havra'a: ${rights.convalescence.days} jours a 418₪/jour, verses une fois par an (generalement en ete).`,
  })

  // Pension
  if (rights.pension.isRequired && !profile.hasPension) {
    items.push({
      category: 'Pension',
      title: 'Pension obligatoire non detectee',
      value: `${rights.pension.totalMonthly}₪/mois manquants`,
      status: 'critical',
      description: `Apres 6 mois d'emploi, la pension est obligatoire (6% employe + 6.5% employeur + 6% pitzouim). Montant mensuel du: ${rights.pension.totalMonthly}₪.`,
    })
  } else if (rights.pension.isRequired) {
    items.push({
      category: 'Pension',
      title: 'Pension obligatoire',
      value: `${rights.pension.totalMonthly}₪/mois total`,
      status: 'ok',
      description: `Cotisation pension: ${rights.pension.monthlyEmployeeAmount}₪ (employe) + ${rights.pension.monthlyEmployerAmount}₪ (employeur) + ${rights.pension.monthlySeveranceAmount}₪ (pitzouim).`,
    })
  }

  // Severance
  if (rights.severance.isEligible) {
    items.push({
      category: 'Pitzouim',
      title: 'Indemnites de licenciement estimees',
      value: `${rights.severance.estimatedAmount}₪`,
      status: 'info',
      description: `${rights.severance.formula}. Exonere d'impot jusqu'a ${rights.severance.taxExempt}₪.`,
    })
  }

  // Notice period
  items.push({
    category: 'Preavis',
    title: 'Delai de preavis',
    value: `${rights.notice.employeeDays} jours`,
    status: 'info',
    description: `En cas de demission ou licenciement, le preavis est de ${rights.notice.employeeDays} jours.`,
  })

  // Credit points
  items.push({
    category: 'Impots',
    title: 'Points de credit fiscal',
    value: `${rights.creditPoints.totalPoints} points = ${rights.creditPoints.monthlyValue}₪/mois`,
    status: 'info',
    description: rights.creditPoints.details.join('. ') + '.',
  })

  return items
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
