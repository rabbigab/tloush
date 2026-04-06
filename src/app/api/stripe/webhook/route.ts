import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[stripe webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Idempotence : ignorer les events déjà traités (Stripe peut réenvoyer en cas d'échec)
  const { data: alreadyProcessed } = await supabaseAdmin
    .from('processed_webhook_events')
    .select('stripe_event_id')
    .eq('stripe_event_id', event.id)
    .single()

  if (alreadyProcessed) {
    console.log(`[stripe webhook] Duplicate event ignored: ${event.id}`)
    return NextResponse.json({ received: true, duplicate: true })
  }

  // Marquer l'event comme en cours de traitement (avant le switch pour éviter les races)
  await supabaseAdmin
    .from('processed_webhook_events')
    .insert({ stripe_event_id: event.id })

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id
        const subscriptionId = session.subscription as string

        if (!userId || !subscriptionId) break

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price.id
        const planId = getPlanIdFromPrice(priceId)
        const item = subscription.items.data[0]

        await supabaseAdmin
          .from('subscriptions')
          .update({
            plan_id: planId,
            status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscriptionId,
            current_period_start: new Date((item?.current_period_start ?? 0) * 1000).toISOString(),
            current_period_end: new Date((item?.current_period_end ?? 0) * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        console.log(`[stripe webhook] Subscription activated for user ${userId}: plan ${planId}`)

        // --- Referral reward: if this user was referred, grant 1 free month Solo to the referrer ---
        try {
          const { data: referral } = await supabaseAdmin
            .from('referrals')
            .select('id, referrer_id, referred_upgraded')
            .eq('referred_id', userId)
            .eq('referred_upgraded', false)
            .single()

          if (referral) {
            // Mark referral as upgraded
            await supabaseAdmin
              .from('referrals')
              .update({ referred_upgraded: true, upgraded_at: new Date().toISOString() })
              .eq('id', referral.id)

            // Grant +1 free month to the referrer
            const { data: existingBonus } = await supabaseAdmin
              .from('referral_bonuses')
              .select('id, free_months_earned')
              .eq('user_id', referral.referrer_id)
              .single()

            if (existingBonus) {
              await supabaseAdmin
                .from('referral_bonuses')
                .update({
                  free_months_earned: (existingBonus.free_months_earned || 0) + 1,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', existingBonus.id)
            } else {
              await supabaseAdmin.from('referral_bonuses').insert({
                user_id: referral.referrer_id,
                bonus_analyses: 0,
                free_months_earned: 1,
              })
            }

            // Upgrade referrer to Solo for 1 month if they're on free plan
            const { data: referrerSub } = await supabaseAdmin
              .from('subscriptions')
              .select('plan_id')
              .eq('user_id', referral.referrer_id)
              .single()

            if (referrerSub?.plan_id === 'free') {
              const oneMonthFromNow = new Date()
              oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1)

              await supabaseAdmin
                .from('subscriptions')
                .update({
                  plan_id: 'solo',
                  status: 'active',
                  current_period_start: new Date().toISOString(),
                  current_period_end: oneMonthFromNow.toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq('user_id', referral.referrer_id)

              console.log(`[stripe webhook] Referral reward: user ${referral.referrer_id} upgraded to Solo for 1 month`)
            }
          }
        } catch (refErr) {
          console.error('[stripe webhook] Referral reward error:', refErr)
        }

        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const sub = invoice.parent?.subscription_details?.subscription
        const subscriptionId = typeof sub === 'string' ? sub : sub?.id
        if (!subscriptionId) break

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = subscription.metadata?.supabase_user_id
          ?? (await getSupabaseUserByCustomer(invoice.customer as string))

        if (!userId) break

        const priceId = subscription.items.data[0]?.price.id
        const planId = getPlanIdFromPrice(priceId)
        const item = subscription.items.data[0]

        await supabaseAdmin
          .from('subscriptions')
          .update({
            plan_id: planId,
            status: 'active',
            current_period_start: new Date((item?.current_period_start ?? 0) * 1000).toISOString(),
            current_period_end: new Date((item?.current_period_end ?? 0) * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        console.log(`[stripe webhook] Invoice paid for user ${userId}: plan ${planId}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const userId = await getSupabaseUserByCustomer(invoice.customer as string)
        if (!userId) break

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        console.log(`[stripe webhook] Payment failed for user ${userId}`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = await getSupabaseUserByCustomer(subscription.customer as string)
        if (!userId) break

        const priceId = subscription.items.data[0]?.price.id
        const planId = getPlanIdFromPrice(priceId)
        const item = subscription.items.data[0]

        const status = subscription.cancel_at_period_end ? 'active' : mapStripeStatus(subscription.status)

        await supabaseAdmin
          .from('subscriptions')
          .update({
            plan_id: planId,
            status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_start: new Date((item?.current_period_start ?? 0) * 1000).toISOString(),
            current_period_end: new Date((item?.current_period_end ?? 0) * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        console.log(`[stripe webhook] Subscription updated for user ${userId}: ${planId} / ${status}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = await getSupabaseUserByCustomer(subscription.customer as string)
        if (!userId) break

        await supabaseAdmin
          .from('subscriptions')
          .update({
            plan_id: 'free',
            status: 'canceled',
            stripe_subscription_id: null,
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        console.log(`[stripe webhook] Subscription canceled for user ${userId}, downgraded to free`)
        break
      }

      case 'invoice.payment_action_required': {
        // SCA/3DS requis — mettre l'abonnement en past_due jusqu'à résolution
        const invoice = event.data.object as Stripe.Invoice
        const userId = await getSupabaseUserByCustomer(invoice.customer as string)
        if (!userId) break

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        console.log(`[stripe webhook] Payment action required (SCA) for user ${userId}`)
        break
      }

      case 'customer.subscription.trial_will_end': {
        // Trial se termine dans 3 jours — logguer pour déclencher un email de rappel
        const subscription = event.data.object as Stripe.Subscription
        const userId = await getSupabaseUserByCustomer(subscription.customer as string)
        console.log(`[stripe webhook] Trial ending soon for user ${userId || 'unknown'}`)
        // TODO: envoyer un email de rappel via /api/alerts/trial-ending
        break
      }

      default:
        console.log(`[stripe webhook] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[stripe webhook] Error processing event:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

function getPlanIdFromPrice(priceId: string): string {
  if (priceId === process.env.STRIPE_PRICE_SOLO) return 'solo'
  if (priceId === process.env.STRIPE_PRICE_FAMILY) return 'family'
  return 'free'
}

function mapStripeStatus(status: Stripe.Subscription.Status): string {
  switch (status) {
    case 'active': return 'active'
    case 'past_due': return 'past_due'
    case 'canceled': return 'canceled'
    case 'unpaid': return 'past_due'
    case 'trialing': return 'active'
    default: return 'active'
  }
}

async function getSupabaseUserByCustomer(customerId: string): Promise<string | null> {
  if (!customerId) return null
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()
  return data?.user_id ?? null
      }
