import { describe, it, expect } from 'vitest'

/**
 * Extracted from src/app/api/preferences/route.ts PATCH handler.
 * Validates and picks only valid preference fields from the request body.
 */
function validatePreferencesUpdate(body: Record<string, unknown>): Record<string, unknown> {
  const updates: Record<string, unknown> = {}

  if (typeof body.email_digest_enabled === 'boolean') {
    updates.email_digest_enabled = body.email_digest_enabled
  }
  if (typeof body.digest_day === 'number' && body.digest_day >= 0 && body.digest_day <= 6) {
    updates.digest_day = body.digest_day
  }
  if (typeof body.urgent_alerts_enabled === 'boolean') {
    updates.urgent_alerts_enabled = body.urgent_alerts_enabled
  }

  return updates
}

describe('Preferences validation', () => {
  describe('email_digest_enabled', () => {
    it('accepts true', () => {
      const result = validatePreferencesUpdate({ email_digest_enabled: true })
      expect(result.email_digest_enabled).toBe(true)
    })

    it('accepts false', () => {
      const result = validatePreferencesUpdate({ email_digest_enabled: false })
      expect(result.email_digest_enabled).toBe(false)
    })

    it('rejects string value', () => {
      const result = validatePreferencesUpdate({ email_digest_enabled: 'true' })
      expect(result).not.toHaveProperty('email_digest_enabled')
    })

    it('rejects number value', () => {
      const result = validatePreferencesUpdate({ email_digest_enabled: 1 })
      expect(result).not.toHaveProperty('email_digest_enabled')
    })
  })

  describe('digest_day', () => {
    it('accepts 0 (Sunday)', () => {
      const result = validatePreferencesUpdate({ digest_day: 0 })
      expect(result.digest_day).toBe(0)
    })

    it('accepts 6 (Saturday)', () => {
      const result = validatePreferencesUpdate({ digest_day: 6 })
      expect(result.digest_day).toBe(6)
    })

    it('accepts 3 (Wednesday)', () => {
      const result = validatePreferencesUpdate({ digest_day: 3 })
      expect(result.digest_day).toBe(3)
    })

    it('rejects 7 (out of range)', () => {
      const result = validatePreferencesUpdate({ digest_day: 7 })
      expect(result).not.toHaveProperty('digest_day')
    })

    it('rejects -1 (negative)', () => {
      const result = validatePreferencesUpdate({ digest_day: -1 })
      expect(result).not.toHaveProperty('digest_day')
    })

    it('rejects string value', () => {
      const result = validatePreferencesUpdate({ digest_day: '1' })
      expect(result).not.toHaveProperty('digest_day')
    })
  })

  describe('urgent_alerts_enabled', () => {
    it('accepts true', () => {
      const result = validatePreferencesUpdate({ urgent_alerts_enabled: true })
      expect(result.urgent_alerts_enabled).toBe(true)
    })

    it('accepts false', () => {
      const result = validatePreferencesUpdate({ urgent_alerts_enabled: false })
      expect(result.urgent_alerts_enabled).toBe(false)
    })

    it('rejects string value', () => {
      const result = validatePreferencesUpdate({ urgent_alerts_enabled: 'yes' })
      expect(result).not.toHaveProperty('urgent_alerts_enabled')
    })
  })

  describe('combined updates', () => {
    it('accepts multiple valid fields at once', () => {
      const result = validatePreferencesUpdate({
        email_digest_enabled: true,
        digest_day: 5,
        urgent_alerts_enabled: false,
      })
      expect(result.email_digest_enabled).toBe(true)
      expect(result.digest_day).toBe(5)
      expect(result.urgent_alerts_enabled).toBe(false)
    })

    it('ignores unknown fields', () => {
      const result = validatePreferencesUpdate({ foo: 'bar', digest_day: 2 })
      expect(result).not.toHaveProperty('foo')
      expect(result.digest_day).toBe(2)
    })

    it('returns empty object when all values are invalid', () => {
      const result = validatePreferencesUpdate({
        email_digest_enabled: 'yes',
        digest_day: 10,
        urgent_alerts_enabled: 0,
      })
      expect(Object.keys(result)).toHaveLength(0)
    })
  })
})
