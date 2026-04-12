// =====================================================
// Claude API pricing (USD per 1M tokens)
// =====================================================
// Source: https://www.anthropic.com/pricing
// Mise a jour 2026-04. A revoir si Anthropic change ses tarifs.

export interface ModelPricing {
  input: number      // USD per 1M input tokens
  output: number     // USD per 1M output tokens
  cacheWrite: number // USD per 1M cache write tokens
  cacheRead: number  // USD per 1M cache read tokens
}

export const CLAUDE_PRICING: Record<string, ModelPricing> = {
  'claude-sonnet-4-5': {
    input: 3.00,
    output: 15.00,
    cacheWrite: 3.75,
    cacheRead: 0.30,
  },
  'claude-opus-4-6': {
    input: 15.00,
    output: 75.00,
    cacheWrite: 18.75,
    cacheRead: 1.50,
  },
  'claude-haiku-4-5': {
    input: 0.25,
    output: 1.25,
    cacheWrite: 0.30,
    cacheRead: 0.03,
  },
}

const DEFAULT_MODEL = 'claude-sonnet-4-5'

/**
 * Calcule le cout d'un appel Claude en USD.
 */
export function computeClaudeCost(
  model: string,
  tokensIn: number,
  tokensOut: number,
  cacheReadTokens = 0,
  cacheWriteTokens = 0
): number {
  const pricing = CLAUDE_PRICING[model] || CLAUDE_PRICING[DEFAULT_MODEL]

  // Les tokens "normaux" in sont ceux qui ne sont pas deja dans le cache
  const normalInTokens = Math.max(0, tokensIn - cacheReadTokens - cacheWriteTokens)

  const cost =
    (normalInTokens / 1_000_000) * pricing.input +
    (tokensOut / 1_000_000) * pricing.output +
    (cacheReadTokens / 1_000_000) * pricing.cacheRead +
    (cacheWriteTokens / 1_000_000) * pricing.cacheWrite

  return Math.round(cost * 1_000_000) / 1_000_000 // 6 decimales
}

/**
 * Formatage du cout pour affichage.
 */
export function formatCost(usd: number): string {
  if (usd < 0.01) return `$${usd.toFixed(6)}`
  if (usd < 1) return `$${usd.toFixed(4)}`
  return `$${usd.toFixed(2)}`
}
