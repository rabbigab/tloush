import { SupabaseClient, User } from '@supabase/supabase-js'
import { PLANS, type PlanId, type PlanConfig } from '@/lib/stripe'

export interface SubscriptionInfo {
  planId: PlanId
  plan: PlanConfig
  status: 'active' | 'canceled' | 'past_due' | 'expired' | 'trial_expired'
  isTrialActive: boolean
  trialDaysLeft: number
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
}

export interface UsageInfo {
  documentsAnalyzed: number
  assistantMessages: number
  documentsLimit: number
  assistantLimit: number
  documentsRemaining: number
  assistantRemaining: number
}

// ---------------------------------------------------------------------------
// Get subscription info for a user
// ---------------------------------------------------------------------------

export async function getSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<SubscriptionInfo> {
  const { data: sub, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  // If table doesn't exist or query fails, allow access (graceful degradation)
  if (error && error.code !== 'PGRST116') {
    // PGRST116 = "no rows found" which is expected for new users
    // Any other error (table doesn't exist, etc.) → allow access
    console.warn('[subscription] Query error, allowing access:', error.message)
    return {
      planId: 'free',
      plan: PLANS.free,
      status: 'active',
      isTrialActive: true,
      trialDaysLeft: 60,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    }
  }

  if (!sub) {
    // No subscription row — create one automatically
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 60)

    await supabase.from('subscriptions').insert({
      user_id: userId,
      plan_id: 'free',
      status: 'active',
      trial_start: new Date().toISOString(),
      trial_end: trialEnd.toISOString(),
    }).single()

    return {
      planId: 'free',
      plan: PLANS.free,
      status: 'active',
      isTrialActive: true,
      trialDaysLeft: 60,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    }
  }

  const planId = (sub.plan_id as PlanId) || 'free'
  const plan = PLANS[planId] || PLANS.free

  // Check trial expiration for free plan
  let status = sub.status as SubscriptionInfo['status']
  let isTrialActive = false
  let trialDaysLeft = 0

  if (planId === 'free' && sub.trial_end) {
    const trialEnd = new Date(sub.trial_end)
    const now = new Date()
    trialDaysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

    if (now > trialEnd) {
      status = 'trial_expired'
      isTrialActive = false
    } else {
      isTrialActive = true
    }
  }

  return {
    planId,
    plan,
    status,
    isTrialActive,
    trialDaysLeft,
    stripeCustomerId: sub.stripe_customer_id,
    stripeSubscriptionId: sub.stripe_subscription_id,
  }
}

// ---------------------------------------------------------------------------
// Get current month usage for a user
// ---------------------------------------------------------------------------

export async function getUsage(
  supabase: SupabaseClient,
  userId: string
): Promise<UsageInfo> {
  const period = getCurrentPeriod()

  const { data: usage, error } = await supabase
    .from('usage_tracking')
    .select('documents_analyzed, assistant_messages')
    .eq('user_id', userId)
    .eq('period', period)
    .single()

  // If table doesn't exist or query fails, return zero usage (allow access)
  if (error && error.code !== 'PGRST116') {
    console.warn('[usage] Query error, returning zero usage:', error.message)
  }

  const sub = await getSubscription(supabase, userId)
  const limits = sub.plan.limits

  const documentsAnalyzed = usage?.documents_analyzed || 0
  const assistantMessages = usage?.assistant_messages || 0

  return {
    documentsAnalyzed,
    assistantMessages,
    documentsLimit: limits.documentsPerMonth,
    assistantLimit: limits.assistantMessagesPerMonth,
    documentsRemaining: Math.max(0, limits.documentsPerMonth - documentsAnalyzed),
    assistantRemaining: Math.max(0, limits.assistantMessagesPerMonth - assistantMessages),
  }
}

// ---------------------------------------------------------------------------
// Increment usage counter (call after each API use)
// ---------------------------------------------------------------------------

export async function incrementUsage(
  supabase: SupabaseClient,
  userId: string,
  type: 'documents_analyzed' | 'assistant_messages'
): Promise<void> {
  const period = getCurrentPeriod()

  try {
    // Upsert: create if not exists, increment if exists
    const { data: existing } = await supabase
      .from('usage_tracking')
      .select('id, documents_analyzed, assistant_messages')
      .eq('user_id', userId)
      .eq('period', period)
      .single()

    if (existing) {
      await supabase
        .from('usage_tracking')
        .update({
          [type]: (existing[type] || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('usage_tracking')
        .insert({
          user_id: userId,
          period,
          [type]: 1,
        })
    }
  } catch (err) {
    // If table doesn't exist, just log and continue
    console.warn('[usage] Failed to increment usage, skipping:', err)
  }
}

// ---------------------------------------------------------------------------
// Check if user can perform an action
// ---------------------------------------------------------------------------

export async function canUseFeature(
  supabase: SupabaseClient,
  userId: string,
  feature: 'document_analysis' | 'assistant_chat'
): Promise<{ allowed: boolean; reason?: string }> {
  const sub = await getSubscription(supabase, userId)

  // Check if subscription is active
  if (sub.status === 'trial_expired') {
    return {
      allowed: false,
      reason: 'Votre essai gratuit de 2 mois est terminé. Choisissez un plan pour continuer.',
    }
  }

  if (sub.status === 'expired' || sub.status === 'canceled') {
    return {
      allowed: false,
      reason: 'Votre abonnement a expiré. Renouvelez pour continuer.',
    }
  }

  if (sub.status === 'past_due') {
    return {
      allowed: false,
      reason: 'Votre paiement est en retard. Mettez à jour vos informations de paiement.',
    }
  }

  // Check feature access (assistant is paid-only)
  if (feature === 'assistant_chat' && sub.planId === 'free') {
    return {
      allowed: false,
      reason: 'L\'assistant IA est disponible avec un plan payant. Passez au plan Solo ou Famille.',
    }
  }

  // Check usage limits
  const usage = await getUsage(supabase, userId)

  if (feature === 'document_analysis' && usage.documentsRemaining <= 0) {
    return {
      allowed: false,
      reason: `Vous avez atteint la limite de ${usage.documentsLimit} analyses ce mois-ci. Passez à un plan supérieur pour plus d'analyses.`,
    }
  }

  if (feature === 'assistant_chat' && usage.assistantRemaining <= 0) {
    return {
      allowed: false,
      reason: `Vous avez atteint la limite de ${usage.assistantLimit} messages ce mois-ci.`,
    }
  }

  return { allowed: true }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCurrentPeriod(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}
