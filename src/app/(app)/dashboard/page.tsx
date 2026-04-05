import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export const metadata = {
  title: 'Tableau de bord',
  description: 'Vue d\'ensemble de vos documents, alertes urgentes et actions en attente.',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [docsRes, expensesRes] = await Promise.all([
    supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('recurring_expenses')
      .select('id, provider_name, category, amount, frequency, last_seen_date')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('amount', { ascending: false }),
  ])

  return <DashboardClient documents={docsRes.data || []} expenses={expensesRes.data || []} />
}
