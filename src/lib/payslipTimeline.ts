// =====================================================
// Payslip timeline analysis
// =====================================================
// Analyse l'evolution des fiches de paie sur 12 mois pour detecter
// des tendances, augmentations, anomalies.

export interface PayslipMonth {
  document_id: string
  period: string              // "Avril 2025"
  year: number
  month: number               // 1-12
  gross: number | null
  net: number | null
  income_tax: number | null
  bituah_leumi: number | null
  health: number | null
  pension_employee: number | null
  transport: number | null
  bonuses: number | null
  overtime_125: number | null
  overtime_150: number | null
  hours_worked: number | null
}

export interface PayslipAnomaly {
  month: string
  level: 'info' | 'warning' | 'critical'
  type: 'raise' | 'drop' | 'new_line' | 'missing_line' | 'outlier'
  title: string
  description: string
  amount?: number
  percent?: number
}

export interface PayslipTimelineResult {
  months: PayslipMonth[]
  coverage: {
    totalMonths: number
    yearStart: string
    yearEnd: string
    missingMonths: string[]
  }
  totals: {
    grossYear: number
    netYear: number
    taxYear: number
    blYear: number
    averageMonthly: number
  }
  trends: {
    grossEvolutionPct: number   // % entre premier et dernier mois
    netEvolutionPct: number
    maxGross: number
    minGross: number
  }
  anomalies: PayslipAnomaly[]
}

const MONTH_NAMES_FR = [
  'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre',
]

function parsePeriod(period: string | null): { year: number; month: number } | null {
  if (!period) return null
  // Formats possibles : "Avril 2025", "04/2025", "2025-04", "Avril/2025"
  const lower = period.toLowerCase().trim()

  // Format "YYYY-MM" ou "YYYY/MM"
  const numericMatch = lower.match(/(\d{4})[-/](\d{1,2})/)
  if (numericMatch) {
    return { year: Number(numericMatch[1]), month: Number(numericMatch[2]) }
  }

  // Format "MM/YYYY"
  const reverseMatch = lower.match(/(\d{1,2})[-/](\d{4})/)
  if (reverseMatch) {
    return { year: Number(reverseMatch[2]), month: Number(reverseMatch[1]) }
  }

  // Format "Mois YYYY" en francais
  for (let i = 0; i < MONTH_NAMES_FR.length; i++) {
    if (lower.includes(MONTH_NAMES_FR[i].toLowerCase().slice(0, 4))) {
      const yearMatch = lower.match(/(\d{4})/)
      if (yearMatch) {
        return { year: Number(yearMatch[1]), month: i + 1 }
      }
    }
  }

  return null
}

/**
 * Extrait les donnees normalisees depuis un document payslip.
 */
export function extractPayslipData(doc: {
  id: string
  period: string | null
  analysis_data: Record<string, unknown> | null
}): PayslipMonth | null {
  const parsed = parsePeriod(doc.period)
  if (!parsed) return null

  const details = (doc.analysis_data?.payslip_details as Record<string, unknown>) || {}
  const num = (v: unknown): number | null => {
    const n = Number(v)
    return !isNaN(n) && n !== 0 ? n : null
  }

  return {
    document_id: doc.id,
    period: doc.period || '',
    year: parsed.year,
    month: parsed.month,
    gross: num(details.gross_salary),
    net: num(details.net_salary),
    income_tax: num(details.income_tax),
    bituah_leumi: num(details.bituah_leumi),
    health: num(details.health_insurance),
    pension_employee: num(details.pension_employee),
    transport: num(details.transport),
    bonuses: num(details.bonuses),
    overtime_125: num(details.overtime_125_amount),
    overtime_150: num(details.overtime_150_amount),
    hours_worked: num(details.hours_worked),
  }
}

/**
 * Construit la timeline complete d'une annee de fiches de paie.
 */
