/**
 * Mashkanta (Mortgage) Simulator for Israel
 *
 * Calculates monthly payments, total cost, and provides Israeli-specific guidance.
 * Covers different track types (prime, fixed, variable).
 *
 * Sources: Bank of Israel mortgage guidelines, skills-il data
 */

export interface MashkantaInput {
  propertyPrice: number
  downPayment: number
  loanTermYears: number
  interestRate: number // annual %
  isFirstApartment: boolean
  isOleh: boolean
  monthlyIncome: number
}

export interface MashkantaResult {
  loanAmount: number
  monthlyPayment: number
  totalPayments: number
  totalInterest: number
  ltv: number // loan-to-value ratio
  dti: number // debt-to-income ratio
  ltvWarning: string | null
  dtiWarning: string | null
  purchaseTax: number
  purchaseTaxBrackets: TaxBracket[]
  additionalCosts: AdditionalCost[]
  totalUpfrontCosts: number
  amortizationSample: AmortizationRow[]
  tips: string[]
}

interface TaxBracket {
  from: number
  to: number
  rate: number
  tax: number
}

interface AdditionalCost {
  label_fr: string
  amount: number
  note?: string
}

interface AmortizationRow {
  year: number
  principal: number
  interest: number
  balance: number
}

// ─── 2025 Purchase Tax (Mas Rechisha) ───

// First apartment brackets
const MAS_RECHISHA_FIRST: { upTo: number; rate: number }[] = [
  { upTo: 1_919_155, rate: 0 },
  { upTo: 2_276_360, rate: 0.035 },
  { upTo: 5_872_725, rate: 0.05 },
  { upTo: 19_575_755, rate: 0.08 },
  { upTo: Infinity, rate: 0.10 },
]

// Second+ apartment brackets
const MAS_RECHISHA_ADDITIONAL: { upTo: number; rate: number }[] = [
  { upTo: 5_872_725, rate: 0.08 },
  { upTo: 19_575_755, rate: 0.10 },
  { upTo: Infinity, rate: 0.10 },
]

// Oleh brackets (same as first for first 7 years)
const MAS_RECHISHA_OLEH: { upTo: number; rate: number }[] = [
  { upTo: 1_919_155, rate: 0 },
  { upTo: 2_276_360, rate: 0.005 },
  { upTo: Infinity, rate: 0.05 },
]

function calculatePurchaseTax(price: number, isFirst: boolean, isOleh: boolean): { total: number; brackets: TaxBracket[] } {
  const table = isOleh ? MAS_RECHISHA_OLEH : isFirst ? MAS_RECHISHA_FIRST : MAS_RECHISHA_ADDITIONAL
  let tax = 0
  let prev = 0
  const brackets: TaxBracket[] = []

  for (const bracket of table) {
    if (price <= prev) break
    const taxable = Math.min(price, bracket.upTo) - prev
    const bracketTax = taxable * bracket.rate
    tax += bracketTax
    if (taxable > 0) {
      brackets.push({ from: prev, to: Math.min(price, bracket.upTo), rate: bracket.rate, tax: bracketTax })
    }
    prev = bracket.upTo
  }

  return { total: Math.round(tax), brackets }
}

// ─── Calculator ───

