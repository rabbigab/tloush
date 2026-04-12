// =====================================================
// Types — Profil utilisateur enrichi
// =====================================================

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'separated'
export type EmploymentStatus = 'employed' | 'self_employed' | 'unemployed' | 'student' | 'retired' | 'reservist' | 'parental_leave'
export type KupatHolim = 'clalit' | 'maccabi' | 'meuhedet' | 'leumit'
export type HousingStatus = 'renter' | 'owner' | 'living_with_family' | 'other'

export interface UserProfile {
  user_id: string

  // Situation familiale
  marital_status: MaritalStatus | null
  spouse_user_id: string | null
  children_count: number
  children_birth_dates: string[] // ISO dates

  // Alyah / immigration
  aliyah_year: number | null
  country_of_origin: string | null
  israeli_citizen: boolean

  // Situation professionnelle
  employment_status: EmploymentStatus | null
  employer_sector: string | null
  monthly_income: number | null

  // Sante
  disability_level: number | null
  kupat_holim: KupatHolim | null

  // Logement
  city: string | null
  housing_status: HousingStatus | null

  // Meta
  profile_completion_pct: number
  created_at: string
  updated_at: string
}

export type UserProfileUpdate = Partial<Omit<UserProfile, 'user_id' | 'created_at' | 'updated_at' | 'profile_completion_pct'>>

// Labels FR pour l'UI
export const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  single: 'Celibataire',
  married: 'Marie(e)',
  divorced: 'Divorce(e)',
  widowed: 'Veuf/veuve',
  separated: 'Separe(e)',
}

export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  employed: 'Salarie',
  self_employed: 'Independant / Freelance',
  unemployed: 'Sans emploi',
  student: 'Etudiant',
  retired: 'Retraite',
  reservist: 'Reserviste (miluim)',
  parental_leave: 'Conge parental',
}

export const KUPAT_HOLIM_LABELS: Record<KupatHolim, string> = {
  clalit: 'Clalit (כללית)',
  maccabi: 'Maccabi (מכבי)',
  meuhedet: 'Meuhedet (מאוחדת)',
  leumit: 'Leumit (לאומית)',
}

export const HOUSING_STATUS_LABELS: Record<HousingStatus, string> = {
  renter: 'Locataire',
  owner: 'Proprietaire',
  living_with_family: 'Heberge famille',
  other: 'Autre',
}
