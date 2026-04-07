/**
 * Bank of Israel (BOI) Economic Data
 *
 * Key economic indicators for contextualizing financial calculations.
 * Updated periodically — values below are as of Q1 2026.
 */

export interface EconomicIndicator {
  id: string
  label_fr: string
  label_he: string
  value: number
  unit: string
  date: string // YYYY-MM
  trend: 'up' | 'down' | 'stable'
  note_fr?: string
}

export const ECONOMIC_DATA: EconomicIndicator[] = [
  {
    id: 'boi_rate',
    label_fr: 'Taux directeur BOI',
    label_he: 'ריבית בנק ישראל',
    value: 4.25,
    unit: '%',
    date: '2026-04',
    trend: 'stable',
    note_fr: 'Inchange depuis fevrier 2026. Impact direct sur les mashkantot a taux Prime.',
  },
  {
    id: 'prime_rate',
    label_fr: 'Taux Prime',
    label_he: 'ריבית פריים',
    value: 5.75,
    unit: '%',
    date: '2026-04',
    trend: 'stable',
    note_fr: 'Prime = taux BOI + 1.5%. Base des mashkantot a taux variable.',
  },
  {
    id: 'cpi_annual',
    label_fr: 'Inflation annuelle (Madad)',
    label_he: 'מדד המחירים לצרכן',
    value: 2.8,
    unit: '%',
    date: '2026-03',
    trend: 'down',
    note_fr: 'En baisse depuis le pic de 2023. Cible BOI : 1-3%.',
  },
  {
    id: 'avg_wage',
    label_fr: 'Salaire moyen',
    label_he: 'שכר ממוצע',
    value: 13_073,
    unit: '₪/mois',
    date: '2026-01',
    trend: 'up',
    note_fr: 'Salaire moyen brut. Source : CBS.',
  },
  {
    id: 'min_wage',
    label_fr: 'Salaire minimum',
    label_he: 'שכר מינימום',
    value: 6_060,
    unit: '₪/mois',
    date: '2026-04',
    trend: 'up',
    note_fr: 'Depuis avril 2026 : 6 060₪/mois, 33,28₪/h.',
  },
  {
    id: 'unemployment',
    label_fr: 'Taux de chomage',
    label_he: 'שיעור אבטלה',
    value: 3.6,
    unit: '%',
    date: '2026-02',
    trend: 'stable',
    note_fr: 'Marche du travail tendu. Source : CBS.',
  },
  {
    id: 'housing_index',
    label_fr: 'Indice des prix immobiliers',
    label_he: 'מדד מחירי דירות',
    value: 3.2,
    unit: '% annuel',
    date: '2026-01',
    trend: 'up',
    note_fr: 'Hausse moderee apres la correction de 2024. Source : CBS/BOI.',
  },
  {
    id: 'rent_index',
    label_fr: 'Indice des loyers',
    label_he: 'מדד שכר דירה',
    value: 4.1,
    unit: '% annuel',
    date: '2026-02',
    trend: 'up',
    note_fr: 'Les loyers continuent de monter plus vite que l\'inflation generale.',
  },
  {
    id: 'shekel_eur',
    label_fr: 'Taux EUR/ILS',
    label_he: 'שער אירו',
    value: 3.85,
    unit: '₪/€',
    date: '2026-04',
    trend: 'stable',
  },
  {
    id: 'shekel_usd',
    label_fr: 'Taux USD/ILS',
    label_he: 'שער דולר',
    value: 3.55,
    unit: '₪/$',
    date: '2026-04',
    trend: 'stable',
  },
]

/**
 * Get a specific indicator by ID
 */
export function getIndicator(id: string): EconomicIndicator | undefined {
  return ECONOMIC_DATA.find(d => d.id === id)
}

/**
 * Get indicators relevant to a specific context
 */
export function getContextIndicators(context: 'mashkanta' | 'salary' | 'rental' | 'general'): EconomicIndicator[] {
  const map: Record<string, string[]> = {
    mashkanta: ['boi_rate', 'prime_rate', 'cpi_annual', 'housing_index'],
    salary: ['avg_wage', 'min_wage', 'cpi_annual', 'unemployment'],
    rental: ['rent_index', 'cpi_annual', 'housing_index', 'shekel_eur'],
    general: ['boi_rate', 'cpi_annual', 'avg_wage', 'unemployment', 'shekel_eur', 'shekel_usd'],
  }
  const ids = map[context] || map.general
  return ECONOMIC_DATA.filter(d => ids.includes(d.id))
}

/**
 * Format an indicator's value for display
 */
export function formatIndicatorValue(indicator: EconomicIndicator): string {
  if (indicator.unit === '₪/mois') {
    return `${indicator.value.toLocaleString('fr-FR')}₪`
  }
  if (indicator.unit.includes('₪')) {
    return `${indicator.value.toFixed(2)}${indicator.unit}`
  }
  return `${indicator.value}${indicator.unit}`
}

/**
 * Compare user's mortgage rate to current prime rate
 */
export function compareToPrime(userRate: number): { diff: number; assessment_fr: string } {
  const prime = getIndicator('prime_rate')!.value
  const diff = userRate - prime
  let assessment_fr: string
  if (diff < -0.5) assessment_fr = 'Votre taux est nettement inferieur au Prime — tres bon deal.'
  else if (diff < 0) assessment_fr = 'Votre taux est legerement sous le Prime — bon taux.'
  else if (diff < 0.5) assessment_fr = 'Votre taux est proche du Prime — dans la norme.'
  else if (diff < 1.5) assessment_fr = 'Votre taux depasse le Prime de plus de 0.5% — negociable.'
  else assessment_fr = 'Votre taux est tres au-dessus du Prime — envisagez un refinancement.'
  return { diff, assessment_fr }
}

/**
 * Check if user's rent increase is above CPI
 */
export function checkRentVsCPI(rentIncreasePct: number): { diff: number; assessment_fr: string } {
  const cpi = getIndicator('cpi_annual')!.value
  const diff = rentIncreasePct - cpi
  let assessment_fr: string
  if (diff < 0) assessment_fr = 'Votre augmentation de loyer est inferieure a l\'inflation — acceptable.'
  else if (diff < 1) assessment_fr = 'Votre augmentation est legerement au-dessus de l\'inflation — dans la norme du marche.'
  else if (diff < 3) assessment_fr = 'Votre augmentation depasse l\'inflation de plus de 1% — negociez ou comparez.'
  else assessment_fr = 'Augmentation tres au-dessus de l\'inflation — verifiez vos droits.'
  return { diff, assessment_fr }
}
