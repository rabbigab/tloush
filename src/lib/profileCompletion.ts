// =====================================================
// Profile completion calculator
// =====================================================
// Calcule le pourcentage de completion du profil utilisateur.
// Les champs critiques pour le rights detector ont plus de poids.

import type { UserProfile } from '@/types/userProfile'

// Poids de chaque champ. Total ~100.
// Les champs "critiques" (genre, alyah, enfants, emploi) ont plus de poids.
const FIELD_WEIGHTS: Record<string, number> = {
  // Identite de base (critique)
  gender: 8,
  birth_date: 6,

  // Famille (critique pour beaucoup de droits)
  marital_status: 8,
  children_count: 6,
  children_birth_dates: 4,  // bonus si fourni

  // Immigration (critique pour 30% des regles)
  aliyah_year: 10,
  country_of_origin: 2,

  // Professionnel (critique pour droits travail)
  employment_status: 10,
  monthly_income: 5,

  // Logement (critique pour arnona)
  city: 6,
  housing_status: 3,
  home_size_sqm: 2,

  // Sante (critique pour invalidite)
  kupat_holim: 2,
  disability_level: 5,

  // Service militaire
  served_in_idf: 4,

  // Education
  education_level: 3,

  // Situations speciales (bonus high-value)
  is_holocaust_survivor: 3,
  is_caregiver: 2,
  is_bereaved_family: 2,
  is_current_student: 3,
  is_active_reservist: 3,
  has_disabled_child: 3,
}

/**
 * Calcule le pourcentage de completion du profil.
 */
export function computeProfileCompletion(profile: Partial<UserProfile>): number {
  if (!profile) return 0

  let totalScore = 0

  for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
    const value = profile[field as keyof UserProfile]

    // Pour les booleans, TRUE/FALSE explicitement defini compte
    if (typeof value === 'boolean') {
      // Boolean true compte toujours, false compte aussi (on a pris une decision)
      totalScore += weight
    }
    // Pour les arrays
    else if (Array.isArray(value)) {
      if (value.length > 0) totalScore += weight
    }
    // Pour les nombres/strings
    else if (value !== null && value !== undefined && value !== '' && value !== 0) {
      totalScore += weight
    }
  }

  return Math.min(100, Math.round(totalScore))
}

/**
 * Retourne les champs critiques manquants.
 */
export function getMissingCriticalFields(profile: Partial<UserProfile>): string[] {
  const critical = ['gender', 'marital_status', 'aliyah_year', 'employment_status', 'city']
  const missing: string[] = []

  for (const field of critical) {
    const value = profile[field as keyof UserProfile]
    if (value === null || value === undefined || value === '') {
      missing.push(field)
    }
  }

  return missing
}
