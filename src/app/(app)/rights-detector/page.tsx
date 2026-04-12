import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RightsDetectorClient from './RightsDetectorClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Mes droits detectes — Tloush',
  description: 'Decouvrez les droits et aides auxquels vous avez potentiellement droit.',
}

export default async function RightsDetectorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/rights-detector')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('profile_completion_pct')
    .eq('user_id', user.id)
    .maybeSingle()

  return <RightsDetectorClient profileComplete={!!profile && profile.profile_completion_pct > 30} />
}
