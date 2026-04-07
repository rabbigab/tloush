/**
 * Company Lookup (Hevra Check)
 *
 * Provides information about verifying Israeli companies using
 * public registries and known identifiers.
 *
 * Note: Actual API calls to the Israeli Companies Registrar (Rasham HaHavarot)
 * require specific API access. This module provides the data structure
 * and validation utilities.
 */

export interface CompanyInfo {
  companyNumber: string  // מספר חברה (C.N.)
  name?: string
  nameHe?: string
  status?: 'active' | 'inactive' | 'dissolved' | 'unknown'
  type?: 'private_ltd' | 'public_ltd' | 'partnership' | 'ngo' | 'cooperative' | 'unknown'
  registrationDate?: string
}

export interface CompanyCheckResult {
  isValid: boolean
  companyNumber: string
  formatted: string
  type: string
  checks: CheckItem[]
  resources: Resource[]
}

interface CheckItem {
  label_fr: string
  description_fr: string
  url?: string
  status: 'info' | 'action'
}

interface Resource {
  label_fr: string
  url: string
  description_fr: string
}

/**
 * Validate and format an Israeli company number (HP / ח.פ.)
 * Israeli company numbers are 9 digits
 */
export function validateCompanyNumber(input: string): { valid: boolean; formatted: string; type: string } {
  const cleaned = input.replace(/\D/g, '')

  if (cleaned.length === 9) {
    // Standard company number (ח.פ.)
    return {
      valid: true,
      formatted: cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3'),
      type: 'Hevra Pratit (ח.פ.)',
    }
  }

  if (cleaned.length === 8) {
    // Osek Murshe / Amuta number
    return {
      valid: true,
      formatted: cleaned.replace(/(\d{2})(\d{3})(\d{3})/, '$1-$2-$3'),
      type: 'Osek/Amuta',
    }
  }

  return { valid: false, formatted: input, type: 'Inconnu' }
}

/**
 * Generate a company check report with actionable steps
 */
export function generateCompanyCheck(companyNumber: string): CompanyCheckResult {
  const validation = validateCompanyNumber(companyNumber)

  const checks: CheckItem[] = [
    {
      label_fr: 'Verifier au Rasham HaHavarot (Registre des societes)',
      description_fr: 'Le registre officiel des societes en Israel permet de verifier le statut, les dirigeants et les documents deposes.',
      url: 'https://ica.justice.gov.il/GenericCorporarionInfo/SearchCorporation?unit=8',
      status: 'action',
    },
    {
      label_fr: 'Verifier le numero de TVA (Maam)',
      description_fr: 'Verifiez que le numero de TVA (Osek Murshe) est valide et actif aupres de l\'autorite fiscale.',
      url: 'https://www.misim.gov.il/',
      status: 'action',
    },
    {
      label_fr: 'Verifier les dettes et procedures',
      description_fr: 'Consultez le Hotzaa LaPoal (huissier) pour verifier s\'il y a des procedures d\'execution en cours.',
      url: 'https://www.gov.il/he/departments/topics/hl-main-page',
      status: 'action',
    },
    {
      label_fr: 'Verifier l\'assurance employeur',
      description_fr: 'Demandez une preuve d\'assurance responsabilite employeur. Obligatoire pour tout employeur en Israel.',
      status: 'info',
    },
    {
      label_fr: 'Cotisations Bituach Leumi',
      description_fr: 'Verifiez que l\'employeur verse bien les cotisations BL. Vous pouvez consulter votre compte personnel sur le site du BL.',
      url: 'https://www.btl.gov.il/',
      status: 'action',
    },
    {
      label_fr: 'Convention collective (Heskem Kibutzi)',
      description_fr: 'Verifiez si l\'entreprise est soumise a une convention collective sectorielle qui pourrait vous donner des droits supplementaires.',
      status: 'info',
    },
  ]

  const resources: Resource[] = [
    {
      label_fr: 'Rasham HaHavarot (Registre des societes)',
      url: 'https://ica.justice.gov.il/',
      description_fr: 'Base de donnees officielle des societes israeliennes',
    },
    {
      label_fr: 'Kav LaOved (droits des travailleurs)',
      url: 'https://www.kavlaoved.org.il/',
      description_fr: 'ONG de defense des droits des travailleurs en Israel',
    },
    {
      label_fr: 'Misrad HaKalkala (Ministere de l\'Economie)',
      url: 'https://www.gov.il/he/departments/ministry_of_economy',
      description_fr: 'Informations sur le droit du travail et les conditions d\'emploi',
    },
    {
      label_fr: 'Bituach Leumi — Espace personnel',
      url: 'https://www.btl.gov.il/',
      description_fr: 'Verifiez vos cotisations et droits accumules',
    },
  ]

  return {
    isValid: validation.valid,
    companyNumber: companyNumber,
    formatted: validation.formatted,
    type: validation.type,
    checks,
    resources,
  }
}

/**
 * Red flags to check when evaluating an employer
 */
export const EMPLOYER_RED_FLAGS = [
  {
    id: 'no_payslip',
    label_fr: 'Pas de fiche de paie (tlush)',
    severity: 'critical' as const,
    description_fr: 'Tout employeur est legalement oblige de fournir un tlush mensuel detaille. L\'absence de tlush est une infraction.',
  },
  {
    id: 'cash_payment',
    label_fr: 'Paiement en especes',
    severity: 'critical' as const,
    description_fr: 'Le paiement en especes au-dessus de 6 000₪ est interdit. Cela suggere du travail non declare (shachor).',
  },
  {
    id: 'no_pension',
    label_fr: 'Pas de cotisation pension',
    severity: 'warning' as const,
    description_fr: 'Apres 6 mois d\'emploi, l\'employeur doit verser une cotisation pension. Verifiez votre tlush.',
  },
  {
    id: 'below_minimum',
    label_fr: 'Salaire sous le minimum',
    severity: 'critical' as const,
    description_fr: 'Le salaire minimum est de 5 880.02₪/mois (2025). Tout salaire inferieur pour un temps plein est illegal.',
  },
  {
    id: 'no_contract',
    label_fr: 'Pas de contrat de travail',
    severity: 'warning' as const,
    description_fr: 'Un contrat ecrit n\'est pas toujours obligatoire mais l\'employeur doit fournir un hodaat tanai avoda dans les 30 jours.',
  },
  {
    id: 'no_havra_a',
    label_fr: 'Pas de jours de convalescence (Havra\'a)',
    severity: 'warning' as const,
    description_fr: 'Apres 1 an d\'emploi, vous avez droit a des jours de convalescence payes (dmei havra\'a).',
  },
  {
    id: 'excessive_hours',
    label_fr: 'Heures supplementaires non payees',
    severity: 'critical' as const,
    description_fr: 'Les heures sup doivent etre majorees : 125% les 2 premieres heures, 150% au-dela. Maximum 16h/jour.',
  },
  {
    id: 'no_vacation',
    label_fr: 'Pas de conges payes',
    severity: 'warning' as const,
    description_fr: 'Minimum 12 jours de conges payes par an (semaine de 5 jours) la premiere annee, augmente avec l\'anciennete.',
  },
]
