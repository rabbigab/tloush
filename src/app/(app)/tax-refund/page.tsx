import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TaxRefundClient from './TaxRefundClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Remboursement d\'impots',
  description: 'Estimez votre remboursement d\'impots israeliens (החזר מס) en quelques clics.',
}

export default async function TaxRefundPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/tax-refund')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('profile_completion_pct, aliyah_year, children_count')
    .eq('user_id', user.id)
    .maybeSingle()

  return <TaxRefundClient profileComplete={!!profile && profile.profile_completion_pct > 0} />
}
