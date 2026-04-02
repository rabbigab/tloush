import { describe, it, expect } from 'vitest'

/**
 * Extracted from src/app/api/documents/compare/route.ts POST handler.
 * Validates that two distinct, non-empty document IDs are provided.
 */
function validateCompareInput(body: { docId1?: string; docId2?: string }): {
  valid: boolean
  error: string | null
} {
  if (!body.docId1 || !body.docId2) {
    return { valid: false, error: 'Deux documents requis' }
  }
  if (body.docId1 === body.docId2) {
    return { valid: false, error: 'Les deux documents doivent être différents' }
  }
  return { valid: true, error: null }
}

/**
 * Extracted from src/app/api/documents/compare/route.ts.
 * Sorts documents by created_at ascending (older first).
 */
function sortDocumentsByDate<T extends { created_at: string }>(docs: T[]): T[] {
  return [...docs].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
}

describe('Compare API - input validation', () => {
  it('accepts two different document IDs', () => {
    const result = validateCompareInput({ docId1: 'abc-1', docId2: 'abc-2' })
    expect(result.valid).toBe(true)
    expect(result.error).toBeNull()
  })

  it('rejects when docId1 is missing', () => {
    const result = validateCompareInput({ docId1: '', docId2: 'abc-2' })
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Deux documents requis')
  })

  it('rejects when docId2 is missing', () => {
    const result = validateCompareInput({ docId1: 'abc-1', docId2: '' })
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Deux documents requis')
  })

  it('rejects when both IDs are missing', () => {
    const result = validateCompareInput({})
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Deux documents requis')
  })

  it('rejects when docId1 is undefined', () => {
    const result = validateCompareInput({ docId1: undefined, docId2: 'abc-2' })
    expect(result.valid).toBe(false)
  })

  it('rejects same document ID for both', () => {
    const result = validateCompareInput({ docId1: 'same-id', docId2: 'same-id' })
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Les deux documents doivent être différents')
  })
})

describe('Compare API - document sorting', () => {
  it('sorts documents with older first', () => {
    const docs = [
      { id: 'new', created_at: '2025-03-15T10:00:00Z', file_name: 'march.pdf' },
      { id: 'old', created_at: '2025-01-10T10:00:00Z', file_name: 'january.pdf' },
    ]
    const sorted = sortDocumentsByDate(docs)
    expect(sorted[0].id).toBe('old')
    expect(sorted[1].id).toBe('new')
  })

  it('preserves order when already sorted', () => {
    const docs = [
      { id: 'old', created_at: '2025-01-01T00:00:00Z', file_name: 'jan.pdf' },
      { id: 'new', created_at: '2025-06-01T00:00:00Z', file_name: 'jun.pdf' },
    ]
    const sorted = sortDocumentsByDate(docs)
    expect(sorted[0].id).toBe('old')
    expect(sorted[1].id).toBe('new')
  })

  it('handles same-date documents without error', () => {
    const docs = [
      { id: 'a', created_at: '2025-05-01T12:00:00Z', file_name: 'a.pdf' },
      { id: 'b', created_at: '2025-05-01T12:00:00Z', file_name: 'b.pdf' },
    ]
    const sorted = sortDocumentsByDate(docs)
    expect(sorted).toHaveLength(2)
  })

  it('does not mutate the original array', () => {
    const docs = [
      { id: 'new', created_at: '2025-12-01T00:00:00Z', file_name: 'dec.pdf' },
      { id: 'old', created_at: '2025-01-01T00:00:00Z', file_name: 'jan.pdf' },
    ]
    const sorted = sortDocumentsByDate(docs)
    expect(docs[0].id).toBe('new')
    expect(sorted[0].id).toBe('old')
  })
})
