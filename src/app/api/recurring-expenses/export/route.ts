import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  const { data: expenses } = await supabase
    .from('recurring_expenses')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('amount', { ascending: false })

  const headers = ['Fournisseur', 'Catégorie', 'Montant', 'Devise', 'Fréquence', 'Dernière vue', 'Documents liés']
  const rows = (expenses || []).map(e => [
    escapeCSV(e.provider_name),
    escapeCSV(e.category),
    escapeCSV(e.amount),
    escapeCSV(e.currency),
    escapeCSV(e.frequency),
    escapeCSV(e.last_seen_date),
    escapeCSV(Array.isArray(e.document_ids) ? e.document_ids.length : 0),
  ].join(','))

  const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="depenses-tloush-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
