// =====================================================
// Rights Detector V2 — Base sur benefitsCatalog
// =====================================================
// Nouvelle version du detecteur qui utilise le catalogue complet
// de benefices (src/lib/benefitsCatalog.ts) et fait matcher les
// conditions d'eligibilite avec le profil utilisateur enrichi.
//
// V1 (rightsDetector.ts) avait 9 regles hardcodees.
// V2 utilise 44+ benefices du catalogue, extensibles sans modification
// du moteur.

import type { UserProfile } from '@/types/userProfile'
import {
  BENEFITS_CATALOG,
  type BenefitDefinition,
  type EligibilityConditions,
} from './benefitsCatalog'

export interface DetectedBenefit {
  slug: string
  title_fr: string
  description_fr: string
  full_description_fr?: string
  authority: string
  category: string
  confidence_score: number  // 0.0 - 1.0
  confidence_level: 'high' | 'medium' | 'low'
  estimated_value: number | null
  value_unit: string
  action_url: string
  action_label: string
  info_url?: string
  disclaimer?: string
  reasons: string[]  // Raisons pour lesquelles ce benefice a ete detecte
  already_receiving?: boolean  // Si le user l'a deja declare
}

// =====================================================
// Helpers de matching
// =====================================================

function ageFromBirthDate(birthDate: string | null, now: Date): number | null {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  if (isNaN(birth.getTime())) return null
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age
}

function yearsSinceAliyah(aliyahYear: number | null, now: Date): number | null {
  if (!aliyahYear) return null
  return now.getFullYear() - aliyahYear
}

/**
 * Verifie si un profil utilisateur correspond aux conditions d'un benefice.
 * Retourne un score 0-1 et la liste des raisons.
 */