export function calculateMashkanta(input: MashkantaInput): MashkantaResult {
  const { propertyPrice, downPayment, loanTermYears, interestRate, isFirstApartment, isOleh, monthlyIncome } = input

  const loanAmount = propertyPrice - downPayment
  const ltv = (loanAmount / propertyPrice) * 100
  const monthlyRate = interestRate / 100 / 12
  const numPayments = loanTermYears * 12

  // Monthly payment (standard amortization formula)
  let monthlyPayment: number
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / numPayments
  } else {
    monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
  }

  const totalPayments = monthlyPayment * numPayments
  const totalInterest = totalPayments - loanAmount
  const dti = monthlyIncome > 0 ? (monthlyPayment / monthlyIncome) * 100 : 0

  // LTV warnings (Bank of Israel regulations)
  let ltvWarning: string | null = null
  if (isFirstApartment && ltv > 75) {
    ltvWarning = 'Pour un premier achat, le LTV maximum autorise par la Banque d\'Israel est de 75%. Vous devez augmenter votre apport.'
  } else if (!isFirstApartment && ltv > 50) {
    ltvWarning = 'Pour un achat d\'investissement, le LTV maximum est de 50%. Apport minimum de 50% requis.'
  }

  // DTI warnings
  let dtiWarning: string | null = null
  if (dti > 40) {
    dtiWarning = 'Le ratio d\'endettement depasse 40% de vos revenus. Les banques risquent de refuser le pret.'
  } else if (dti > 33) {
    dtiWarning = 'Le ratio d\'endettement est eleve (>33%). Certaines banques pourraient demander des garanties supplementaires.'
  }

  // Purchase tax
  const { total: purchaseTax, brackets: purchaseTaxBrackets } = calculatePurchaseTax(propertyPrice, isFirstApartment, isOleh)

  // Additional costs
  const additionalCosts: AdditionalCost[] = [
    { label_fr: 'Mas rechisha (taxe achat)', amount: purchaseTax },
    { label_fr: 'Avocat immobilier (~0.5-1.5%)', amount: Math.round(propertyPrice * 0.01), note: 'Estimation 1%' },
    { label_fr: 'Frais d\'ouverture pret', amount: Math.round(loanAmount * 0.005), note: '~0.5% du pret' },
    { label_fr: 'Evaluation immobiliere (shmaout)', amount: 2500 },
    { label_fr: 'Frais Tabu (cadastre)', amount: Math.round(propertyPrice * 0.0005) + 150 },
  ]
  const totalUpfrontCosts = additionalCosts.reduce((s, c) => s + c.amount, 0)

  // Amortization sample (yearly)
  const amortizationSample: AmortizationRow[] = []
  let balance = loanAmount
  for (let year = 1; year <= Math.min(loanTermYears, 30); year++) {
    let yearPrincipal = 0
    let yearInterest = 0
    for (let m = 0; m < 12; m++) {
      const interestPart = balance * monthlyRate
      const principalPart = monthlyPayment - interestPart
      yearPrincipal += principalPart
      yearInterest += interestPart
      balance -= principalPart
    }
    amortizationSample.push({
      year,
      principal: Math.round(yearPrincipal),
      interest: Math.round(yearInterest),
      balance: Math.max(0, Math.round(balance)),
    })
  }

  // Tips
  const tips: string[] = [
    'En Israel, il est recommande de diviser la mashkanta en 3-4 pistes (masloulim) : Prime fixe, Prime variable, et Taux fixe non-indexe.',
    'La Banque d\'Israel impose un maximum de 1/3 du pret a taux variable (prime).',
    'Comparez au moins 3 banques — les ecarts de taux peuvent representer des dizaines de milliers de shekels.',
    'Un courtier en pret (yoetz mashkantaot) coute environ 3 000-8 000₪ mais peut vous faire economiser bien plus.',
  ]
  if (isOleh) {
    tips.push('En tant qu\'oleh hadash, vous beneficiez de taux de mas rechisha reduits pendant vos 7 premieres annees.')
  }
  if (isFirstApartment) {
    tips.push('Pour un premier achat, le mas rechisha est nettement plus faible. Conservez ce statut si possible.')
  }

  return {
    loanAmount,
    monthlyPayment: Math.round(monthlyPayment),
    totalPayments: Math.round(totalPayments),
    totalInterest: Math.round(totalInterest),
    ltv: Math.round(ltv * 10) / 10,
    dti: Math.round(dti * 10) / 10,
    ltvWarning,
    dtiWarning,
    purchaseTax,
    purchaseTaxBrackets,
    additionalCosts,
    totalUpfrontCosts,
    amortizationSample,
    tips,
  }
}
