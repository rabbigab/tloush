/**
 * Shared parsing utilities for deadlines, amounts, and CSV escaping.
 * Extracted to enable unit testing.
 */

/**
 * Parse a date string from Claude analysis into ISO format (YYYY-MM-DD).
 * Handles JJ/MM/AAAA, DD.MM.YYYY, YYYY-MM-DD. Returns null if invalid.
 */
export function parseDeadline(raw: unknown): string | null {
  if (!raw || typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed || trimmed === 'null') return null

  const ddmmyyyy = trimmed.match(/^(\d{2})[/.](\d{2})[/.](\d{4})$/)
  if (ddmmyyyy) {
    const [, d, m, y] = ddmmyyyy
    return `${y}-${m}-${d}`
  }

  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) return trimmed

  return null
}

/**
 * Parse an amount value from analysis (number or string with currency/separators).
 * Returns 0 if unparseable.
 */
export function parseAmount(raw: unknown): number {
  if (typeof raw === 'number' && !isNaN(raw)) return raw
  if (typeof raw !== 'string') return 0
  const cleaned = raw.replace(/[^\d.,-]/g, '').replace(',', '.')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Convert a recurring-expense frequency to a monthly multiplier.
 * e.g. annual => 1/12, monthly => 1, one_time => 0.
 */
export function frequencyToMonthlyMultiplier(freq: string | null | undefined): number {
  const map: Record<string, number> = {
    monthly: 1,
    bimonthly: 0.5,
    quarterly: 1 / 3,
    annual: 1 / 12,
    one_time: 0,
  }
  return map[freq || 'monthly'] ?? 1
}

/**
 * Compute anomaly detection for a new amount vs previously tracked amount.
 * Returns null if no anomaly, else the pct deviation and severity level.
 */
export function detectAmountAnomaly(
  newAmount: number,
  previousAmount: number,
  thresholdPct = 20
): { pct: number; level: 'warning' | 'critical'; direction: 'up' | 'down' } | null {
  if (!previousAmount || previousAmount <= 0 || !newAmount || newAmount <= 0) return null
  const diff = newAmount - previousAmount
  const pct = Math.abs(diff / previousAmount) * 100
  if (pct < thresholdPct) return null
  return {
    pct,
    level: pct >= 50 ? 'critical' : 'warning',
    direction: diff > 0 ? 'up' : 'down',
  }
}

/**
 * Escape a value for safe inclusion in a CSV row.
 */
export function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}
