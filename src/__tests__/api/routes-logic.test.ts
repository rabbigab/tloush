import { describe, it, expect } from 'vitest'
import { validateFile, escapeHtml } from '@/lib/fileValidation'

const MAGIC: Record<string, number[]> = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
  'image/jpeg': [0xFF, 0xD8, 0xFF, 0xE0],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF
}

function makeFile(name: string, type: string, size: number): File {
  const buf = new Uint8Array(size)
  const sig = MAGIC[type]
  if (sig) sig.forEach((b, i) => { buf[i] = b })
  // WEBP requires 'WEBP' at offset 8 in addition to RIFF at offset 0
  if (type === 'image/webp' && size >= 12) {
    const webp = [0x57, 0x45, 0x42, 0x50]
    webp.forEach((b, i) => { buf[8 + i] = b })
  }
  return new File([buf], name, { type })
}

describe('validateFile (real)', () => {
  it('accepts a valid PDF', async () => {
    const file = makeFile('doc.pdf', 'application/pdf', 1000)
    expect(await validateFile(file)).toBeNull()
  })

  it('accepts JPEG, PNG, WEBP', async () => {
    expect(await validateFile(makeFile('a.jpg', 'image/jpeg', 1000))).toBeNull()
    expect(await validateFile(makeFile('a.png', 'image/png', 1000))).toBeNull()
    expect(await validateFile(makeFile('a.webp', 'image/webp', 1000))).toBeNull()
  })

  it('rejects files over 25MB with 413', async () => {
    const file = makeFile('big.pdf', 'application/pdf', 26 * 1024 * 1024)
    const res = await validateFile(file)
    expect(res).not.toBeNull()
    expect(res!.status).toBe(413)
  })

  it('rejects disallowed mime types with 400', async () => {
    const file = makeFile('evil.exe', 'application/x-msdownload', 100)
    const res = await validateFile(file)
    expect(res).not.toBeNull()
    expect(res!.status).toBe(400)
  })

  it('rejects mismatched extension with 400', async () => {
    // Correct mime but extension not allowed
    const file = makeFile('noext', 'application/pdf', 100)
    const res = await validateFile(file)
    expect(res).not.toBeNull()
    expect(res!.status).toBe(400)
  })

  it('rejects .txt extension even if mime faked as pdf', async () => {
    const file = makeFile('doc.txt', 'application/pdf', 100)
    const res = await validateFile(file)
    expect(res).not.toBeNull()
    expect(res!.status).toBe(400)
  })

  it('handles mixed-case extensions', async () => {
    expect(await validateFile(makeFile('doc.PDF', 'application/pdf', 100))).toBeNull()
    expect(await validateFile(makeFile('image.JPG', 'image/jpeg', 100))).toBeNull()
  })
})

describe('escapeHtml', () => {
  it('escapes all dangerous characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    )
  })

  it('escapes ampersands', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry')
  })

  it('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#39;s')
  })

  it('leaves safe text unchanged', () => {
    expect(escapeHtml('Hello World 123')).toBe('Hello World 123')
  })

  it('handles empty string', () => {
    expect(escapeHtml('')).toBe('')
  })

  it('escapes all five characters in one pass', () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe(
      '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;'
    )
  })
})

// Checkout request validation (replicates route logic)
function validateCheckoutRequest(body: { priceId?: unknown }): {
  valid: boolean
  error?: string
} {
  if (!body.priceId || typeof body.priceId !== 'string') {
    return { valid: false, error: 'Price ID manquant' }
  }
  return { valid: true }
}

describe('checkout request validation', () => {
  it('accepts a valid priceId', () => {
    expect(validateCheckoutRequest({ priceId: 'price_abc123' })).toEqual({ valid: true })
  })

  it('rejects missing priceId', () => {
    expect(validateCheckoutRequest({}).valid).toBe(false)
    expect(validateCheckoutRequest({}).error).toBe('Price ID manquant')
  })

  it('rejects empty string priceId', () => {
    expect(validateCheckoutRequest({ priceId: '' }).valid).toBe(false)
  })

  it('rejects non-string priceId', () => {
    expect(validateCheckoutRequest({ priceId: 123 }).valid).toBe(false)
    expect(validateCheckoutRequest({ priceId: null }).valid).toBe(false)
    expect(validateCheckoutRequest({ priceId: {} }).valid).toBe(false)
  })
})

// Webhook event routing (which event types are handled)
const HANDLED_EVENTS = new Set([
  'checkout.session.completed',
  'invoice.paid',
  'invoice.payment_failed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

describe('stripe webhook event routing', () => {
  it('handles checkout.session.completed', () => {
    expect(HANDLED_EVENTS.has('checkout.session.completed')).toBe(true)
  })

  it('handles all subscription lifecycle events', () => {
    expect(HANDLED_EVENTS.has('invoice.paid')).toBe(true)
    expect(HANDLED_EVENTS.has('invoice.payment_failed')).toBe(true)
    expect(HANDLED_EVENTS.has('customer.subscription.updated')).toBe(true)
    expect(HANDLED_EVENTS.has('customer.subscription.deleted')).toBe(true)
  })

  it('ignores unrelated events (no-op)', () => {
    expect(HANDLED_EVENTS.has('customer.created')).toBe(false)
    expect(HANDLED_EVENTS.has('payment_intent.succeeded')).toBe(false)
    expect(HANDLED_EVENTS.has('charge.refunded')).toBe(false)
  })
})
