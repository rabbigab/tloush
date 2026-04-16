import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AidesHubClient from './AidesHubClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Mes aides et droits',
  description: 'Detectez les aides publiques et verifiez vos droits du travail en Israel.',
}

type TabSlug = 'aides' | 'travail'

interface PageProps {
  searchParams: { tab?: string }
}

export default async function AidesPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/aides')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('profile_completion_pct')
    .eq('user_id', user.id)
    .maybeSingle()

  const initialTab: TabSlug = searchParams.tab === 'travail' ? 'travail' : 'aides'

  return (
    <AidesHubClient
      initialTab={initialTab}
      profileComplete={!!profile}
    />
  )
}
