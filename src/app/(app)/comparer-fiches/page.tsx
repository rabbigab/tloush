import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CompareClient from './CompareClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Tloush — Comparer mes fiches de paie',
}

export default async function ComparePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/compare')

  // Fetch only payslip documents for comparison
  const { data: payslips } = await supabase
    .from('documents')
    .select('id, file_name, period, document_type, created_at')
    .eq('user_id', user.id)
    .eq('document_type', 'payslip')
    .order('created_at', { ascending: false })

  return <CompareClient payslips={payslips || []} />
}
