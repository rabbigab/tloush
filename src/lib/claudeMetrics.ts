// =====================================================
// Claude metrics logging
// =====================================================
// Fire-and-forget logging of Claude API calls for monitoring.
// Used by document upload/extract/scan/assistant routes.

import { createClient } from '@supabase/supabase-js'
import { computeClaudeCost } from './claudePricing'

interface ClaudeUsage {
  user_id?: string | null
  document_id?: string | null
  route: string
  model: string
  tokens_in: number
  tokens_out: number
  cache_read_tokens?: number
  cache_write_tokens?: number
  duration_ms?: number
  success: boolean
}

/**
 * Log un appel Claude de maniere fire-and-forget.
 * N'attend jamais la reponse, ne bloque jamais la fonction principale.
 */
export function logClaudeCall(usage: ClaudeUsage): void {
  // Ne bloque pas, erreurs silencieuses
  const run = async () => {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!url || !key) return

      const supabase = createClient(url, key)
      const cost = computeClaudeCost(
        usage.model,
        usage.tokens_in,
        usage.tokens_out,
        usage.cache_read_tokens || 0,
        usage.cache_write_tokens || 0
      )

      await supabase.from('claude_usage').insert({
        user_id: usage.user_id || null,
        document_id: usage.document_id || null,
        route: usage.route,
        model: usage.model,
        tokens_in: usage.tokens_in,
        tokens_out: usage.tokens_out,
        cache_read_tokens: usage.cache_read_tokens || 0,
        cache_write_tokens: usage.cache_write_tokens || 0,
        duration_ms: usage.duration_ms || null,
        cost_usd: cost,
        success: usage.success,
      })
    } catch (err) {
      console.error('[claudeMetrics] Failed to log:', err)
    }
  }
  // Ne pas attendre
  run()
}

/**
 * Extrait les usages depuis une reponse Anthropic SDK.
 */
export function extractUsage(message: {
  usage?: {
    input_tokens?: number
    output_tokens?: number
    cache_read_input_tokens?: number
    cache_creation_input_tokens?: number
  }
}): { tokens_in: number; tokens_out: number; cache_read: number; cache_write: number } {
  return {
    tokens_in: message.usage?.input_tokens || 0,
    tokens_out: message.usage?.output_tokens || 0,
    cache_read: message.usage?.cache_read_input_tokens || 0,
    cache_write: message.usage?.cache_creation_input_tokens || 0,
  }
}

/**
 * Log une erreur serveur dans error_log (fire-and-forget).
 */
export function logError(params: {
  user_id?: string | null
  endpoint: string
  error_code?: string
  error_message: string
  stack_trace?: string
  severity?: 'info' | 'warning' | 'error' | 'critical'
  metadata?: Record<string, unknown>
}): void {
  const run = async () => {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!url || !key) return

      const supabase = createClient(url, key)

      // Deduplication : si une erreur identique existe deja (meme endpoint + message),
      // incrementer le compteur au lieu d'inserer une nouvelle ligne.
      const { data: existing } = await supabase
        .from('error_log')
        .select('id, occurrence_count')
        .eq('endpoint', params.endpoint)
        .eq('error_message', params.error_message)
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existing) {
        await supabase
          .from('error_log')
          .update({
            occurrence_count: (existing.occurrence_count || 1) + 1,
            last_seen_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
      } else {
        await supabase.from('error_log').insert({
          user_id: params.user_id || null,
          endpoint: params.endpoint,
          error_code: params.error_code || null,
          error_message: params.error_message,
          stack_trace: params.stack_trace || null,
          severity: params.severity || 'error',
          metadata: params.metadata || {},
        })
      }
    } catch (err) {
      console.error('[claudeMetrics] Failed to log error:', err)
    }
  }
  run()
}
