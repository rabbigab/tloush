/**
 * Israeli Freelance / Self-Employed (Atzmai) Calculator & Guide
 *
 * Covers Osek Patur (exempt) and Osek Murshe (licensed).
 * Calculates tax obligations, BL contributions, VAT, and deadlines.
 *
 * Sources: skills-il/government-services, Israeli tax authority rules 2025
 */

export interface FreelanceProfile {
  type: 'osek_patur' | 'osek_murshe'
  annualRevenue: number
  annualExpenses: number
  isNewOleh: boolean
  aliyahYear?: number
  isWoman: boolean
  hasChildren: boolean
  numberOfChildren?: number
  age: number
}

export interface FreelanceResult {
  type: 'osek_patur' | 'osek_murshe'
  annualRevenue: number
  annualExpenses: number
  taxableIncome: number
  incomeTax: number
  bituachLeumi: number
  healthTax: number
  vat: number
  vatNote: string
  totalObligations: number
  netIncome: number
  effectiveRate: number
  creditPoints: number
  creditValue: number
  deadlines: FreelanceDeadline[]
  tips: string[]
  osekPaturThreshold: number
  shouldSwitchToMurshe: boolean
}

export interface FreelanceDeadline {
  id: string
  title_fr: string
  frequency: 'monthly' | 'bimonthly' | 'annual'
  day: number
  description_fr: string
}

// ─── 2025 Constants ───

const OSEK_PATUR_THRESHOLD_2025 = 120_000 // Annual revenue threshold
const VAT_RATE_2025 = 0.17
const CREDIT_POINT_VALUE_2025 = 242 * 12 // Monthly × 12

// BL rates for self-employed (atzmai)
const BL_SELF_EMPLOYED = {
  reducedThreshold: 7_122 * 12, // annual
  reducedRate: 0.0266,  // 2.66%
  fullRate: 0.1183,     // 11.83%
  ceiling: 49_030 * 12, // annual
}

// Health tax rates for self-employed
const HEALTH_SELF_EMPLOYED = {
  reducedThreshold: 7_122 * 12,
  reducedRate: 0.031, // 3.1%
  fullRate: 0.05,     // 5%
}

// Tax brackets 2025 (annual)
const TAX_BRACKETS_ANNUAL = [
  { upTo: 84_120, rate: 0.10 },
  { upTo: 120_720, rate: 0.14 },
  { upTo: 193_800, rate: 0.20 },
  { upTo: 269_280, rate: 0.31 },
  { upTo: 560_280, rate: 0.35 },
  { upTo: 721_560, rate: 0.47 },
  { upTo: Infinity, rate: 0.50 },
]

const SURTAX_THRESHOLD_ANNUAL = 721_560
const SURTAX_RATE = 0.03

// ─── Deadlines ───

const FREELANCE_DEADLINES: FreelanceDeadline[] = [
  {
    id: 'bimonthly-vat',
    title_fr: 'Declaration TVA (Maam)',
    frequency: 'bimonthly',
    day: 15,
    description_fr: 'Declarer et payer la TVA bimestrielle au bureau des impots (pour Osek Murshe). En ligne sur le site de Maam.',
  },
  {
    id: 'bimonthly-advance',
    title_fr: 'Acompte impot sur le revenu',
    frequency: 'bimonthly',
    day: 15,
    description_fr: 'Verser l\'acompte (mekadma) sur l\'impot sur le revenu. Le taux est fixe par le fisc selon votre profil.',
  },
  {
    id: 'bimonthly-bl',
    title_fr: 'Cotisations Bituach Leumi',
    frequency: 'bimonthly',
    day: 15,
    description_fr: 'Payer les cotisations BL + assurance sante. Preleves sur le compte ou a payer en ligne.',
  },
  {
    id: 'annual-report',
    title_fr: 'Declaration annuelle (Doch Shnati)',
    frequency: 'annual',
    day: 30,  // April 30
    description_fr: 'Deposer le rapport annuel de revenus aupres de l\'autorite fiscale. Date limite habituelle : 30 avril (extensible via comptable).',
  },
  {
    id: 'annual-1301',
    title_fr: 'Formulaire 1301',
    frequency: 'annual',
    day: 30,
    description_fr: 'Le formulaire principal de declaration de revenus pour independants. A remplir avec un comptable recommande.',
  },
]

// ─── Calculator ───

