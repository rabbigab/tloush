import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
if (!stripeSecretKey && process.env.NODE_ENV === 'production') {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set')
}

export const stripe = new Stripe(stripeSecretKey || 'sk_test_placeholder', {
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
    name: 'Découverte',
    price: 0,
    stripePriceId: null,
    limits: {
      documentsPerMonth: 3, // 3 docs au TOTAL (pas par mois) — géré dans canUseFeature
      assistantMessagesPerMonth: 0,
      historyDays: 30,
      maxMembers: 1,
    },
    trialDays: 0, // Plus de trial — 3 docs gratuits puis paywall
    features: [
      'Analysez vos premiers documents',
      'Résultat complet en français',
      'Historique 30 jours',
    ],
  },
  solo: {
    id: 'solo',
    name: 'Solo',
    price: 49,
    stripePriceId: process.env.STRIPE_PRICE_SOLO || '',
    limits: {
      documentsPerMonth: 50,
      assistantMessagesPerMonth: 500,
      historyDays: 365,
      maxMembers: 1,
    },
    trialDays: 0,
    features: [
      'Analyse complète de tous vos documents',
      'Détection des anomalies et points à vérifier',
      'Rappels automatiques avant les échéances',
      'Suivi de vos dépenses récurrentes',
      'Assistant personnel intelligent',
      'Récapitulatif hebdomadaire par email',
      'Historique complet et sécurisé',
    ],
  },
  family: {
    id: 'family',
    name: 'Famille',
    price: 99,
    stripePriceId: process.env.STRIPE_PRICE_FAMILY || '',
    limits: {
      documentsPerMonth: 150,
      assistantMessagesPerMonth: 1000,
      historyDays: 365,
      maxMembers: 5,
    },
    trialDays: 0,
    features: [
      'Tout le plan Solo',
      'Jusqu\'à 5 membres de la famille',
      'Documents et dépenses de toute la famille',
      'Suivi global : travail, logement, finances',
      'Alertes et résumés pour toute la famille',
    ],
  },
}

export function getPlan(planId: string): PlanConfig {
  return PLANS[planId as PlanId] || PLANS.free
}
