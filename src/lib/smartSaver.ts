/**
 * Smart Saver — Budget Audit & Optimization Tips
 *
 * Analyzes recurring expenses and provides actionable savings recommendations
 * specific to life in Israel.
 */

export interface ExpenseItem {
  provider_name: string
  category: string | null
  amount: number | null
  frequency: string | null
}

export interface SavingsRecommendation {
  id: string
  title_fr: string
  description_fr: string
  estimated_savings_monthly: number | null
  category: string
  priority: 'high' | 'medium' | 'low'
  action_fr: string
}

export interface AuditResult {
  totalMonthly: number
  totalAnnual: number
  categoryBreakdown: { category: string; monthly: number; percentage: number }[]
  recommendations: SavingsRecommendation[]
  healthScore: number // 0-100
  healthLabel: string
}

const FREQ_MULTIPLIER: Record<string, number> = {
  monthly: 1,
  bimonthly: 0.5,
  quarterly: 1 / 3,
  annual: 1 / 12,
  one_time: 0,
}

const CATEGORY_LABELS: Record<string, string> = {
  logement: 'Logement',
  assurance: 'Assurance',
  telecom: 'Telecom',
  transport: 'Transport',
  abonnements: 'Abonnements',
  banque: 'Banque',
  energie: 'Energie',
  sante: 'Sante',
  education: 'Education',
  autre: 'Autre',
}

// Israeli-specific benchmark ranges (monthly per household, in ₪)
const BENCHMARKS: Record<string, { avg: number; good: number }> = {
  telecom: { avg: 250, good: 150 },
  assurance: { avg: 800, good: 500 },
  banque: { avg: 100, good: 30 },
  energie: { avg: 450, good: 300 },
  abonnements: { avg: 200, good: 100 },
}

