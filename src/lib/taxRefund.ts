// =====================================================
// Tax refund estimator (החזר מס)
// =====================================================
// Calcule l'estimation de remboursement d'impot israelien
// en comparant l'impot preleve vs l'impot du selon les baremes.
// Utilise les brackets et points de credit de israeliPayroll.ts

const TAX_BRACKETS_2025 = [
  { from: 0, to: 84_120, rate: 0.10 },
  { from: 84_120, to: 120_720, rate: 0.14 },
  { from: 120_720, to: 193_800, rate: 0.20 },
  { from: 193_800, to: 269_280, rate: 0.31 },
  { from: 269_280, to: 560_280, rate: 0.35 },
  { from: 560_280, to: 721_560, rate: 0.47 },
  { from: 721_560, to: Infinity, rate: 0.50 },
]
const SURTAX_THRESHOLD = 721_560
const SURTAX_RATE = 0.03
const CREDIT_POINT_VALUE_ANNUAL = 242 * 12  // 2904 NIS/an par point

export interface CreditPointsCalculation {
  residentBase: number       // 2.25 pour tout resident israelien
  womanBonus: number         // 0.5 si femme
  olehBonus: number          // 3/2/1 selon annee d'alyah
  childrenBonus: number      // Points pour enfants < 5 ans
  singleParentBonus: number  // Parent isole
  other: number
  total: number
}

export interface TaxRefundInput {
  /** Annee fiscale */
  taxYear: number
  /** Revenu brut annuel total */
  grossAnnual: number
  /** Impot preleve a la source (mas hachnasa) */
  taxPaid: number
  /** Points de credit utilises (extraits du tofes 106) */
  creditPointsUsed: number
  /** Profil utilisateur pour calculer les points dus */
  profile: {
    gender?: 'male' | 'female'
    aliyahYear?: number | null
    childrenCount?: number
    childrenBirthDates?: string[] // ISO dates
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | 'separated' | null
  }
}

export interface TaxRefundResult {
  taxYear: number
  grossAnnual: number
  taxPaid: number
  creditPointsUsed: number
  creditPointsEligible: number
  creditPointsMissing: number
  creditPointsDetail: CreditPointsCalculation
  computedTax: number
  computedTaxBeforeCredit: number
  estimatedRefund: number
  refundPerMissingPoint: number
  explanation: string[]
}

/**
 * Calcule les points de credit auxquels l'utilisateur a droit selon son profil.
 */
export function computeEligibleCreditPoints(
  profile: TaxRefundInput['profile'],
  taxYear: number
): CreditPointsCalculation {
  const result: CreditPointsCalculation = {
    residentBase: 2.25,
    womanBonus: 0,
    olehBonus: 0,
    childrenBonus: 0,
    singleParentBonus: 0,
    other: 0,
    total: 0,
  }

  // Femme : +0.5 points
  if (profile.gender === 'female') {
    result.womanBonus = 0.5
  }

  // Oleh hadash : 3 / 2 / 1 points sur les 3 premieres annees d'alyah
  if (profile.aliyahYear) {
    const yearsSinceAliyah = taxYear - profile.aliyahYear
    if (yearsSinceAliyah === 0) result.olehBonus = 3
    else if (yearsSinceAliyah === 1) result.olehBonus = 2
    else if (yearsSinceAliyah === 2) result.olehBonus = 1
  }

  // Enfants : 1.5 points par enfant de 0-5 ans (l'annee de naissance et les 4 suivantes)
  if (profile.childrenBirthDates && profile.childrenBirthDates.length > 0) {
    for (const birthDate of profile.childrenBirthDates) {
      const birthYear = new Date(birthDate).getFullYear()
      const childAge = taxYear - birthYear
      if (childAge >= 0 && childAge <= 5) {
        result.childrenBonus += 1.5
      } else if (childAge >= 6 && childAge <= 17) {
        result.childrenBonus += 1
      }
    }
  } else if (profile.childrenCount && profile.childrenCount > 0) {
    // Estimation simplifiee : 1.5 points par enfant si pas de dates
    result.childrenBonus = profile.childrenCount * 1.5
  }

  // Parent isole : +1 point
  if (
    profile.maritalStatus === 'divorced' ||
    profile.maritalStatus === 'widowed' ||
    profile.maritalStatus === 'separated'
  ) {
    if (profile.childrenCount && profile.childrenCount > 0) {
      result.singleParentBonus = 1
    }
  }

  result.total =
    result.residentBase +
    result.womanBonus +
    result.olehBonus +
    result.childrenBonus +
    result.singleParentBonus +
    result.other

  return result
}

