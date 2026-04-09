import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user } = auth

  const body = await req.json()
  const { provider_id, whatsapp_opted_in } = body

  if (!provider_id) {
    return NextResponse.json({ error: 'provider_id requis' }, { status: 400 })
  }

  // Check provider exists and is active
  const { data: provider, error: providerError } = await supabaseAdmin
    .from('providers')
    .select('id, phone, first_name, last_name')
    .eq('id', provider_id)
    .eq('status', 'active')
    .single()

  if (providerError || !provider) {
    return NextResponse.json({ error: 'Prestataire introuvable' }, { status: 404 })
  }

  // Upsert contact (idempotent — same user+provider = same row)
  const { error: contactError } = await supabaseAdmin
    .from('provider_contacts')
    .upsert({
      user_id: user.id,
      provider_id,
      whatsapp_opted_in: !!whatsapp_opted_in,
    }, {
      onConflict: 'user_id,provider_id',
    })

  if (contactError) {
    return NextResponse.json({ error: contactError.message }, { status: 500 })
  }

  return NextResponse.json({
    phone: provider.phone,
    first_name: provider.first_name,
    last_name_initial: provider.last_name.charAt(0),
  })
}
