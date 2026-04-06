import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  const body = await req.json()

  const providerName = (body.provider_name || '').trim()
  if (!providerName) {
    return NextResponse.json({ error: 'Nom du fournisseur requis' }, { status: 400 })
  }

  const amount = typeof body.amount === 'number' ? body.amount : null
  const frequency = body.frequency || 'monthly'
  const category = body.category || 'autre'
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('recurring_expenses')
    .insert({
      user_id: user.id,
      provider_name: providerName,
      category,
      amount,
      currency: 'ILS',
      frequency,
      last_seen_date: today,
      document_ids: [],
      status: 'active',
    })
    .select()
    .single()

  if (error) {
    console.error('[POST recurring-expenses]', error)
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }

  return NextResponse.json({ expense: data })
}
