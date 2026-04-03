import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-03-31.basil',
  typescript: true,
})

// ---------------------------------------------------------------------------
// Plan definitions
// ---------------------------------------------------------------------------

export type PlanId = 'free' | 'solo' | 'family'

export interface PlanConfig {
  id: PlanId
  name: string
  price: number // ILS per month, 0 for free
  stripePriceId: string | null // null for free plan
  limits: {
    documentsPerMonth: number
    assistantMessagesPerMonth: number
    historyDays: number
    maxMembers: number
  }
  trialDays: number // 60 for free, 0 for paid
  features: string[]
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    stripePriceId: null,
    limits: {
      documentsPerMonth: 3,
      assistantMessagesPerMonth: 0,
      historyDays: 7,
      maxMembers: 1,
    },
    trialDays: 60,
    features: [
      '3 analyses de documents/mois',
      'Questionnaire droits des olim',
      'Historique 7 jours',
      'Durée limitée à 2 mois',
    ],
  },
  solo: {
    id: 'solo',
    name: 'Solo',
    price: 39,
    stripePriceId: process.env.STRIPE_PRICE_SOLO || '',
    limits: {
      documentsPerMonth: 30,
      assistantMessagesPerMonth: 200,
      historyDays: 365,
      maxMembers: 1,
    },
    trialDays: 0,
    features: [
      '30 analyses de documents/mois',
      'Assistant IA illimité (200 msg/mois)',
      'Historique 1 an',
      'Traduction de messages hébreux',
      'Support prioritaire',
    ],
  },
  family: {
    id: 'family',
    name: 'Famille',
    price: 89,
    stripePriceId: process.env.STRIPE_PRICE_FAMILY || '',
    limits: {
      documentsPerMonth: 100,
      assistantMessagesPerMonth: 500,
      historyDays: 365,
      maxMembers: 5,
    },
    trialDays: 0,
    features: [
      '100 analyses de documents/mois',
      'Assistant IA illimité (500 msg/mois)',
      'Historique 1 an',
      'Jusqu\'à 5 membres',
      'Traduction de messages hébreux',
      'Support prioritaire',
    ],
  },
}

export function getPlan(planId: string): PlanConfig {
  return PLANS[planId as PlanId] || PLANS.free
}
