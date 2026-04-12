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

  // Si pas de profil, on passe un objet vide avec defaults
  const initialProfile: UserProfile = profile || {
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return <ProfileEditClient initialProfile={initialProfile} />
}
