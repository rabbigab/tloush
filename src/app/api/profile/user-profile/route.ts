import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { computeProfileCompletion } from '@/lib/profileCompletion'
import type { UserProfileUpdate, MaritalStatus, EmploymentStatus, KupatHolim, HousingStatus } from '@/types/userProfile'

// =====================================================
// GET /api/profile/user-profile
// Retourne le profil enrichi de l'utilisateur connecte
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

  // Si pas encore de profil, retourner un objet vide avec defaults
  if (!data) {
    return NextResponse.json({
      profile: {
        user_id: user.id,
        marital_status: null,
        spouse_user_id: null,
        children_count: 0,
        children_birth_dates: [],
        aliyah_year: null,
        country_of_origin: null,
        israeli_citizen: true,
        employment_status: null,
        employer_sector: null,
        monthly_income: null,
        disability_level: null,
        kupat_holim: null,
        city: null,
        housing_status: null,
        profile_completion_pct: 0,
      },
    })
  }

  return NextResponse.json({ profile: data })
}

// =====================================================
// Validation helpers
// =====================================================
const VALID_MARITAL: MaritalStatus[] = ['single', 'married', 'divorced', 'widowed', 'separated']
const VALID_EMPLOYMENT: EmploymentStatus[] = ['employed', 'self_employed', 'unemployed', 'student', 'retired', 'reservist', 'parental_leave']
const VALID_KUPAT: KupatHolim[] = ['clalit', 'maccabi', 'meuhedet', 'leumit']
const VALID_HOUSING: HousingStatus[] = ['renter', 'owner', 'living_with_family', 'other']

function validateUpdate(body: unknown): UserProfileUpdate | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'Payload invalide' }
  const b = body as Record<string, unknown>

  const clean: UserProfileUpdate = {}

  if ('marital_status' in b) {
    if (b.marital_status !== null && !VALID_MARITAL.includes(b.marital_status as MaritalStatus)) {
      return { error: 'marital_status invalide' }
    }
    clean.marital_status = b.marital_status as MaritalStatus | null
  }

  if ('children_count' in b) {
    const n = Number(b.children_count)
    if (isNaN(n) || n < 0 || n > 20) return { error: 'children_count invalide (0-20)' }
    clean.children_count = n
  }

  if ('children_birth_dates' in b) {
    if (!Array.isArray(b.children_birth_dates)) return { error: 'children_birth_dates doit etre un tableau' }
    clean.children_birth_dates = b.children_birth_dates.filter(d => typeof d === 'string') as string[]
  }

  if ('aliyah_year' in b) {
    if (b.aliyah_year === null) {
      clean.aliyah_year = null
    } else {
      const n = Number(b.aliyah_year)
      if (isNaN(n) || n < 1948 || n > 2100) return { error: 'aliyah_year invalide' }
      clean.aliyah_year = n
    }
  }

  if ('country_of_origin' in b) {
    clean.country_of_origin = typeof b.country_of_origin === 'string' ? b.country_of_origin.slice(0, 100) : null
  }

  if ('israeli_citizen' in b) {
    clean.israeli_citizen = Boolean(b.israeli_citizen)
  }

  if ('employment_status' in b) {
    if (b.employment_status !== null && !VALID_EMPLOYMENT.includes(b.employment_status as EmploymentStatus)) {
      return { error: 'employment_status invalide' }
    }
    clean.employment_status = b.employment_status as EmploymentStatus | null
  }

  if ('employer_sector' in b) {
    clean.employer_sector = typeof b.employer_sector === 'string' ? b.employer_sector.slice(0, 100) : null
  }

  if ('monthly_income' in b) {
    if (b.monthly_income === null) {
      clean.monthly_income = null
    } else {
      const n = Number(b.monthly_income)
      if (isNaN(n) || n < 0) return { error: 'monthly_income invalide' }
      clean.monthly_income = Math.round(n)
    }
  }

  if ('disability_level' in b) {
    if (b.disability_level === null) {
      clean.disability_level = null
    } else {
      const n = Number(b.disability_level)
      if (isNaN(n) || n < 0 || n > 100) return { error: 'disability_level invalide (0-100)' }
      clean.disability_level = n
    }
  }

  if ('kupat_holim' in b) {
    if (b.kupat_holim !== null && !VALID_KUPAT.includes(b.kupat_holim as KupatHolim)) {
      return { error: 'kupat_holim invalide' }
    }
    clean.kupat_holim = b.kupat_holim as KupatHolim | null
  }

  if ('city' in b) {
    clean.city = typeof b.city === 'string' ? b.city.slice(0, 100) : null
  }

  if ('housing_status' in b) {
    if (b.housing_status !== null && !VALID_HOUSING.includes(b.housing_status as HousingStatus)) {
      return { error: 'housing_status invalide' }
    }
    clean.housing_status = b.housing_status as HousingStatus | null
  }

  return clean
}

// =====================================================
// PATCH /api/profile/user-profile
// Met a jour partiellement le profil (upsert)
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

  // Recuperer le profil existant pour fusionner et calculer le % completion
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
