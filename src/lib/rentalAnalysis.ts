/**
 * Israeli Rental & Real Estate Analysis
 *
 * Analyzes rental contracts, checks for red flags, calculates deposits,
 * tracks rent indexation (madad), and provides Tabu/real estate guidance.
 */

export interface RentalContractInput {
  monthlyRent: number
  startDate: string        // YYYY-MM-DD
  endDate: string          // YYYY-MM-DD
  depositAmount: number
  depositType: 'cash' | 'bank_guarantee' | 'check' | 'other'
  indexLinked: boolean      // Is rent linked to madad (CPI)?
  indexBasePeriod?: string  // e.g. '2025-01'
  optionToExtend: boolean
  extensionTerms?: string
  maintenanceIncluded: boolean
  vaadBayitIncluded: boolean
  arnonaIncluded: boolean
  breakClauseDays?: number  // notice days to break contract
  landlordName?: string
  propertyAddress?: string
}

export interface RentalAnalysisResult {
  contractDurationMonths: number
  totalRentOverContract: number
  depositAnalysis: DepositCheck
  redFlags: RedFlag[]
  greenFlags: GreenFlag[]
  indexationEstimate: number | null // estimated annual increase
  tips: string[]
}

interface DepositCheck {
  isLegal: boolean
  maxLegalDeposit: number
  actualDeposit: number
  note_fr: string
}

interface RedFlag {
  id: string
  severity: 'critical' | 'warning'
  title_fr: string
  description_fr: string
}

interface GreenFlag {
  id: string
  title_fr: string
}

export function analyzeRentalContract(input: RentalContractInput): RentalAnalysisResult {
  const start = new Date(input.startDate)
  const end = new Date(input.endDate)
  const durationMs = end.getTime() - start.getTime()
  const contractDurationMonths = Math.round(durationMs / (30.44 * 24 * 60 * 60 * 1000))
  const totalRent = input.monthlyRent * contractDurationMonths

  // Deposit analysis — Israeli law limits deposit
  // Maximum deposit: 1/3 of total rent for contracts > 3 months, or 1 month rent (common practice)
  // The Rental Law 5771-2017 caps deposit at the lower of: 3 months rent or 1/3 of total rent
  const maxLegalDeposit = Math.min(input.monthlyRent * 3, totalRent / 3)
  const depositCheck: DepositCheck = {
    isLegal: input.depositAmount <= maxLegalDeposit,
    maxLegalDeposit,
    actualDeposit: input.depositAmount,
    note_fr: input.depositAmount > maxLegalDeposit
      ? `Le depot de ${input.depositAmount}₪ depasse le maximum legal de ${Math.round(maxLegalDeposit)}₪. Vous pouvez demander une reduction.`
      : `Le depot de ${input.depositAmount}₪ est dans les limites legales (max ${Math.round(maxLegalDeposit)}₪).`,
  }

  // Red flags
  const redFlags: RedFlag[] = []

  if (input.depositAmount > maxLegalDeposit) {
    redFlags.push({
      id: 'deposit_too_high',
      severity: 'critical',
      title_fr: 'Depot superieur au maximum legal',
      description_fr: `La loi limite le depot a ${Math.round(maxLegalDeposit)}₪ pour ce contrat. Demandez une reduction ou un fractionnement.`,
    })
  }

  if (input.depositType === 'cash') {
    redFlags.push({
      id: 'cash_deposit',
      severity: 'warning',
      title_fr: 'Depot en especes',
      description_fr: 'Un depot en especes est risque. Preferez une garantie bancaire ou un cheque, avec recu ecrit. Les paiements en especes > 6 000₪ sont illegaux.',
    })
  }

  if (!input.breakClauseDays) {
    redFlags.push({
      id: 'no_break_clause',
      severity: 'warning',
      title_fr: 'Pas de clause de sortie anticipee',
      description_fr: 'Sans clause de rupture, vous devez trouver un remplacant ou payer jusqu\'a la fin du bail. Negociez un preavis de 60-90 jours.',
    })
  }

  if (contractDurationMonths > 24 && !input.optionToExtend) {
    redFlags.push({
      id: 'long_no_option',
      severity: 'warning',
      title_fr: 'Contrat long sans option d\'extension',
      description_fr: 'Un contrat de plus de 2 ans sans option de renouvellement vous lie longtemps. Negociez une option.',
    })
  }

  if (input.indexLinked) {
    redFlags.push({
      id: 'index_linked',
      severity: 'warning',
      title_fr: 'Loyer indexe au Madad (CPI)',
      description_fr: 'Votre loyer augmentera automatiquement avec l\'inflation. Avec un CPI a ~2.8%, attendez-vous a ~' + Math.round(input.monthlyRent * 0.028) + '₪/an d\'augmentation.',
    })
  }

  if (input.monthlyRent > 7500 && !input.arnonaIncluded) {
    // No red flag, but note
  }

  // Green flags
  const greenFlags: GreenFlag[] = []

  if (input.depositType === 'bank_guarantee') {
    greenFlags.push({ id: 'safe_deposit', title_fr: 'Depot par garantie bancaire — le plus securise' })
  }

  if (input.breakClauseDays && input.breakClauseDays <= 90) {
    greenFlags.push({ id: 'break_clause', title_fr: `Clause de sortie avec preavis de ${input.breakClauseDays} jours` })
  }

  if (input.optionToExtend) {
    greenFlags.push({ id: 'extension_option', title_fr: 'Option de renouvellement incluse' })
  }

  if (input.maintenanceIncluded) {
    greenFlags.push({ id: 'maintenance', title_fr: 'Maintenance incluse dans le loyer' })
  }

  // Indexation estimate
  const indexationEstimate = input.indexLinked ? Math.round(input.monthlyRent * 0.028) : null

  // Tips
  const tips: string[] = [
    'Photographiez l\'etat de l\'appartement a l\'entree (protocole de remise des cles).',
    'Demandez un recu (kabala) pour chaque paiement de loyer.',
    'Verifiez que le proprietaire paie bien l\'arnona a son nom (pas au votre) si elle n\'est pas incluse.',
    'Gardez une copie du contrat signe et de tous les avenants.',
  ]

  if (!input.arnonaIncluded) {
    tips.push('L\'arnona n\'est pas incluse — prevoyez ~500-1500₪/bimestre selon la ville et la surface.')
  }
  if (!input.vaadBayitIncluded) {
    tips.push('Le vaad bayit (charges de copropriete) n\'est pas inclus — prevoyez ~100-400₪/mois.')
  }
  if (input.indexLinked) {
    tips.push('Votre loyer est indexe au madad. Vous pouvez verifier le madad actuel sur le site du CBS (lamas.gov.il).')
  }

  return {
    contractDurationMonths,
    totalRentOverContract: totalRent,
    depositAnalysis: depositCheck,
    redFlags,
    greenFlags,
    indexationEstimate,
    tips,
  }
}

