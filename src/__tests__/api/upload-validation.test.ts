import { describe, it, expect } from 'vitest'

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB

function validateFile(file: { type: string; size: number; name: string }) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Type de fichier non supporté' }
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Fichier trop volumineux (max 25 Mo)' }
  }
  if (!file.name || file.name.trim() === '') {
    return { valid: false, error: 'Nom de fichier manquant' }
  }
  return { valid: true, error: null }
}

function parseAnalysisResult(raw: string): Record<string, unknown> {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    return { summary_fr: 'Document analysé', document_type: 'other' }
  }
}

describe('Upload validation', () => {
  it('accepts PDF files', () => {
    const result = validateFile({ type: 'application/pdf', size: 1000, name: 'test.pdf' })
    expect(result.valid).toBe(true)
  })

  it('accepts JPEG images', () => {
    const result = validateFile({ type: 'image/jpeg', size: 1000, name: 'test.jpg' })
    expect(result.valid).toBe(true)
  })

  it('accepts PNG images', () => {
    const result = validateFile({ type: 'image/png', size: 1000, name: 'test.png' })
    expect(result.valid).toBe(true)
  })

  it('rejects unsupported file types', () => {
    const result = validateFile({ type: 'text/plain', size: 1000, name: 'test.txt' })
    expect(result.valid).toBe(false)
    expect(result.error).toContain('non supporté')
  })

  it('rejects files over 25MB', () => {
    const result = validateFile({ type: 'application/pdf', size: 26 * 1024 * 1024, name: 'big.pdf' })
    expect(result.valid).toBe(false)
    expect(result.error).toContain('volumineux')
  })

  it('rejects empty file names', () => {
    const result = validateFile({ type: 'application/pdf', size: 1000, name: '' })
    expect(result.valid).toBe(false)
  })
})

describe('Claude response parsing', () => {
  it('parses valid JSON response', () => {
    const raw = '{"document_type":"payslip","summary_fr":"Fiche de paie","is_urgent":false}'
    const result = parseAnalysisResult(raw)
    expect(result.document_type).toBe('payslip')
    expect(result.summary_fr).toBe('Fiche de paie')
  })

  it('strips markdown code blocks', () => {
    const raw = '```json\n{"document_type":"tax","summary_fr":"Avis fiscal"}\n```'
    const result = parseAnalysisResult(raw)
    expect(result.document_type).toBe('tax')
  })

  it('returns fallback on invalid JSON', () => {
    const raw = 'This is not JSON at all'
    const result = parseAnalysisResult(raw)
    expect(result.document_type).toBe('other')
    expect(result.summary_fr).toBe('Document analysé')
  })
})
