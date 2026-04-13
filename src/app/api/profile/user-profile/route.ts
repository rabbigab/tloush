import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { computeProfileCompletion } from '@/lib/profileCompletion'
import type {
  UserProfileUpdate,
  MaritalStatus,
  EmploymentStatus,
  KupatHolim,
  HousingStatus,
  Gender,
  EducationLevel,
} from '@/types/userProfile'

// =====================================================
// GET /api/profile/user-profile
// =====================================================
export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ profile: { user_id: user.id, profile_completion_pct: 0 } })
  }

  return NextResponse.json({ profile: data })
}

// =====================================================
// Validation helpers
// =====================================================
const VALID_GENDER: Gender[] = ['male', 'female', 'other']
const VALID_MARITAL: MaritalStatus[] = ['single', 'married', 'divorced', 'widowed', 'separated']
const VALID_EMPLOYMENT: EmploymentStatus[] = ['employed', 'self_employed', 'unemployed', 'student', 'retired', 'reservist', 'parental_leave']
const VALID_KUPAT: KupatHolim[] = ['clalit', 'maccabi', 'meuhedet', 'leumit']
const VALID_HOUSING: HousingStatus[] = ['renter', 'owner', 'living_with_family', 'public_housing', 'other']
const VALID_EDUCATION: EducationLevel[] = ['none', 'high_school', 'vocational', 'ba', 'ma', 'phd', 'other']

function num(v: unknown, min?: number, max?: number): number | null | 'error' {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  if (isNaN(n)) return 'error'
  if (min !== undefined && n < min) return 'error'
  if (max !== undefined && n > max) return 'error'
  return n
}

function str(v: unknown, maxLen = 200): string | null {
  if (v === null || v === undefined) return null
  if (typeof v !== 'string') return null
  return v.slice(0, maxLen)
}

function bool(v: unknown): boolean {
  return Boolean(v)
}