export function buildTimeline(
  months: PayslipMonth[],
  year: number
): PayslipTimelineResult {
  // Filtrer l'annee et trier chronologiquement
  const filtered = months
    .filter(m => m.year === year)
    .sort((a, b) => a.month - b.month)

  // Detection des mois manquants
  const presentMonths = new Set(filtered.map(m => m.month))
  const missingMonths: string[] = []
  for (let i = 1; i <= 12; i++) {
    if (!presentMonths.has(i)) {
      missingMonths.push(`${MONTH_NAMES_FR[i - 1]} ${year}`)
    }
  }

  // Totaux annuels
  const grossYear = filtered.reduce((s, m) => s + (m.gross || 0), 0)
  const netYear = filtered.reduce((s, m) => s + (m.net || 0), 0)
  const taxYear = filtered.reduce((s, m) => s + (m.income_tax || 0), 0)
  const blYear = filtered.reduce((s, m) => s + (m.bituah_leumi || 0), 0)
  const averageMonthly = filtered.length > 0 ? grossYear / filtered.length : 0

  // Tendances
  const grossValues = filtered.map(m => m.gross || 0).filter(g => g > 0)
  const netValues = filtered.map(m => m.net || 0).filter(n => n > 0)

  const firstGross = grossValues[0] || 0
  const lastGross = grossValues[grossValues.length - 1] || 0
  const firstNet = netValues[0] || 0
  const lastNet = netValues[netValues.length - 1] || 0

  const grossEvolutionPct = firstGross > 0 ? ((lastGross - firstGross) / firstGross) * 100 : 0
  const netEvolutionPct = firstNet > 0 ? ((lastNet - firstNet) / firstNet) * 100 : 0

  // Detection des anomalies
  const anomalies = detectAnomalies(filtered)

  return {
    months: filtered,
    coverage: {
      totalMonths: filtered.length,
      yearStart: `Janvier ${year}`,
      yearEnd: `Decembre ${year}`,
      missingMonths,
    },
    totals: {
      grossYear: Math.round(grossYear),
      netYear: Math.round(netYear),
      taxYear: Math.round(taxYear),
      blYear: Math.round(blYear),
      averageMonthly: Math.round(averageMonthly),
    },
    trends: {
      grossEvolutionPct: Math.round(grossEvolutionPct * 10) / 10,
      netEvolutionPct: Math.round(netEvolutionPct * 10) / 10,
      maxGross: Math.max(...grossValues, 0),
      minGross: grossValues.length > 0 ? Math.min(...grossValues) : 0,
    },
    anomalies,
  }
}

/**
 * Detecte les anomalies et variations dans la timeline.
 */
export function detectAnomalies(months: PayslipMonth[]): PayslipAnomaly[] {
  const anomalies: PayslipAnomaly[] = []

  for (let i = 1; i < months.length; i++) {
    const prev = months[i - 1]
    const curr = months[i]
    const periodLabel = `${MONTH_NAMES_FR[curr.month - 1]} ${curr.year}`

    // Variation du brut > 3%
    if (prev.gross && curr.gross) {
      const deltaPct = ((curr.gross - prev.gross) / prev.gross) * 100
      if (Math.abs(deltaPct) >= 3) {
        anomalies.push({
          month: periodLabel,
          level: deltaPct > 10 || deltaPct < -10 ? 'warning' : 'info',
          type: deltaPct > 0 ? 'raise' : 'drop',
          title: deltaPct > 0 ? `Augmentation de ${deltaPct.toFixed(1)}%` : `Baisse de ${Math.abs(deltaPct).toFixed(1)}%`,
          description: `Salaire brut ${deltaPct > 0 ? 'augmente' : 'diminue'} de ${Math.round(prev.gross).toLocaleString('fr-IL')} ₪ a ${Math.round(curr.gross).toLocaleString('fr-IL')} ₪ entre ${MONTH_NAMES_FR[prev.month - 1]} et ${MONTH_NAMES_FR[curr.month - 1]}.`,
          amount: curr.gross - prev.gross,
          percent: deltaPct,
        })
      }
    }

    // Nouvelle ligne de bonus
    if (curr.bonuses && !prev.bonuses) {
      anomalies.push({
        month: periodLabel,
        level: 'info',
        type: 'new_line',
        title: 'Nouvelle prime detectee',
        description: `Une prime de ${Math.round(curr.bonuses).toLocaleString('fr-IL')} ₪ apparait sur cette fiche.`,
        amount: curr.bonuses,
      })
    }

    // Ligne disparue
    if (prev.bonuses && !curr.bonuses && prev.bonuses > 100) {
      anomalies.push({
        month: periodLabel,
        level: 'warning',
        type: 'missing_line',
        title: 'Prime disparue',
        description: `La prime de ${Math.round(prev.bonuses).toLocaleString('fr-IL')} ₪ presente en ${MONTH_NAMES_FR[prev.month - 1]} n'est plus sur cette fiche.`,
      })
    }

    // Heures sup apparaissent
    if ((curr.overtime_125 || curr.overtime_150) && !(prev.overtime_125 || prev.overtime_150)) {
      anomalies.push({
        month: periodLabel,
        level: 'info',
        type: 'new_line',
        title: 'Heures supplementaires',
        description: `Heures supplementaires detectees pour ${Math.round((curr.overtime_125 || 0) + (curr.overtime_150 || 0)).toLocaleString('fr-IL')} ₪.`,
      })
    }
  }

  return anomalies
}

/**
 * Retourne la liste des annees disponibles dans les payslips.
 */
export function getAvailableYears(months: PayslipMonth[]): number[] {
  const years = new Set(months.map(m => m.year))
  return Array.from(years).sort((a, b) => b - a)
}
