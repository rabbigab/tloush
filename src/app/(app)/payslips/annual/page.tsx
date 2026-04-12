import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AnnualPayslipClient from './AnnualPayslipClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Evolution annuelle — Tloush',
  description: 'Visualisez l\'evolution de votre salaire sur 12 mois avec detection automatique des variations.',
}

export default async function AnnualPayslipPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/payslips/annual')

  return <AnnualPayslipClient />
}
