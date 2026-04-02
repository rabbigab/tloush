import { describe, it, expect } from 'vitest'
import { getExpertRecommendation, getExpertUrl } from '@/lib/expertMatcher'

describe('getExpertRecommendation', () => {
  it('recommends accountant for tax documents', () => {
    const rec = getExpertRecommendation('tax', false, false)
    expect(rec).not.toBeNull()
    expect(rec!.specialties).toContain('fiscalite')
  })

  it('recommends labor lawyer for contracts', () => {
    const rec = getExpertRecommendation('contract', false, false)
    expect(rec).not.toBeNull()
    expect(rec!.specialties).toContain('droit-travail')
  })

  it('recommends high urgency for urgent tax document', () => {
    const rec = getExpertRecommendation('tax', true, true)
    expect(rec!.urgency).toBe('high')
  })

  it('recommends lawyer for official letter about dismissal', () => {
    const rec = getExpertRecommendation('official_letter', true, true, 'licenciement en cours', 'Lettre de licenciement')
    expect(rec).not.toBeNull()
    expect(rec!.specialties).toContain('droit-travail')
  })

  it('recommends accountant for bituah leumi letter', () => {
    const rec = getExpertRecommendation('official_letter', false, true, 'Fournir documents', 'Courrier de Bituah Leumi')
    expect(rec).not.toBeNull()
    expect(rec!.specialties).toContain('comptabilite')
  })

  it('returns null for simple payslip without issues', () => {
    const rec = getExpertRecommendation('payslip', false, false)
    expect(rec).toBeNull()
  })

  it('recommends for payslip with salary errors', () => {
    const rec = getExpertRecommendation('payslip', false, true, 'Erreur sur le salaire', 'Salaire sous-payé')
    expect(rec).not.toBeNull()
    expect(rec!.specialties).toContain('comptabilite')
  })

  it('returns null for non-urgent other documents', () => {
    const rec = getExpertRecommendation('other', false, false)
    expect(rec).toBeNull()
  })
})

describe('getExpertUrl', () => {
  it('returns correct URL for comptabilite', () => {
    expect(getExpertUrl('comptabilite')).toBe('/experts?specialite=comptabilite')
  })

  it('returns correct URL for droit-travail', () => {
    expect(getExpertUrl('droit-travail')).toBe('/experts?specialite=droit-travail')
  })
})
