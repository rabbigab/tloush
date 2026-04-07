import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { requireAuth } from '@/lib/apiAuth'
import { getSubscription } from '@/lib/subscription'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { user, supabase } = auth

    const sub = await getSubscription(supabase, user.id)

    if (!sub.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Aucun abonnement actif' },
        { status: 400 }
      )
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${req.headers.get('origin')}/profile`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[/api/stripe/portal]', err)
    return NextResponse.json(
      { error: 'Erreur lors de l\'accès au portail' },
      { status: 500 }
    )
  }
}
