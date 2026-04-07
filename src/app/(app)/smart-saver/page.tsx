export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SmartSaverClient from './SmartSaverClient'

export default async function SmartSaverPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch user expenses
  const { data: expenses } = await supabase
    .from('expenses')
    .select('provider_name, category, amount, frequency')
    .eq('user_id', user.id)

  return <SmartSaverClient expenses={expenses || []} />
}