function matchProfile(
  profile: UserProfile,
  conditions: EligibilityConditions,
  now: Date
): { matches: boolean; score: number; reasons: string[] } {
  const reasons: string[] = []
  let totalChecks = 0
  let passedChecks = 0

  // Age
  if (conditions.min_age !== undefined) {
    totalChecks++
    const age = ageFromBirthDate(profile.birth_date, now)
    if (age !== null && age >= conditions.min_age) {
      passedChecks++
      reasons.push(`Age ${age} ≥ ${conditions.min_age}`)
    } else if (age !== null) {
      return { matches: false, score: 0, reasons: [`Age ${age} < ${conditions.min_age}`] }
    }
  }
  if (conditions.max_age !== undefined) {
    totalChecks++
    const age = ageFromBirthDate(profile.birth_date, now)
    if (age !== null && age <= conditions.max_age) {
      passedChecks++
      reasons.push(`Age ${age} ≤ ${conditions.max_age}`)
    } else if (age !== null) {
      return { matches: false, score: 0, reasons: [`Age ${age} > ${conditions.max_age}`] }
    }
  }

  // Genre
  if (conditions.required_gender) {
    totalChecks++
    if (profile.gender === conditions.required_gender) {
      passedChecks++
      reasons.push(`Genre ${conditions.required_gender}`)
    } else {
      return { matches: false, score: 0, reasons: [] }
    }
  }

  // Statut marital
  if (conditions.required_marital_status && conditions.required_marital_status.length > 0) {
    totalChecks++
    if (profile.marital_status && conditions.required_marital_status.includes(profile.marital_status)) {
      passedChecks++
      reasons.push(`Statut ${profile.marital_status}`)
    } else {
      return { matches: false, score: 0, reasons: [] }
    }
  }

  // Enfants
  if (conditions.min_children !== undefined) {
    totalChecks++
    if (profile.children_count >= conditions.min_children) {
      passedChecks++
      reasons.push(`${profile.children_count} enfant(s) ≥ ${conditions.min_children}`)
    } else {
      return { matches: false, score: 0, reasons: [] }
    }
  }

  // Aliyah range
  if (conditions.aliyah_years_range) {
    totalChecks++
    const years = yearsSinceAliyah(profile.aliyah_year, now)
    if (years !== null && years >= conditions.aliyah_years_range[0] && years <= conditions.aliyah_years_range[1]) {
      passedChecks++
      reasons.push(`Annee alyah ${years} dans [${conditions.aliyah_years_range[0]}-${conditions.aliyah_years_range[1]}]`)
    } else {
      return { matches: false, score: 0, reasons: [] }
    }
  }

  // Requires oleh
  if (conditions.requires_oleh) {
    totalChecks++
    if (profile.aliyah_year) {
      passedChecks++
      reasons.push('Oleh reconnu')
    } else {
      return { matches: false, score: 0, reasons: [] }
    }
  }

  // Emploi
  if (conditions.required_employment && conditions.required_employment.length > 0) {
    totalChecks++
    if (profile.employment_status && conditions.required_employment.includes(profile.employment_status)) {
      passedChecks++
      reasons.push(`Statut pro: ${profile.employment_status}`)
    } else {
      return { matches: false, score: 0, reasons: [] }
    }
  }

  // Invalidite
  if (conditions.min_disability !== undefined) {
    totalChecks++
    if (profile.disability_level !== null && profile.disability_level >= conditions.min_disability) {
      passedChecks++
      reasons.push(`Invalidite ${profile.disability_level}% ≥ ${conditions.min_disability}%`)
    } else {
      return { matches: false, score: 0, reasons: [] }
    }
  }

  // Revenu max
  if (conditions.max_monthly_income !== undefined) {
    totalChecks++
    const income = profile.monthly_income || profile.household_income_monthly
    if (income !== null && income <= conditions.max_monthly_income) {
      passedChecks++
      reasons.push(`Revenu ${income} ≤ ${conditions.max_monthly_income}`)
    } else if (income !== null) {
      return { matches: false, score: 0, reasons: [] }
    }
    // Si pas de revenu declare, on accepte mais avec une confidence reduite
  }

  // Resident israelien
  if (conditions.requires_resident) {
    totalChecks++
    if (profile.israeli_citizen) {
      passedChecks++
      reasons.push('Resident israelien')
    } else {
      return { matches: false, score: 0, reasons: [] }
    }
  }

  // Service militaire
  if (conditions.requires_idf_service) {
    totalChecks++
    if (profile.served_in_idf) {
      passedChecks++
      reasons.push('A servi dans Tsahal')
    } else {
      return { matches: false, score: 0, reasons: [] }
    }
  }

  // Combat
  if (conditions.requires_combat) {
    totalChecks++
    if (profile.is_combat_veteran) {
      passedChecks++
      reasons.push('Ancien combattant')
    } else {
      return { matches: false, score: 0, reasons: [] }
    }
  }

  // Reserviste actif
  if (conditions.requires_active_reservist) {
    totalChecks++
    if (profile.is_active_reservist) {
      passedChecks++
      reasons.push('Reserviste actif')
    } else {
      return { matches: false, score: 0, reasons: [] }
    }
  }

  // Etudiant
  if (conditions.requires_student) {
    totalChecks++
    if (profile.is_current_student) {
      passedChecks++
      reasons.push('Etudiant actuel')
    } else {
      return { matches: false, score: 0, reasons: [] }
    }
  }

  // Shoah
  if (conditions.requires_holocaust_survivor) {
    totalChecks++
    if (profile.is_holocaust_survivor) {
      passedChecks++
      reasons.push('Survivant de la Shoah')
    } else {
      return { matches: false, score: 0, reasons: [] }
    }
  }

  // Famille endeuillee
  if (conditions.requires_bereaved) {
    totalChecks++
    if (profile.is_bereaved_family) {
      passedChecks++
      reasons.push('Famille endeuillee')
    } else {
      return { matches: false, score: 0, reasons: [] }
    }
  }

  // Enfant handicape
  if (conditions.requires_disabled_child) {
    totalChecks++
    if (profile.children_with_disabilities > 0 || profile.has_disabled_child) {
      passedChecks++
      reasons.push(`${profile.children_with_disabilities || 'Un'} enfant(s) handicape(s)`)
    } else {
      return { matches: false, score: 0, reasons: [] }
    }
  }

  // Aidant familial
  if (conditions.requires_caregiver) {
    totalChecks++
    if (profile.is_caregiver) {
      passedChecks++
      reasons.push('Aidant familial')
    } else {
      return { matches: false, score: 0, reasons: [] }
    }
  }

  // Si aucune condition, score base 0.5 (benefice sans condition)
  if (totalChecks === 0) {
    return { matches: true, score: 0.5, reasons: ['Aucune condition specifique'] }
  }

  const score = passedChecks / totalChecks
  return { matches: passedChecks === totalChecks, score, reasons }
}

