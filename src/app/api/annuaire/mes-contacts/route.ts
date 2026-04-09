import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user } = auth

  const { data: contacts } = await supabaseAdmin
    .from('provider_contacts')
    .select('provider_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!contacts?.length) {
    return NextResponse.json({ contacts: [] })
  }

  // Fetch provider names
  const providerIds = contacts.map(c => c.provider_id)
  const { data: providers } = await supabaseAdmin
    .from('providers')
    .select('id, first_name, last_name, category')
    .in('id', providerIds)

  const providerMap = new Map((providers || []).map(p => [p.id, p]))

  const enriched = contacts.map(c => {
    const p = providerMap.get(c.provider_id)
    return {
      provider_id: c.provider_id,
      created_at: c.created_at,
      provider_name: p ? `${p.first_name} ${p.last_name.charAt(0)}.` : 'Inconnu',
      provider_category: p?.category || '',
    }
  })

  return NextResponse.json({ contacts: enriched })
}
