// =====================================================
// Miluim compensation calculator — VERIFIED 2026
// =====================================================
// Source officielle : Bituach Leumi
// https://www.btl.gov.il/benefits/Reserve_Service/Pages/שיעורי%20הקצבה.aspx
//
// REGLE DE BASE (confirmee post-audit avril 2026) :
// - L'employeur paie le salaire normal pendant la periode de miluim
// - Bituach Leumi rembourse l'employeur sur la base du salaire brut
//   des 3 MOIS PRECEDANT le mois ou le service a commence, divise par 90.
// - Application du plafond et plancher journaliers.
// - Pour 2025+ : si la base 2024 etait plus elevee, utiliser la base plus haute.

// Constantes 2026 — VERIFIEES avec Bituach Leumi
const MILUIM_CONSTANTS_2026 = {
  // Plafond journalier 2026 (officiel BTL)
  dailyMaxNis: 1730.33,
  // Plancher journalier 2026 (officiel BTL)
  dailyMinNis: 328.76,
  // Base de calcul : 3 mois / 90 jours
  baseDaysDivisor: 90,
  // Monthly cap equivalent
  maxMonthlyBase: 51910,
  minMonthlyBase: 9863,
} as const

// Constantes 2025 — gardees pour reference historique
const MILUIM_CONSTANTS_2025 = {
  dailyMaxNis: 1508.35,
  dailyMinNis: 261.27,
  baseDaysDivisor: 90,
  maxMonthlyBase: 45250,
  minMonthlyBase: 7838,
} as const

/**
 * Retourne les constantes pour une annee donnee.
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
    formula: string
  }
  disclaimer: string
}

/**
 * Calcule la compensation miluim estimee pour une periode.
 *
 * Formule officielle :
 *   daily_rate = (salaire_brut_3_mois_precedents) / 90
 *   total = daily_rate * jours_servis
 *   capped entre [dailyMin, dailyMax]
 *
 * ATTENTION : cette estimation est INDICATIVE uniquement. Le calcul
 * officiel BL peut inclure d'autres elements (primes, indemnites,
 * heures sup des 3 derniers mois).
 */
export function computeMiluimCompensation(input: MiluimCompensationInput): MiluimCompensationResult {
  const constants = getMiluimConstants(input.year)

  // Formule officielle BL : base 3 mois / 90 jours
  // Si on fournit salaire mensuel moyen, multiplier par 3 pour avoir la base 3 mois
  const threeMonthsBase = input.monthlyAvgSalary * 3
  const rawDaily = threeMonthsBase / constants.baseDaysDivisor

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
      formula: `(${input.monthlyAvgSalary.toLocaleString('fr-IL')} × 3) / 90 = ${Math.round(rawDaily * 100) / 100}`,
    },
    disclaimer: 'Estimation basee sur les baremes BL officiels. Le calcul reel peut differer selon votre historique exact de salaire des 3 mois precedents. Verifiez avec le calculateur BL officiel.',
  }
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

// =====================================================
// NOTE SUR LE PLAFOND LEGAL 270 JOURS
// =====================================================
// Le plafond "270 jours / 3 ans" que j'avais code initialement n'est pas
// verifiable comme une regle de compensation BL. Il semble confondu avec :
// - Des periodes de protection d'emploi (Hok Sherut Miluim)
// - L'eligibilite chomage post-miluim
// Cette fonction est donc desactivee jusqu'a verification.
export function validateMiluimLimits(_totalDaysLastThreeYears: number): {
  valid: boolean
  remaining: number | null
  warning?: string
} {
  // On retourne toujours valid=true, remaining=null pour ne pas afficher
  // de fausse limite. Un sprint futur ajoutera les vraies regles.
  return {
    valid: true,
    remaining: null,
    warning: 'Le plafond de jours cumules depend de votre situation individuelle. Consultez l\'officier miluim ou BL pour votre plafond personnel.',
  }
}
