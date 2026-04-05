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

  // Last 12 months window
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)
  twelveMonthsAgo.setDate(1)
  twelveMonthsAgo.setHours(0, 0, 0, 0)

  const [expensesRes, docsRes] = await Promise.all([
    supabase
      .from('recurring_expenses')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('amount', { ascending: false }),
    supabase
      .from('documents')
      .select('id, document_type, analysis_data, created_at')
      .eq('user_id', user.id)
      .in('document_type', ['invoice', 'receipt', 'utility_bill', 'insurance'])
      .gte('created_at', twelveMonthsAgo.toISOString())
      .order('created_at', { ascending: true }),
  ])

  // Build monthly evolution data
  const monthlyMap = new Map<string, number>()
  for (const doc of docsRes.data || []) {
    const d = new Date(doc.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const analysis = doc.analysis_data as Record<string, unknown> | null
    const keyInfo = analysis?.key_info as Record<string, unknown> | undefined
    const recurring = analysis?.recurring_info as { amount?: number } | undefined
    const amountRaw = recurring?.amount ?? keyInfo?.amount
    let amount = 0
    if (typeof amountRaw === 'number') amount = amountRaw
    else if (typeof amountRaw === 'string') {
      const parsed = parseFloat(amountRaw.replace(/[^\d.,-]/g, '').replace(',', '.'))
      if (!isNaN(parsed)) amount = parsed
    }
    if (amount > 0) monthlyMap.set(key, (monthlyMap.get(key) || 0) + amount)
  }

  // Fill in missing months with 0
  const monthly: { key: string; label: string; amount: number }[] = []
  const cursor = new Date(twelveMonthsAgo)
  const now = new Date()
  while (cursor <= now) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
    const label = cursor.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
    monthly.push({ key, label, amount: monthlyMap.get(key) || 0 })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return <ExpensesClient expenses={expensesRes.data || []} monthly={monthly} />
}
