// =====================================================
// Miluim compensation calculator
// =====================================================
// Source: Bituach Leumi — Tagmulei Miluim
// https://www.btl.gov.il/benefits/Reserves/
//
// Regle de base :
// - L'employeur paie le salaire normal pendant la periode de miluim
// - Bituach Leumi rembourse l'employeur sur la base du salaire moyen
//   des 3 derniers mois, avec un plancher et un plafond journaliers

// Constantes 2026 (a versionner par annee)
// Mises a jour selon les baremes officiels BL
const MILUIM_CONSTANTS_2026 = {
  // Plafond journalier (max qu'on peut etre paye)
  dailyMaxNis: 1617.40,
  // Plancher journalier (min guarantee)
  dailyMinNis: 280.28,
  // Base mensuelle : 30 jours
  monthlyDays: 30,
  // Salaire mensuel max pris en compte (= plafond * 30)
  maxMonthlyBase: 48522,
  // Plafond legal cumulatif sur 3 ans
  max3YearsDays: 270,
} as const

const MILUIM_CONSTANTS_2025 = {
  dailyMaxNis: 1508.35,
  dailyMinNis: 261.27,
  monthlyDays: 30,
  maxMonthlyBase: 45250,
  max3YearsDays: 270,
} as const

/**
 * Retourne les constantes pour une annee donnee.
 * Par defaut utilise l'annee courante.
 */
export function getMiluimConstants(year: number = new Date().getFullYear()) {
  if (year >= 2026) return MILUIM_CONSTANTS_2026
  return MILUIM_CONSTANTS_2025
}

export interface MiluimCompensationInput {
  /** Salaire brut moyen des 3 derniers mois (NIS) */
  monthlyAvgSalary: number
  /** Nombre de jours de miluim a compenser */
  daysServed: number
  /** Annee de reference pour les baremes */
  year?: number
}

export interface MiluimCompensationResult {
  dailyRate: number
  totalCompensation: number
  cappedByMax: boolean
  cappedByMin: boolean
  breakdown: {
    rawDaily: number
    appliedDaily: number
    minDaily: number
    maxDaily: number
  }
}

/**
 * Calcule la compensation miluim estimee pour une periode.
 * Retourne le taux journalier et le total.
 */
export function computeMiluimCompensation(input: MiluimCompensationInput): MiluimCompensationResult {
  const constants = getMiluimConstants(input.year)

  // Taux journalier brut = salaire mensuel / 30
  const rawDaily = input.monthlyAvgSalary / constants.monthlyDays

  // Application du plancher et plafond
  let appliedDaily = rawDaily
  let cappedByMax = false
  let cappedByMin = false

  if (rawDaily > constants.dailyMaxNis) {
    appliedDaily = constants.dailyMaxNis
    cappedByMax = true
  } else if (rawDaily < constants.dailyMinNis) {
    appliedDaily = constants.dailyMinNis
    cappedByMin = true
  }

  const totalCompensation = appliedDaily * input.daysServed

  return {
    dailyRate: Math.round(appliedDaily * 100) / 100,
    totalCompensation: Math.round(totalCompensation * 100) / 100,
    cappedByMax,
    cappedByMin,
    breakdown: {
      rawDaily: Math.round(rawDaily * 100) / 100,
      appliedDaily: Math.round(appliedDaily * 100) / 100,
      minDaily: constants.dailyMinNis,
      maxDaily: constants.dailyMaxNis,
    },
  }
}

/**
 * Verifie qu'un nouveau total de jours ne depasse pas le plafond legal.
 */
export function validateMiluimLimits(totalDaysLastThreeYears: number): {
  valid: boolean
  remaining: number
  warning?: string
} {
  const max = MILUIM_CONSTANTS_2026.max3YearsDays
  const remaining = Math.max(0, max - totalDaysLastThreeYears)

  if (totalDaysLastThreeYears >= max) {
    return {
      valid: false,
      remaining: 0,
      warning: `Plafond legal atteint : ${max} jours sur 3 ans.`,
    }
  }

  if (totalDaysLastThreeYears >= max - 30) {
    return {
      valid: true,
      remaining,
      warning: `Attention : vous approchez du plafond legal (${totalDaysLastThreeYears}/${max} jours).`,
    }
  }

  return { valid: true, remaining }
}

export interface MiluimPeriod {
  id: string
  user_id: string
  start_date: string
  end_date: string
  days_count: number
  unit: string | null
  service_type: 'regular' | 'emergency' | 'training' | 'other' | null
  tzav_document_id: string | null
  notes: string | null
  daily_compensation: number | null
  total_compensation: number | null
  employer_reimbursed: boolean
  bl_reimbursed: boolean
  created_at: string
  updated_at: string
}

export const SERVICE_TYPE_LABELS: Record<NonNullable<MiluimPeriod['service_type']>, string> = {
  regular: 'Regulier',
  emergency: 'Urgence (Tzav 8)',
  training: 'Formation',
  other: 'Autre',
}
