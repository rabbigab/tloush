import { describe, it, expect } from 'vitest'
import {
  parseDeadline,
  parseAmount,
  frequencyToMonthlyMultiplier,
  detectAmountAnomaly,
  escapeCSV,
} from '@/lib/parsers'

describe('parseDeadline', () => {
  it('parses DD/MM/YYYY', () => {
    expect(parseDeadline('15/06/2025')).toBe('2025-06-15')
  })

  it('parses DD.MM.YYYY', () => {
    expect(parseDeadline('15.06.2025')).toBe('2025-06-15')
  })

  it('returns ISO date as-is', () => {
    expect(parseDeadline('2025-06-15')).toBe('2025-06-15')
  })

  it('handles whitespace', () => {
    expect(parseDeadline('  15/06/2025  ')).toBe('2025-06-15')
  })

  it('returns null for empty/null/undefined', () => {
    expect(parseDeadline(null)).toBeNull()
    expect(parseDeadline(undefined)).toBeNull()
    expect(parseDeadline('')).toBeNull()
    expect(parseDeadline('null')).toBeNull()
  })

  it('returns null for invalid formats', () => {
    expect(parseDeadline('tomorrow')).toBeNull()
    expect(parseDeadline('15 juin 2025')).toBeNull()
    expect(parseDeadline('2025/06/15')).toBeNull()
    expect(parseDeadline(12345)).toBeNull()
  })
})

describe('parseAmount', () => {
  it('returns numbers as-is', () => {
    expect(parseAmount(1234.56)).toBe(1234.56)
    expect(parseAmount(0)).toBe(0)
  })

  it('parses plain numeric strings', () => {
    expect(parseAmount('1234')).toBe(1234)
    expect(parseAmount('1234.56')).toBe(1234.56)
  })

  it('parses with comma as decimal separator', () => {
    expect(parseAmount('1234,56')).toBe(1234.56)
  })

  it('strips currency symbols', () => {
    expect(parseAmount('1234₪')).toBe(1234)
    expect(parseAmount('1234 ILS')).toBe(1234)
    expect(parseAmount('$1234')).toBe(1234)
  })

  it('returns 0 for unparseable values', () => {
    expect(parseAmount('abc')).toBe(0)
    expect(parseAmount(null)).toBe(0)
    expect(parseAmount(undefined)).toBe(0)
    expect(parseAmount({})).toBe(0)
  })
})

describe('frequencyToMonthlyMultiplier', () => {
  it('maps known frequencies correctly', () => {
    expect(frequencyToMonthlyMultiplier('monthly')).toBe(1)
    expect(frequencyToMonthlyMultiplier('bimonthly')).toBe(0.5)
    expect(frequencyToMonthlyMultiplier('annual')).toBeCloseTo(1 / 12)
    expect(frequencyToMonthlyMultiplier('quarterly')).toBeCloseTo(1 / 3)
    expect(frequencyToMonthlyMultiplier('one_time')).toBe(0)
  })

  it('defaults to monthly when null/undefined', () => {
    expect(frequencyToMonthlyMultiplier(null)).toBe(1)
    expect(frequencyToMonthlyMultiplier(undefined)).toBe(1)
  })

  it('defaults to 1 for unknown frequencies', () => {
    expect(frequencyToMonthlyMultiplier('weekly')).toBe(1)
  })
})

describe('detectAmountAnomaly', () => {
  it('returns null when deviation < threshold', () => {
    expect(detectAmountAnomaly(105, 100)).toBeNull() // 5% < 20%
    expect(detectAmountAnomaly(115, 100)).toBeNull() // 15% < 20%
  })

  it('detects warning for 20-50% deviation', () => {
    const res = detectAmountAnomaly(125, 100)
    expect(res).not.toBeNull()
    expect(res!.level).toBe('warning')
    expect(res!.direction).toBe('up')
    expect(res!.pct).toBe(25)
  })

  it('detects critical for ≥50% deviation', () => {
    const res = detectAmountAnomaly(200, 100)
    expect(res!.level).toBe('critical')
    expect(res!.pct).toBe(100)
  })

  it('detects downward direction', () => {
    const res = detectAmountAnomaly(60, 100)
    expect(res!.direction).toBe('down')
    expect(res!.pct).toBe(40)
  })

  it('returns null for invalid input', () => {
    expect(detectAmountAnomaly(0, 100)).toBeNull()
    expect(detectAmountAnomaly(100, 0)).toBeNull()
    expect(detectAmountAnomaly(-10, 100)).toBeNull()
  })

  it('respects custom threshold', () => {
    expect(detectAmountAnomaly(110, 100, 5)).not.toBeNull()
    expect(detectAmountAnomaly(110, 100, 15)).toBeNull()
  })
})

describe('escapeCSV', () => {
  it('returns plain strings as-is', () => {
    expect(escapeCSV('hello')).toBe('hello')
    expect(escapeCSV('1234')).toBe('1234')
  })

  it('wraps strings with commas in double quotes', () => {
    expect(escapeCSV('a, b')).toBe('"a, b"')
  })

  it('escapes internal double quotes by doubling them', () => {
    expect(escapeCSV('say "hi"')).toBe('"say ""hi"""')
  })

  it('handles newlines', () => {
    expect(escapeCSV('line1\nline2')).toBe('"line1\nline2"')
  })

  it('handles null/undefined as empty string', () => {
    expect(escapeCSV(null)).toBe('')
    expect(escapeCSV(undefined)).toBe('')
  })

  it('converts numbers to strings', () => {
    expect(escapeCSV(42)).toBe('42')
  })
})
