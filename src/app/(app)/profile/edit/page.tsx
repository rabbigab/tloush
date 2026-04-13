import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileEditClient from './ProfileEditClient'
import type { UserProfile } from '@/types/userProfile'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Completer mon profil',
  description: 'Completez votre profil pour beneficier d\'une analyse personnalisee : droits, impots, miluim.',
}

export default async function ProfileEditPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const initialProfile: UserProfile = profile || {
    user_id: user.id,
    gender: null,
    birth_date: null,
    marital_status: null,
    spouse_user_id: null,
    spouse_gender: null,
    spouse_aliyah_year: null,
    spouse_monthly_income: null,
    spouse_employment_status: null,
    children_count: 0,
    children_birth_dates: [],
    children_with_disabilities: 0,
    children_in_daycare: 0,
    aliyah_year: null,
    country_of_origin: null,
    israeli_citizen: true,
    employment_status: null,
    employer_sector: null,
    monthly_income: null,
    household_income_monthly: null,
    served_in_idf: false,
    military_discharge_year: null,
    is_combat_veteran: false,
    is_active_reservist: false,
    miluim_days_current_year: 0,
    education_level: null,
    is_current_student: false,
    institution_name: null,
    disability_level: null,
    kupat_holim: null,
    is_holocaust_survivor: false,
    is_caregiver: false,
    chronic_illness: false,
    has_mobility_limitation: false,
    has_disabled_child: false,
    is_bereaved_family: false,
    is_income_supplement_eligible: false,
    has_mortgage: false,
    has_public_housing: false,
    city: null,
    municipality: null,
    housing_status: null,
    home_size_sqm: null,
    receives_kitsbat_yeladim: null,
    receives_old_age_pension: null,
    receives_disability_pension: null,
    receives_income_support: null,
    receives_rental_assistance: null,
    receives_ulpan: null,
    receives_shoah_benefits: null,
    profile_completion_pct: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return <ProfileEditClient initialProfile={initialProfile} />
}