/**
 * Calcule l'impot du avec les brackets progressifs.
 */
export function computeIncomeTax(grossAnnual: number): number {
  let tax = 0
  for (const bracket of TAX_BRACKETS_2025) {
    if (grossAnnual <= bracket.from) break
    const taxableInBracket = Math.min(grossAnnual, bracket.to) - bracket.from
    tax += taxableInBracket * bracket.rate
  }

  // Surtax (mas yoter) au-dessus de 721 560
  if (grossAnnual > SURTAX_THRESHOLD) {
    tax += (grossAnnual - SURTAX_THRESHOLD) * SURTAX_RATE
  }

  return Math.round(tax)
}

/**
 * Calcul principal : estime le remboursement d'impot.
 */
export function estimateTaxRefund(input: TaxRefundInput): TaxRefundResult {
  const explanation: string[] = []

  // 1. Calcul de l'impot du avant credit
  const taxBeforeCredit = computeIncomeTax(input.grossAnnual)
  explanation.push(
    `Sur un revenu brut de ${input.grossAnnual.toLocaleString('fr-IL')} ₪, l'impot du avant deduction est de ${taxBeforeCredit.toLocaleString('fr-IL')} ₪.`
  )

  // 2. Calcul des points de credit eligibles
  const creditPointsDetail = computeEligibleCreditPoints(input.profile, input.taxYear)
  const creditPointsEligible = creditPointsDetail.total
  const creditPointsMissing = Math.max(0, creditPointsEligible - input.creditPointsUsed)

  explanation.push(
    `Vous avez droit a ${creditPointsEligible} points de credit (Nekudot Zikui) : ${creditPointsDetail.residentBase} de base` +
    (creditPointsDetail.womanBonus > 0 ? ` + ${creditPointsDetail.womanBonus} femme` : '') +
    (creditPointsDetail.olehBonus > 0 ? ` + ${creditPointsDetail.olehBonus} olim hadachim` : '') +
    (creditPointsDetail.childrenBonus > 0 ? ` + ${creditPointsDetail.childrenBonus} enfants` : '') +
    (creditPointsDetail.singleParentBonus > 0 ? ` + ${creditPointsDetail.singleParentBonus} parent isole` : '') +
    '.'
  )

  if (creditPointsMissing > 0) {
    explanation.push(
      `⚠️ Votre tofes 106 indique ${input.creditPointsUsed} points utilises. Il manque ${creditPointsMissing} points, soit ${(creditPointsMissing * CREDIT_POINT_VALUE_ANNUAL).toLocaleString('fr-IL')} ₪ de credit d'impot non reclame.`
    )
  }

  // 3. Calcul de l'impot du APRES application des points eligibles
  const creditValue = creditPointsEligible * CREDIT_POINT_VALUE_ANNUAL
  const computedTax = Math.max(0, taxBeforeCredit - creditValue)

  // 4. Estimation du remboursement = impot preleve - impot du reel
  const estimatedRefund = Math.max(0, input.taxPaid - computedTax)

  if (estimatedRefund > 0) {
    explanation.push(
      `🎉 Estimation de votre remboursement : ${estimatedRefund.toLocaleString('fr-IL')} ₪ (impot preleve ${input.taxPaid.toLocaleString('fr-IL')} ₪ moins impot du ${computedTax.toLocaleString('fr-IL')} ₪).`
    )
  } else {
    explanation.push(
      `Selon ce calcul, il n'y a pas de remboursement attendu : l'impot preleve correspond a l'impot du.`
    )
  }

  const refundPerMissingPoint = creditPointsMissing > 0 ? CREDIT_POINT_VALUE_ANNUAL : 0

  return {
    taxYear: input.taxYear,
    grossAnnual: input.grossAnnual,
    taxPaid: input.taxPaid,
    creditPointsUsed: input.creditPointsUsed,
    creditPointsEligible,
    creditPointsMissing,
    creditPointsDetail,
    computedTax,
    computedTaxBeforeCredit: taxBeforeCredit,
    estimatedRefund,
    refundPerMissingPoint,
    explanation,
  }
}
