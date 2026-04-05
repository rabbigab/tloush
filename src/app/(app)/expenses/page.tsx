import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ExpensesClient from './ExpensesClient'

export const metadata = {
  title: 'Mes dépenses',
  description: 'Vue d\'ensemble de vos dépenses récurrentes détectées depuis vos factures.',
}

export default async function ExpensesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: expenses } = await supabase
    .from('recurring_expenses')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('amount', { ascending: false })

  return <ExpensesClient expenses={expenses || []} />
}