function validateUpdate(body: unknown): UserProfileUpdate | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'Payload invalide' }
  const b = body as Record<string, unknown>
  const clean: UserProfileUpdate = {}

  // Helpers with strict enum check
  const enumCheck = <T extends string>(value: unknown, valid: T[]): T | null => {
    if (value === null || value === undefined || value === '') return null
    if (typeof value === 'string' && (valid as string[]).includes(value)) return value as T
    return null
  }

  // Identite
  if ('gender' in b) clean.gender = enumCheck(b.gender, VALID_GENDER)
  if ('birth_date' in b) clean.birth_date = str(b.birth_date, 10)

  // Famille
  if ('marital_status' in b) clean.marital_status = enumCheck(b.marital_status, VALID_MARITAL)
  if ('spouse_gender' in b) clean.spouse_gender = enumCheck(b.spouse_gender, VALID_GENDER)
  if ('spouse_aliyah_year' in b) {
    const r = num(b.spouse_aliyah_year, 1948, 2100)
    if (r === 'error') return { error: 'spouse_aliyah_year invalide' }
    clean.spouse_aliyah_year = r
  }
  if ('spouse_monthly_income' in b) {
    const r = num(b.spouse_monthly_income, 0)
    if (r === 'error') return { error: 'spouse_monthly_income invalide' }
    clean.spouse_monthly_income = r
  }
  if ('spouse_employment_status' in b) clean.spouse_employment_status = enumCheck(b.spouse_employment_status, VALID_EMPLOYMENT)

  if ('children_count' in b) {
    const r = num(b.children_count, 0, 20)
    if (r === 'error') return { error: 'children_count invalide (0-20)' }
    clean.children_count = r === null ? 0 : r
  }
  if ('children_birth_dates' in b) {
    if (Array.isArray(b.children_birth_dates)) {
      clean.children_birth_dates = b.children_birth_dates.filter(d => typeof d === 'string') as string[]
    }
  }
  if ('children_with_disabilities' in b) {
    const r = num(b.children_with_disabilities, 0, 20)
    if (r === 'error') return { error: 'children_with_disabilities invalide' }
    clean.children_with_disabilities = r === null ? 0 : r
  }
  if ('children_in_daycare' in b) {
    const r = num(b.children_in_daycare, 0, 20)
    if (r === 'error') return { error: 'children_in_daycare invalide' }
    clean.children_in_daycare = r === null ? 0 : r
  }

  // Alyah
  if ('aliyah_year' in b) {
    const r = num(b.aliyah_year, 1948, 2100)
    if (r === 'error') return { error: 'aliyah_year invalide' }
    clean.aliyah_year = r
  }
  if ('country_of_origin' in b) clean.country_of_origin = str(b.country_of_origin, 100)
  if ('israeli_citizen' in b) clean.israeli_citizen = bool(b.israeli_citizen)

  // Pro
  if ('employment_status' in b) clean.employment_status = enumCheck(b.employment_status, VALID_EMPLOYMENT)
  if ('employer_sector' in b) clean.employer_sector = str(b.employer_sector, 100)
  if ('monthly_income' in b) {
    const r = num(b.monthly_income, 0)
    if (r === 'error') return { error: 'monthly_income invalide' }
    clean.monthly_income = r === null ? null : Math.round(r)
  }
  if ('household_income_monthly' in b) {
    const r = num(b.household_income_monthly, 0)
    if (r === 'error') return { error: 'household_income_monthly invalide' }
    clean.household_income_monthly = r === null ? null : Math.round(r)
  }

  // Militaire
  if ('served_in_idf' in b) clean.served_in_idf = bool(b.served_in_idf)
  if ('military_discharge_year' in b) {
    const r = num(b.military_discharge_year, 1948, 2100)
    if (r === 'error') return { error: 'military_discharge_year invalide' }
    clean.military_discharge_year = r
  }
  if ('is_combat_veteran' in b) clean.is_combat_veteran = bool(b.is_combat_veteran)
  if ('is_active_reservist' in b) clean.is_active_reservist = bool(b.is_active_reservist)
  if ('miluim_days_current_year' in b) {
    const r = num(b.miluim_days_current_year, 0, 365)
    if (r === 'error') return { error: 'miluim_days_current_year invalide' }
    clean.miluim_days_current_year = r === null ? 0 : r
  }

  // Education
  if ('education_level' in b) clean.education_level = enumCheck(b.education_level, VALID_EDUCATION)
  if ('is_current_student' in b) clean.is_current_student = bool(b.is_current_student)
  if ('institution_name' in b) clean.institution_name = str(b.institution_name, 200)

  // Sante
  if ('disability_level' in b) {
    const r = num(b.disability_level, 0, 100)
    if (r === 'error') return { error: 'disability_level invalide (0-100)' }
    clean.disability_level = r
  }
  if ('kupat_holim' in b) clean.kupat_holim = enumCheck(b.kupat_holim, VALID_KUPAT)
  if ('is_holocaust_survivor' in b) clean.is_holocaust_survivor = bool(b.is_holocaust_survivor)
  if ('is_caregiver' in b) clean.is_caregiver = bool(b.is_caregiver)
  if ('chronic_illness' in b) clean.chronic_illness = bool(b.chronic_illness)
  if ('has_mobility_limitation' in b) clean.has_mobility_limitation = bool(b.has_mobility_limitation)
  if ('has_disabled_child' in b) clean.has_disabled_child = bool(b.has_disabled_child)
  if ('is_bereaved_family' in b) clean.is_bereaved_family = bool(b.is_bereaved_family)

  // Financier
  if ('is_income_supplement_eligible' in b) clean.is_income_supplement_eligible = bool(b.is_income_supplement_eligible)
  if ('has_mortgage' in b) clean.has_mortgage = bool(b.has_mortgage)
  if ('has_public_housing' in b) clean.has_public_housing = bool(b.has_public_housing)

  // Logement
  if ('city' in b) clean.city = str(b.city, 100)
  if ('municipality' in b) clean.municipality = str(b.municipality, 100)
  if ('housing_status' in b) clean.housing_status = enumCheck(b.housing_status, VALID_HOUSING)
  if ('home_size_sqm' in b) {
    const r = num(b.home_size_sqm, 0, 10000)
    if (r === 'error') return { error: 'home_size_sqm invalide' }
    clean.home_size_sqm = r
  }

  // Allocations recues
  const receiptFlags = [
    'receives_kitsbat_yeladim',
    'receives_old_age_pension',
    'receives_disability_pension',
    'receives_income_support',
    'receives_rental_assistance',
    'receives_ulpan',
    'receives_shoah_benefits',
  ] as const
  for (const flag of receiptFlags) {
    if (flag in b) {
      const v = b[flag]
      if (v === null || v === undefined) clean[flag] = null
      else clean[flag] = bool(v)
    }
  }

  return clean
}

// =====================================================
// PATCH /api/profile/user-profile
// =====================================================
export async function PATCH(req: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const validated = validateUpdate(body)
  if ('error' in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const merged = { ...(existing || {}), ...validated, user_id: user.id }
  const completionPct = computeProfileCompletion(merged)

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(
      {
        ...merged,
        profile_completion_pct: completionPct,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile: data })
}
