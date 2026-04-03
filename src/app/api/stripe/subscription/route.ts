import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { getSubscription, getUsage } from '@/lib/subscription'

export async function GET() {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { user, supabase } = auth

    const subscription = await getSubscription(supabase, user.id)
    const usage = await getUsage(supabase, user.id)

    return NextResponse.json({ subscription, usage })
  } catch (err) {
    console.error('[/api/stripe/subscription]', err)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'abonnement' },
      { status: 500 }
    )
  }
}
