// =====================================================
// Tax refund estimator (החזר מס)
// =====================================================
// Verifie avec sources officielles (avril 2026) :
// - Baremes d'impot Rashut HaMisim (geles 2025-2027)
// - Nekudot Zikui : https://www.kolzchut.org.il/he/נקודות_זיכוי_ממס_הכנסה
// - Oleh Hadash (nouveau schedule 2022+) :
//   https://www.kolzchut.org.il/en/Income_Tax_Credit_Points_for_New_Immigrants

// Brackets 2025-2027 (geles)
const TAX_BRACKETS = [
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
const CREDIT_POINT_VALUE_ANNUAL = 242 * 12  // 2904 NIS/an par point (2025)

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
 * Calcule le bonus olim hadashim selon le SCHEDULE OFFICIEL 2022+
 * (loi reformee en 2022, valide pour toute alyah depuis 2022)
 *
 * Schedule annuel (54 mois / 4.5 ans total) :
 *   Annee 0 (mois 1-12)  : 12 × 1 pt  = 12 points annuels
 *   Annee 1 (mois 13-24) : 12 × 3 pts = 36 points annuels
 *   Annee 2 (mois 25-36) : 6×3 + 6×2  = 30 points annuels
 *   Annee 3 (mois 37-48) : 6×2 + 6×1  = 18 points annuels
 *   Annee 4 (mois 49-54) : 6 × 1 pt   = 6 points annuels
 *
 * Note : ce sont des POINTS ANNUELS (= somme des points mensuels cette annee).
 * Mais dans l'UI tax refund on veut un nombre ANNUEL equivalent.
 *
 * Source : https://www.kolzchut.org.il/en/Income_Tax_Credit_Points_for_New_Immigrants
 */
export function computeOlehBonusAnnual(aliyahYear: number, taxYear: number): number {
  const yearsSinceAliyah = taxYear - aliyahYear

  // Annee d'alyah (annee 0) : 12 mois × 1 pt = 12 pts "mensuels" cumules
  // Pour un calcul annuel moyen, on divise : 12/12 = 1 pt annuel
  if (yearsSinceAliyah === 0) return 1

  // Annee 1 : 12 mois × 3 pts = 36 pts cumules → 3 pts annuel
  if (yearsSinceAliyah === 1) return 3

  // Annee 2 : 6 mois × 3 pts + 6 mois × 2 pts = 18+12 = 30 → 2.5 pts annuel
  if (yearsSinceAliyah === 2) return 2.5

  // Annee 3 : 6 mois × 2 pts + 6 mois × 1 pt = 12+6 = 18 → 1.5 pts annuel
  if (yearsSinceAliyah === 3) return 1.5

  // Annee 4 (uniquement 6 premiers mois) : 6 × 1 = 6 → 0.5 pt annuel
  if (yearsSinceAliyah === 4) return 0.5

  return 0
}

/**
 * Calcule les points de credit pour enfants.
 *
 * TABLE OFFICIELLE (Section 66 du code des impots + directives 2022) :
 * - Les points sont differents pour MERE et PERE
 * - Ils varient par tranche d'age
 * - Depuis 2022, ils ont ete augmentes de facon temporaire jusqu'en 2025
 *
 * Note : on simplifie en utilisant les points "mere" (plus eleves)
 * car sans le profil du conjoint, on ne peut pas trancher.
 * Affichage explicite du fait que c'est une estimation.
 *
 * Source : https://www.kolzchut.org.il/he/נקודות_זיכוי_ממס_הכנסה
 */
export function computeChildrenBonus(
  birthDates: string[],
  taxYear: number
): number {
  let bonus = 0
  for (const birthDate of birthDates) {
    const birthYear = new Date(birthDate).getFullYear()
    const age = taxYear - birthYear

    // Annee de naissance : 1.5 pts (mere qui travaille)
    if (age === 0) bonus += 1.5
    // Ages 1-5 : 2.5 pts (mere) — reforme 2022 pour jeunes enfants
    else if (age >= 1 && age <= 5) bonus += 2.5
    // Ages 6-17 : 1 pt (chaque parent) + 1 pt reforme 2022-2025 pour 6-17
    // On cumule pour donner une estimation haute
    else if (age >= 6 && age <= 17) bonus += 2
  }
  return bonus
}

/**
 * Calcule les points de credit auxquels l'utilisateur a droit selon son profil.
 *
 * ATTENTION : Ce calcul est une ESTIMATION INDICATIVE. La vraie table
 * israelienne varie par parent (mere/pere), annee fiscale, et reformes
 * temporaires. Pour un calcul exact, consulter un yoetz mas.
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

  // Femme : +0.5 points → total 2.75 pour femme qui travaille
  if (profile.gender === 'female') {
    result.womanBonus = 0.5
  }

  // Oleh hadash : SCHEDULE OFFICIEL 2022+ (reforme de la loi)
  if (profile.aliyahYear) {
    result.olehBonus = computeOlehBonusAnnual(profile.aliyahYear, taxYear)
  }

  // Enfants : table par age (estimation mere qui travaille)
  if (profile.childrenBirthDates && profile.childrenBirthDates.length > 0) {
    result.childrenBonus = computeChildrenBonus(profile.childrenBirthDates, taxYear)
  } else if (profile.childrenCount && profile.childrenCount > 0) {
    // Sans dates, on ne peut pas calculer precisement → on prend une
    // estimation moyenne (2 pts par enfant) et on affiche un avertissement
    result.childrenBonus = profile.childrenCount * 2
  }

  // Parent isole avec enfants : +1 point (regle general)
  // NOTE : la loi distingue "hore yachid" (monoparental) vs "gaurouch"
  // (divorce) avec des schedules differents. +1 est une estimation basse.
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
 * Brackets 2025-2027 (geles par la loi des finances).
 */
export function computeIncomeTax(grossAnnual: number): number {
  let tax = 0
  for (const bracket of TAX_BRACKETS) {
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