export function auditExpenses(expenses: ExpenseItem[]): AuditResult {
  // Calculate monthly amounts
  const expensesWithMonthly = expenses
    .filter(e => e.amount && e.amount > 0)
    .map(e => ({
      ...e,
      monthlyAmount: (e.amount || 0) * (FREQ_MULTIPLIER[e.frequency || 'monthly'] ?? 1),
    }))

  const totalMonthly = expensesWithMonthly.reduce((s, e) => s + e.monthlyAmount, 0)
  const totalAnnual = totalMonthly * 12

  // Category breakdown
  const byCategory: Record<string, number> = {}
  for (const e of expensesWithMonthly) {
    const cat = e.category || 'autre'
    byCategory[cat] = (byCategory[cat] || 0) + e.monthlyAmount
  }

  const categoryBreakdown = Object.entries(byCategory)
    .map(([category, monthly]) => ({
      category: CATEGORY_LABELS[category] || category,
      monthly: Math.round(monthly),
      percentage: totalMonthly > 0 ? Math.round((monthly / totalMonthly) * 100) : 0,
    }))
    .sort((a, b) => b.monthly - a.monthly)

  // Generate recommendations
  const recommendations: SavingsRecommendation[] = []

  // Telecom analysis
  const telecomExpenses = expensesWithMonthly.filter(e => e.category === 'telecom')
  const telecomTotal = telecomExpenses.reduce((s, e) => s + e.monthlyAmount, 0)
  if (telecomTotal > BENCHMARKS.telecom.avg) {
    recommendations.push({
      id: 'telecom-high',
      title_fr: 'Forfait telecom elevé',
      description_fr: `Vous depensez ${Math.round(telecomTotal)}₪/mois en telecom. La moyenne israelienne est d'environ ${BENCHMARKS.telecom.avg}₪. Comparez les offres Golan, HOT Mobile, Partner, Cellcom.`,
      estimated_savings_monthly: Math.round(telecomTotal - BENCHMARKS.telecom.good),
      category: 'telecom',
      priority: 'high',
      action_fr: 'Comparez les forfaits sur Zap.co.il ou appelez votre operateur pour negocier.',
    })
  }

  // Insurance analysis
  const insuranceExpenses = expensesWithMonthly.filter(e => e.category === 'assurance')
  const insuranceTotal = insuranceExpenses.reduce((s, e) => s + e.monthlyAmount, 0)
  if (insuranceTotal > BENCHMARKS.assurance.avg) {
    recommendations.push({
      id: 'insurance-high',
      title_fr: 'Assurances a reviser',
      description_fr: `${Math.round(insuranceTotal)}₪/mois en assurances. Verifiez les doublons entre assurance employeur et assurance privee.`,
      estimated_savings_monthly: Math.round(insuranceTotal * 0.2),
      category: 'assurance',
      priority: 'high',
      action_fr: 'Demandez un audit assurance gratuit a un courtier (sohen bituah). Verifiez les doublons avec votre couverture employeur.',
    })
  }

  // Bank fees
  const bankExpenses = expensesWithMonthly.filter(e => e.category === 'banque')
  const bankTotal = bankExpenses.reduce((s, e) => s + e.monthlyAmount, 0)
  if (bankTotal > BENCHMARKS.banque.good) {
    recommendations.push({
      id: 'bank-fees',
      title_fr: 'Frais bancaires',
      description_fr: `${Math.round(bankTotal)}₪/mois de frais bancaires. Les banques digitales (One Zero, Pepper) offrent souvent 0₪ de frais.`,
      estimated_savings_monthly: Math.round(bankTotal - BENCHMARKS.banque.good),
      category: 'banque',
      priority: 'medium',
      action_fr: 'Negociez avec votre banque ou passez a une banque digitale. Verifiez le mashov (rapport de frais annuel).',
    })
  }

  // Subscription check
  const subExpenses = expensesWithMonthly.filter(e => e.category === 'abonnements')
  if (subExpenses.length > 3) {
    const subTotal = subExpenses.reduce((s, e) => s + e.monthlyAmount, 0)
    recommendations.push({
      id: 'subscriptions-many',
      title_fr: `${subExpenses.length} abonnements actifs`,
      description_fr: `Vous avez ${subExpenses.length} abonnements pour ${Math.round(subTotal)}₪/mois. Verifiez que vous les utilisez tous.`,
      estimated_savings_monthly: Math.round(subTotal * 0.3),
      category: 'abonnements',
      priority: 'medium',
      action_fr: 'Listez chaque abonnement et annulez ceux que vous n\'utilisez plus. Verifiez vos releves de carte de credit.',
    })
  }

  // Energy
  const energyExpenses = expensesWithMonthly.filter(e => e.category === 'energie')
  const energyTotal = energyExpenses.reduce((s, e) => s + e.monthlyAmount, 0)
  if (energyTotal > BENCHMARKS.energie.avg) {
    recommendations.push({
      id: 'energy-high',
      title_fr: 'Facture energie elevee',
      description_fr: `${Math.round(energyTotal)}₪/mois en energie. Pensez au tarif nuit de la Hevrat Hashmal et aux panneaux solaires.`,
      estimated_savings_monthly: Math.round(energyTotal * 0.15),
      category: 'energie',
      priority: 'low',
      action_fr: 'Passez au tarif bi-horaire (meshulav) si vous pouvez concentrer votre consommation la nuit.',
    })
  }

  // General tips if few specific issues
  if (recommendations.length === 0 && totalMonthly > 0) {
    recommendations.push({
      id: 'general-review',
      title_fr: 'Revue generale recommandee',
      description_fr: 'Vos depenses semblent dans la norme. Une revue annuelle avec un conseiller financier reste recommandee.',
      estimated_savings_monthly: null,
      category: 'general',
      priority: 'low',
      action_fr: 'Planifiez une revue annuelle de vos depenses et assurances.',
    })
  }

  // Health score
  let healthScore = 80
  if (recommendations.filter(r => r.priority === 'high').length > 0) healthScore -= 20
  if (recommendations.filter(r => r.priority === 'medium').length > 0) healthScore -= 10
  healthScore = Math.max(20, Math.min(100, healthScore))

  const healthLabel = healthScore >= 80 ? 'Bon' : healthScore >= 60 ? 'Correct' : healthScore >= 40 ? 'A ameliorer' : 'Attention requise'

  return {
    totalMonthly: Math.round(totalMonthly),
    totalAnnual: Math.round(totalAnnual),
    categoryBreakdown,
    recommendations: recommendations.sort((a, b) => {
      const prio = { high: 0, medium: 1, low: 2 }
      return prio[a.priority] - prio[b.priority]
    }),
    healthScore,
    healthLabel,
  }
}
