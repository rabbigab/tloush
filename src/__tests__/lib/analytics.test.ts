import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock posthog-js to avoid import side effects
vi.mock('posthog-js', () => ({
  default: {
    capture: vi.fn(),
    identify: vi.fn(),
  },
}))

import { track, identifyUser } from '@/lib/analytics'

describe('analytics - track()', () => {
  beforeEach(() => {
    // Ensure __ph_initialized is not set
    delete (window as any).__ph_initialized
  })

  it('does not throw when posthog is not initialized', () => {
    expect(() => track('file_uploaded')).not.toThrow()
  })

  it('does not throw when called with properties', () => {
    expect(() => track('extraction_started', { docId: '123' })).not.toThrow()
  })

  it('does not throw when __ph_initialized is false', () => {
    ;(window as any).__ph_initialized = false
    expect(() => track('page_viewed')).not.toThrow()
  })
})

describe('analytics - identifyUser()', () => {
  beforeEach(() => {
    delete (window as any).__ph_initialized
  })

  it('does not throw when posthog is not initialized', () => {
    expect(() => identifyUser('user-1')).not.toThrow()
  })

  it('does not throw when called with traits', () => {
    expect(() => identifyUser('user-1', { plan: 'pro' })).not.toThrow()
  })

  it('does not throw when __ph_initialized is false', () => {
    ;(window as any).__ph_initialized = false
    expect(() => identifyUser('user-2', { lang: 'fr' })).not.toThrow()
  })
})
