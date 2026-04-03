import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Use service role for webhook (no user context)
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

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id
        if (!userId || !session.subscription) break

        const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id

        // Fetch the subscription to get the price and period
        const stripeSub = await stripe.subscriptions.retrieve(subId)
        const item = stripeSub.items.data[0]
        const priceId = item?.price.id || ''
        const planId = getPlanIdFromPrice(priceId)

        await supabaseAdmin
          .from('subscriptions')
          .update({
            plan_id: planId,
            status: 'active',
            stripe_customer_id: customerId,
            stripe_subscription_id: subId,
            current_period_start: new Date(item.current_period_start * 1000).toISOString(),
            current_period_end: new Date(item.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const subRef = invoice.parent?.subscription_details?.subscription
        if (!subRef) break
        const subId = typeof subRef === 'string' ? subRef : subRef.id

        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id

        const stripeSub = await stripe.subscriptions.retrieve(subId)
        const item = stripeSub.items.data[0]

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_start: new Date(item.current_period_start * 1000).toISOString(),
            current_period_end: new Date(item.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId)

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId)

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id
        const item = subscription.items.data[0]
        const priceId = item?.price.id || ''
        const planId = getPlanIdFromPrice(priceId)

        const status = subscription.status === 'active'
          ? 'active'
          : subscription.status === 'past_due'
            ? 'past_due'
            : 'canceled'

        await supabaseAdmin
          .from('subscriptions')
          .update({
            plan_id: planId,
            status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_start: new Date(item.current_period_start * 1000).toISOString(),
            current_period_end: new Date(item.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId)

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id

        await supabaseAdmin
          .from('subscriptions')
          .update({
            plan_id: 'free',
            status: 'canceled',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId)

        break
      }
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
