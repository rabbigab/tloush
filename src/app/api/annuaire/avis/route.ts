import { NextRequest, NextResponse } from 'next/server'
import { verifyReviewToken } from '@/lib/reviewTokens'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requete invalide' }, { status: 400 })
  }
  const token = body.token as string | undefined
  const rating = body.rating as number | undefined
  const comment = body.comment as string | undefined

  if (!token || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Token et note (1-5) requis' }, { status: 400 })
  }

  // Verify the signed review token
  let payload: { userId: string; providerId: string }
  try {
    payload = await verifyReviewToken(token as string)
  } catch {
    return NextResponse.json({ error: 'Lien expire ou invalide. Demandez un nouveau lien.' }, { status: 401 })
  }

  // Check that a contact exists for this user+provider pair
  const { data: contact } = await supabaseAdmin
    .from('provider_contacts')
    .select('id')
    .eq('user_id', payload.userId)
    .eq('provider_id', payload.providerId)
    .single()

  if (!contact) {
    return NextResponse.json({ error: 'Aucun contact enregistre pour ce prestataire' }, { status: 400 })
  }

  // Upsert review (1 review per user per provider)
  const { error } = await supabaseAdmin
    .from('provider_reviews')
    .upsert({
      user_id: payload.userId,
      provider_id: payload.providerId,
      contact_id: contact.id,
      rating: Math.round(rating),
      comment: comment?.trim() || null,
      status: 'pending',
    }, {
      onConflict: 'user_id,provider_id',
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
