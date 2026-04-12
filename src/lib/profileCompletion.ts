// =====================================================
// Profile completion calculator
// =====================================================
// Calcule le pourcentage de completion du profil utilisateur
// en fonction des champs remplis.

import type { UserProfile } from '@/types/userProfile'

// Poids de chaque champ (total = 100)
// Les champs critiques pour les features (alyah, enfants, emploi) ont plus de poids
const FIELD_WEIGHTS: Record<string, number> = {
  marital_status: 15,
  children_count: 10,
  aliyah_year: 15,
  employment_status: 15,
  monthly_income: 10,
  city: 10,
  housing_status: 5,
  kupat_holim: 5,
  disability_level: 5,
  country_of_origin: 5,
  employer_sector: 5,
}

/**
 * Calcule le pourcentage de completion du profil.
 * Retourne 0-100.
 */
export function computeProfileCompletion(profile: Partial<UserProfile>): number {
  if (!profile) return 0

  let totalScore = 0

  for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
    const value = profile[field as keyof UserProfile]

    if (value !== null && value !== undefined && value !== '') {
      // Pour les nombres, 0 compte comme rempli si explicitement defini
      // Pour les strings, on verifie qu'ils ne sont pas vides
      totalScore += weight
    }
  }

  return Math.min(100, Math.round(totalScore))
}

/**
 * Retourne les champs manquants les plus importants.
 */
export function getMissingCriticalFields(profile: Partial<UserProfile>): string[] {
  const critical = ['marital_status', 'aliyah_year', 'employment_status', 'city']
  const missing: string[] = []

  for (const field of critical) {
    const value = profile[field as keyof UserProfile]
    if (value === null || value === undefined || value === '') {
      missing.push(field)
    }
  }

  return missing
}