// ─── Purchase guidance ───

export interface PurchaseGuidance {
  step: number
  title_fr: string
  description_fr: string
  documents_fr: string[]
  timeline_fr: string
}

export const PURCHASE_STEPS: PurchaseGuidance[] = [
  {
    step: 1,
    title_fr: 'Recherche et visite',
    description_fr: 'Definissez votre budget, zone et criteres. Visitez les biens. Verifiez le Tabu (registre foncier) pour confirmer le proprietaire.',
    documents_fr: ['Nesach Tabu (extrait du registre foncier)', 'Tokhnit (plan du bien)'],
    timeline_fr: '1-3 mois',
  },
  {
    step: 2,
    title_fr: 'Offre et negociation',
    description_fr: 'Faites une offre ecrite. Negociez le prix et les conditions. Ne signez rien sans avocat.',
    documents_fr: ['Hatzaat mehir (offre ecrite)'],
    timeline_fr: '1-2 semaines',
  },
  {
    step: 3,
    title_fr: 'Avocat et due diligence',
    description_fr: 'Engagez un avocat immobilier (orech din mekarke\'in). Il verifie le Tabu, les dettes, les droits de construction, les servitudes.',
    documents_fr: ['Nesach Tabu', 'Ishur zehut (verification identite vendeur)', 'Bdikat herem (verification dettes/saisies)', 'Tokhnit binian (plan de construction)'],
    timeline_fr: '2-4 semaines',
  },
  {
    step: 4,
    title_fr: 'Mashkanta (pret immobilier)',
    description_fr: 'Obtenez des offres de pret de 2-3 banques. Comparez les pistes (maslulim): Prime, fixe, variable, lie au madad. LTV max: 75% (60% pour investisseur).',
    documents_fr: ['3 dernieres fiches de paie', 'Tofes 106 (annuel)', 'Ishur yitrot (releves bancaires)', 'Heskemim precedents'],
    timeline_fr: '2-4 semaines',
  },
  {
    step: 5,
    title_fr: 'Signature du contrat',
    description_fr: 'Signez le contrat de vente (heskem mehira) en presence des avocats. Un acompte de 10-20% est verse a la signature.',
    documents_fr: ['Heskem mehira (contrat de vente)', 'Yipui koach (procuration si necessaire)'],
    timeline_fr: '1 jour',
  },
  {
    step: 6,
    title_fr: 'Paiement Mas Rechisha',
    description_fr: 'Payez la taxe d\'achat (mas rechisha) dans les 50 jours suivant la signature. Le taux depend du prix et de votre statut (1er achat, oleh, investisseur).',
    documents_fr: ['Tofes 7002 (declaration mas rechisha)'],
    timeline_fr: 'Dans les 50 jours',
  },
  {
    step: 7,
    title_fr: 'Transfert au Tabu',
    description_fr: 'Enregistrez le bien a votre nom au Tabu. Votre avocat s\'en occupe. Delai: quelques semaines a quelques mois selon le bureau.',
    documents_fr: ['Ishur mas rechisha (certificat de paiement taxe)', 'Shtar mehira (acte de vente)', 'Nussah tabu mis a jour'],
    timeline_fr: '1-3 mois',
  },
]