/**
 * Verifie si le benefice est deja declare comme recu par l'utilisateur.
 */
function isAlreadyReceiving(profile: UserProfile, slug: string): boolean {
  const mapping: Record<string, keyof UserProfile> = {
    kitsbat_yeladim: 'receives_kitsbat_yeladim',
    old_age_pension: 'receives_old_age_pension',
    disability_pension_general: 'receives_disability_pension',
    hashlamat_hachnasa: 'receives_income_support',
    rental_assistance_olim: 'receives_rental_assistance',
    ulpan_free: 'receives_ulpan',
    holocaust_monthly_stipend: 'receives_shoah_benefits',
  }
  const field = mapping[slug]
  if (!field) return false
  return profile[field] === true
}

/**
 * Convertit un BenefitDefinition en DetectedBenefit pour l'utilisateur.
 */
function toDetected(
  benefit: BenefitDefinition,
  matchResult: { score: number; reasons: string[] },
  profile: UserProfile
): DetectedBenefit {
  return {
    slug: benefit.slug,
    title_fr: benefit.title_fr,
    description_fr: benefit.description_fr,
    full_description_fr: benefit.full_description_fr,
    authority: benefit.authority,
    category: benefit.category,
    confidence_score: matchResult.score * (benefit.confidence === 'high' ? 1.0 : benefit.confidence === 'medium' ? 0.8 : 0.6),
    confidence_level: benefit.confidence,
    estimated_value: benefit.estimated_annual_value || null,
    value_unit: benefit.value_unit || 'NIS',
    action_url: benefit.application_url,
    action_label: benefit.action_label,
    info_url: benefit.info_url,
    disclaimer: benefit.disclaimer,
    reasons: matchResult.reasons,
    already_receiving: isAlreadyReceiving(profile, benefit.slug),
  }
}

// =====================================================
// API publique
// =====================================================

/**
 * Scan le profil utilisateur contre TOUS les benefices du catalogue
 * et retourne ceux auxquels l'utilisateur est potentiellement eligible.
 *
 * Trie par confidence_score decroissant.
 */
export function scanBenefits(profile: UserProfile, now: Date = new Date()): DetectedBenefit[] {
  const results: DetectedBenefit[] = []

  for (const benefit of BENEFITS_CATALOG) {
    const match = matchProfile(profile, benefit.conditions, now)
    if (match.matches) {
      results.push(toDetected(benefit, match, profile))
    }
  }

  // Tri : confidence score desc, valeur desc
  results.sort((a, b) => {
    if (b.confidence_score !== a.confidence_score) {
      return b.confidence_score - a.confidence_score
    }
    return (b.estimated_value || 0) - (a.estimated_value || 0)
  })

  return results
}

/**
 * Filtre les benefices deja declares comme recus.
 */
export function scanUnclaimedBenefits(profile: UserProfile, now: Date = new Date()): DetectedBenefit[] {
  return scanBenefits(profile, now).filter(b => !b.already_receiving)
}

/**
 * Retourne la valeur annuelle totale estimee des benefices non reclames.
 */
export function estimateUnclaimedValue(profile: UserProfile, now: Date = new Date()): number {
  return scanUnclaimedBenefits(profile, now).reduce(
    (sum, b) => sum + (b.estimated_value || 0),
    0
  )
}
