import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getPlan, PLANS } from '@/lib/stripe'

describe('stripe plan config', () => {
  it('returns free plan for unknown id', () => {
    expect(getPlan('unknown').id).toBe('free')
    expect(getPlan('').id).toBe('free')
  })

  it('returns the matching plan', () => {
    expect(getPlan('solo').id).toBe('solo')
    expect(getPlan('family').id).toBe('family')
    expect(getPlan('free').id).toBe('free')
  })

  it('has correct pricing (49 ILS Solo / 99 ILS Family)', () => {
    expect(PLANS.free.price).toBe(0)
    expect(PLANS.solo.price).toBe(49)
    expect(PLANS.family.price).toBe(99)
  })

  it('has correct document quotas', () => {
    expect(PLANS.free.limits.documentsPerMonth).toBe(5)
    expect(PLANS.solo.limits.documentsPerMonth).toBe(50)
    expect(PLANS.family.limits.documentsPerMonth).toBe(150)
  })

  it('has correct member limits', () => {
    expect(PLANS.free.limits.maxMembers).toBe(1)
    expect(PLANS.solo.limits.maxMembers).toBe(1)
    expect(PLANS.family.limits.maxMembers).toBe(5)
  })

  it('free plan has 60 days trial, paid plans have no trial', () => {
    expect(PLANS.free.trialDays).toBe(60)
    expect(PLANS.solo.trialDays).toBe(0)
    expect(PLANS.family.trialDays).toBe(0)
  })

  it('free plan has null stripePriceId', () => {
    expect(PLANS.free.stripePriceId).toBeNull()
  })
})

// Replicates the webhook's getPlanIdFromPrice logic
function getPlanIdFromPrice(priceId: string, env: Record<string, string | undefined>): string {
  if (priceId === env.STRIPE_PRICE_SOLO) return 'solo'
  if (priceId === env.STRIPE_PRICE_FAMILY) return 'family'
  return 'free'
}

describe('stripe webhook plan mapping', () => {
  const env = {
    STRIPE_PRICE_SOLO: 'price_solo_49',
    STRIPE_PRICE_FAMILY: 'price_family_99',
  }

  it('maps solo price id to solo plan', () => {
    expect(getPlanIdFromPrice('price_solo_49', env)).toBe('solo')
  })

  it('maps family price id to family plan', () => {
    expect(getPlanIdFromPrice('price_family_99', env)).toBe('family')
  })

  it('falls back to free for unknown price', () => {
    expect(getPlanIdFromPrice('price_unknown', env)).toBe('free')
    expect(getPlanIdFromPrice('', env)).toBe('free')
  })

  it('falls back to free when env vars are undefined', () => {
    expect(getPlanIdFromPrice('price_solo_49', {})).toBe('free')
  })
})

// Replicates the webhook's subscription status mapping
function mapStripeStatus(stripeStatus: string): 'active' | 'past_due' | 'canceled' {
  return stripeStatus === 'active'
    ? 'active'
    : stripeStatus === 'past_due'
      ? 'past_due'
      : 'canceled'
}

describe('stripe subscription status mapping', () => {
  it('maps active to active', () => {
    expect(mapStripeStatus('active')).toBe('active')
  })

  it('maps past_due to past_due', () => {
    expect(mapStripeStatus('past_due')).toBe('past_due')
  })

  it('maps canceled/incomplete/unpaid to canceled', () => {
    expect(mapStripeStatus('canceled')).toBe('canceled')
    expect(mapStripeStatus('incomplete')).toBe('canceled')
    expect(mapStripeStatus('unpaid')).toBe('canceled')
    expect(mapStripeStatus('incomplete_expired')).toBe('canceled')
    expect(mapStripeStatus('trialing')).toBe('canceled')
  })
})