export function calculateFreelanceTax(profile: FreelanceProfile): FreelanceResult {
  const { type, annualRevenue, annualExpenses, isNewOleh, aliyahYear, isWoman, hasChildren, numberOfChildren, age } = profile

  const taxableIncome = Math.max(0, annualRevenue - annualExpenses)

  // Credit points
  let creditPoints = 2.25 // Base for resident
  if (isWoman) creditPoints += 0.5
  if (hasChildren && numberOfChildren) {
    creditPoints += numberOfChildren * 1.0 // Simplified
  }
  if (isNewOleh && aliyahYear) {
    const currentYear = new Date().getFullYear()
    const yearsInIsrael = currentYear - aliyahYear
    if (yearsInIsrael <= 1.5) creditPoints += 3
    else if (yearsInIsrael <= 2.5) creditPoints += 2
    else if (yearsInIsrael <= 3.5) creditPoints += 1
  }
  const creditValue = creditPoints * CREDIT_POINT_VALUE_2025

  // Income tax
  let incomeTax = 0
  let prev = 0
  for (const bracket of TAX_BRACKETS_ANNUAL) {
    if (taxableIncome <= prev) break
    const taxable = Math.min(taxableIncome, bracket.upTo) - prev
    incomeTax += taxable * bracket.rate
    prev = bracket.upTo
  }
  // Surtax
  if (taxableIncome > SURTAX_THRESHOLD_ANNUAL) {
    incomeTax += (taxableIncome - SURTAX_THRESHOLD_ANNUAL) * SURTAX_RATE
  }
  incomeTax = Math.max(0, incomeTax - creditValue)

  // Bituach Leumi (self-employed)
  let bituachLeumi = 0
  const blIncome = taxableIncome
  if (blIncome <= BL_SELF_EMPLOYED.reducedThreshold) {
    bituachLeumi = blIncome * BL_SELF_EMPLOYED.reducedRate
  } else {
    bituachLeumi = BL_SELF_EMPLOYED.reducedThreshold * BL_SELF_EMPLOYED.reducedRate
    const excess = Math.min(blIncome, BL_SELF_EMPLOYED.ceiling) - BL_SELF_EMPLOYED.reducedThreshold
    bituachLeumi += excess * BL_SELF_EMPLOYED.fullRate
  }

  // Health tax (self-employed)
  let healthTax = 0
  if (blIncome <= HEALTH_SELF_EMPLOYED.reducedThreshold) {
    healthTax = blIncome * HEALTH_SELF_EMPLOYED.reducedRate
  } else {
    healthTax = HEALTH_SELF_EMPLOYED.reducedThreshold * HEALTH_SELF_EMPLOYED.reducedRate
    const excess = Math.min(blIncome, BL_SELF_EMPLOYED.ceiling) - HEALTH_SELF_EMPLOYED.reducedThreshold
    healthTax += excess * HEALTH_SELF_EMPLOYED.fullRate
  }

  // VAT
  let vat = 0
  let vatNote = ''
  if (type === 'osek_patur') {
    vat = 0
    vatNote = 'Osek Patur : exonere de TVA tant que le CA ne depasse pas ' + OSEK_PATUR_THRESHOLD_2025.toLocaleString() + '₪/an.'
  } else {
    vat = annualRevenue * VAT_RATE_2025
    vatNote = 'Osek Murshe : TVA de 17% collectee sur les factures, deductible sur les achats professionnels.'
  }

  const totalObligations = incomeTax + bituachLeumi + healthTax + (type === 'osek_murshe' ? 0 : 0) // VAT is collected, not a personal cost
  const netIncome = taxableIncome - totalObligations
  const effectiveRate = taxableIncome > 0 ? (totalObligations / taxableIncome) * 100 : 0

  const shouldSwitchToMurshe = type === 'osek_patur' && annualRevenue > OSEK_PATUR_THRESHOLD_2025 * 0.8

  // Tips
  const tips: string[] = []
  if (type === 'osek_patur' && annualRevenue > OSEK_PATUR_THRESHOLD_2025 * 0.7) {
    tips.push(`Votre CA approche le seuil d'Osek Patur (${OSEK_PATUR_THRESHOLD_2025.toLocaleString()}₪). Pensez a passer en Osek Murshe.`)
  }
  if (type === 'osek_patur') {
    tips.push('En tant qu\'Osek Patur, vous ne pouvez pas deduire la TVA sur vos achats professionnels.')
  }
  if (type === 'osek_murshe') {
    tips.push('Gardez toutes vos factures (kabbalot) ! Elles vous permettent de deduire la TVA payee sur vos achats pro.')
  }
  if (annualExpenses < annualRevenue * 0.15) {
    tips.push('Vos depenses sont faibles par rapport a vos revenus. Un comptable peut vous aider a identifier des deductions supplementaires.')
  }
  tips.push('Un comptable (roeh heshbon) coute environ 200-500₪/mois et peut vous faire economiser bien plus en optimisation fiscale.')
  if (isNewOleh) {
    tips.push('En tant qu\'oleh hadash, vous beneficiez de points de credit supplementaires pendant vos premieres annees.')
  }

  return {
    type,
    annualRevenue,
    annualExpenses,
    taxableIncome,
    incomeTax,
    bituachLeumi,
    healthTax,
    vat,
    vatNote,
    totalObligations,
    netIncome,
    effectiveRate,
    creditPoints,
    creditValue,
    deadlines: type === 'osek_patur'
      ? FREELANCE_DEADLINES.filter(d => d.id !== 'bimonthly-vat')
      : FREELANCE_DEADLINES,
    tips,
    osekPaturThreshold: OSEK_PATUR_THRESHOLD_2025,
    shouldSwitchToMurshe,
  }
}

export const FREELANCE_TYPES = [
  {
    id: 'osek_patur' as const,
    name_fr: 'Osek Patur (exonere)',
    name_he: 'עוסק פטור',
    description_fr: 'Independant exonere de TVA avec un CA annuel inferieur a ~120 000₪. Ideal pour les debuts ou les petites activites.',
    pros: [
      'Pas de TVA a collecter/declarer',
      'Comptabilite simplifiee',
      'Pas besoin de logiciel de facturation agree',
    ],
    cons: [
      'Plafond de CA annuel (~120 000₪)',
      'Pas de deduction de TVA sur achats',
      'Image moins "professionnelle" pour certains clients',
    ],
  },
  {
    id: 'osek_murshe' as const,
    name_fr: 'Osek Murshe (licence)',
    name_he: 'עוסק מורשה',
    description_fr: 'Independant avec numero de TVA, peut facturer et deduire la TVA. Obligatoire au-dessus du seuil Osek Patur.',
    pros: [
      'Pas de plafond de CA',
      'Deduction de TVA sur achats professionnels',
      'Image professionnelle',
      'Peut travailler avec des grandes entreprises',
    ],
    cons: [
      'TVA de 17% a collecter et reverser',
      'Declarations bimestrielles obligatoires',
      'Comptabilite plus complexe',
      'Comptable quasi-indispensable',
    ],
  },
]
