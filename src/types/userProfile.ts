// =====================================================
// Types — Profil utilisateur enrichi V2
// =====================================================
// Base sur recherche web des aides israeliennes avril 2026

export type Gender = 'male' | 'female' | 'other'
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'separated'
export type EmploymentStatus = 'employed' | 'self_employed' | 'unemployed' | 'student' | 'retired' | 'reservist' | 'parental_leave'
export type KupatHolim = 'clalit' | 'maccabi' | 'meuhedet' | 'leumit'
export type HousingStatus = 'renter' | 'owner' | 'living_with_family' | 'public_housing' | 'other'
export type EducationLevel = 'none' | 'high_school' | 'vocational' | 'ba' | 'ma' | 'phd' | 'other'
export type ShoahPeriod = 'pre_1953' | 'post_1953' | 'ex_urss'
export type DisabilitySource = 'idf' | 'work' | 'general'
export type CityPriorityZone = 'a' | 'b' | 'c'

export interface UserProfile {
  user_id: string

  // Identite de base
  gender: Gender | null
  birth_date: string | null

  // Situation familiale
  marital_status: MaritalStatus | null
  spouse_user_id: string | null
  spouse_gender: Gender | null
  spouse_aliyah_year: number | null
  spouse_monthly_income: number | null
  spouse_employment_status: EmploymentStatus | null
  children_count: number
  children_birth_dates: string[]
  children_with_disabilities: number
  children_in_daycare: number

  // Alyah / immigration
  aliyah_year: number | null
  country_of_origin: string | null
  israeli_citizen: boolean

  // Situation professionnelle
  employment_status: EmploymentStatus | null
  employer_sector: string | null
  monthly_income: number | null
  household_income_monthly: number | null

  // Service militaire / reserviste
  served_in_idf: boolean
  military_discharge_year: number | null
  discharge_date: string | null
  is_combat_veteran: boolean
  is_active_reservist: boolean
  miluim_days_current_year: number

  // Education
  education_level: EducationLevel | null
  is_current_student: boolean
  institution_name: string | null

  // Sante / situations speciales
  disability_level: number | null
  disability_source: DisabilitySource | null
  kupat_holim: KupatHolim | null
  is_holocaust_survivor: boolean
  shoah_period: ShoahPeriod | null
  is_caregiver: boolean
  chronic_illness: boolean
  has_mobility_limitation: boolean
  has_disabled_child: boolean
  is_bereaved_family: boolean
  is_7octobre_victim: boolean

  // Financier
  is_income_supplement_eligible: boolean
  has_mortgage: boolean
  has_public_housing: boolean

  // Logement
  city: string | null
  municipality: string | null
  housing_status: HousingStatus | null
  home_size_sqm: number | null
  city_priority_zone: CityPriorityZone | null
  is_landlord: boolean

  // Allocations en cours (pour eviter de re-detecter)
  receives_kitsbat_yeladim: boolean | null
  receives_old_age_pension: boolean | null
  receives_disability_pension: boolean | null
  receives_income_support: boolean | null
  receives_rental_assistance: boolean | null
  receives_ulpan: boolean | null
  receives_shoah_benefits: boolean | null

  // Meta
  profile_completion_pct: number
  created_at: string
  updated_at: string
}

export type UserProfileUpdate = Partial<Omit<UserProfile, 'user_id' | 'created_at' | 'updated_at' | 'profile_completion_pct'>>

// =====================================================
// Labels FR
// =====================================================

export const GENDER_LABELS: Record<Gender, string> = {
  male: 'Homme',
  female: 'Femme',
  other: 'Autre / prefere ne pas dire',
}

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
  public_housing: 'Diur tziburi (logement social)',
  other: 'Autre',
}

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  none: 'Pas de diplome',
  high_school: 'Bac / Bagrut',
  vocational: 'Formation pro',
  ba: 'Licence / BA',
  ma: 'Master / MA',
  phd: 'Doctorat / PhD',
  other: 'Autre',
}

export const SHOAH_PERIOD_LABELS: Record<ShoahPeriod, string> = {
  pre_1953: 'Immigré(e) avant 1953',
  post_1953: 'Immigré(e) après 1953',
  ex_urss: 'Survivant(e) ex-URSS / Roumanie (Keren Sif 2)',
}

export const DISABILITY_SOURCE_LABELS: Record<DisabilitySource, string> = {
  idf: 'Invalide de Tsahal (Nakhei Tsahal)',
  work: 'Accident du travail (Nifgaei Avoda)',
  general: 'Invalidité générale (Nakhut Klalit)',
}

export const CITY_PRIORITY_ZONE_LABELS: Record<CityPriorityZone, string> = {
  a: 'Zone A (haute priorité — Negev / Galil éloigné / Eilat)',
  b: 'Zone B (priorité intermédiaire)',
  c: 'Zone C (priorité basse / zone limitrophe)',
}
