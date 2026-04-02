import type { ExpertSpecialty } from '@/data/experts'

interface ExpertRecommendation {
  specialties: ExpertSpecialty[]
  reason: string
  urgency: 'low' | 'medium' | 'high'
}

/**
 * Maps document type and analysis to recommended expert specialties.
 * Used in inbox cards and assistant to suggest professional help.
 */
export function getExpertRecommendation(
  documentType: string,
  isUrgent: boolean,
  actionRequired: boolean,
  actionDescription?: string | null,
  summaryFr?: string | null
): ExpertRecommendation | null {
  const summary = (summaryFr || '').toLowerCase()
  const action = (actionDescription || '').toLowerCase()
  const text = `${summary} ${action}`

  // Tax documents → accountant / tax specialist
  if (documentType === 'tax') {
    return {
      specialties: ['fiscalite', 'comptabilite'],
      reason: 'Un expert-comptable peut vous aider à comprendre ce document fiscal et optimiser votre situation.',
      urgency: isUrgent ? 'high' : 'medium',
    }
  }

  // Contracts → labor law
  if (documentType === 'contract') {
    return {
      specialties: ['droit-travail'],
      reason: 'Un avocat en droit du travail peut vérifier les clauses de votre contrat et protéger vos intérêts.',
      urgency: isUrgent ? 'high' : 'medium',
    }
  }

  // Official letters with urgency → depends on content
  if (documentType === 'official_letter' && (isUrgent || actionRequired)) {
    // Check for legal / labor keywords
    if (text.includes('licenci') || text.includes('rupture') || text.includes('préavis') || text.includes('tribunal')) {
      return {
        specialties: ['droit-travail'],
        reason: 'Ce courrier concerne un sujet juridique. Un avocat francophone peut vous conseiller sur la marche à suivre.',
        urgency: 'high',
      }
    }
    // Tax / social security
    if (text.includes('fiscal') || text.includes('impôt') || text.includes('bituah') || text.includes('leumi')) {
      return {
        specialties: ['fiscalite', 'comptabilite'],
        reason: 'Ce courrier officiel nécessite une attention particulière. Un comptable peut vous accompagner.',
        urgency: isUrgent ? 'high' : 'medium',
      }
    }
    // Generic urgent official letter
    return {
      specialties: ['droit-travail', 'comptabilite'],
      reason: 'Ce courrier nécessite une action. Un professionnel peut vous aider à comprendre vos obligations.',
      urgency: isUrgent ? 'high' : 'medium',
    }
  }

  // Payslips with issues
  if (documentType === 'payslip' && actionRequired) {
    if (text.includes('salaire minimum') || text.includes('sous-pay') || text.includes('erreur')) {
      return {
        specialties: ['comptabilite', 'droit-travail'],
        reason: 'Des anomalies ont été détectées sur votre fiche de paie. Un professionnel peut vérifier vos droits.',
        urgency: 'medium',
      }
    }
  }

  // No recommendation needed for simple, non-urgent documents
  return null
}

/**
 * Returns the URL to the experts page filtered by specialty.
 */
export function getExpertUrl(specialty: ExpertSpecialty): string {
  return `/experts?specialite=${specialty}`
}
