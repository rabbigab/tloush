import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Tableau de bord',
  description: 'Vue d\'ensemble de vos documents, alertes urgentes et actions en attente.',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [docsRes, expensesRes, payslipsRes] = await Promise.all([
    supabase
      .from('documents')
      .select('id, file_name, file_type, document_type, is_urgent, action_required, action_description, period, summary_fr, deadline, created_at, folder_id, status, action_completed_at, file_path, analysis_data, analyzed_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('recurring_expenses')
      .select('id, provider_name, category, amount, frequency, last_seen_date')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('amount', { ascending: false }),
    supabase
      .from('documents')
      .select('id, period, analysis_data, created_at')
      .eq('user_id', user.id)
      .eq('document_type', 'payslip')
      .order('created_at', { ascending: true })
      .limit(12),
  ])

  // Extract net amount from each payslip for evolution chart
  const payslipEvolution = (payslipsRes.data || []).map(p => {
    const analysis = p.analysis_data as Record<string, unknown> | null
    const keyInfo = analysis?.key_info as Record<string, unknown> | undefined
    const rawAmount = keyInfo?.amount
    let amount = 0
    if (typeof rawAmount === 'number') amount = rawAmount
    else if (typeof rawAmount === 'string') {
      const parsed = parseFloat(rawAmount.replace(/[^\d.,-]/g, '').replace(',', '.'))
      if (!isNaN(parsed)) amount = parsed
    }
    return {
      id: p.id,
      label: p.period || new Date(p.created_at).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      amount,
    }
  }).filter(p => p.amount > 0)

  return <DashboardClient documents={docsRes.data || []} expenses={expensesRes.data || []} payslipEvolution={payslipEvolution} />
}
