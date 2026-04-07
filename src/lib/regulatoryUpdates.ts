/**
 * Israeli Regulatory Updates 2024-2025
 *
 * Tracks changes in Israeli labor law, tax, pension, and social security
 * that affect document analysis and employee rights calculations.
 */

export interface RegulatoryUpdate {
  id: string
  date: string       // YYYY-MM-DD
  category: 'salary' | 'tax' | 'pension' | 'social_security' | 'labor_law'
  title_fr: string
  description_fr: string
  impact: 'high' | 'medium' | 'low'
  affectedDocTypes: string[]
}

export const REGULATORY_UPDATES_2025: RegulatoryUpdate[] = [
  {
    id: 'min-wage-2024',
    date: '2024-04-01',
    category: 'salary',
    title_fr: 'Augmentation du salaire minimum',
    description_fr: 'Le salaire minimum passe de 5 571,75₪ a 5 880,02₪/mois (32,30₪/h). Toute fiche de paie a partir d\'avril 2024 doit refleter ce nouveau montant.',
    impact: 'high',
    affectedDocTypes: ['payslip', 'work_contract'],
  },
  {
    id: 'tax-brackets-2025',
    date: '2025-01-01',
    category: 'tax',
    title_fr: 'Mise a jour des tranches d\'impot 2025',
    description_fr: 'Les tranches d\'impot sur le revenu (mas hachnasa) sont ajustees pour 2025. La premiere tranche (10%) s\'applique jusqu\'a 7 010₪/mois. La valeur du point de credit fiscal est de 242₪/mois.',
    impact: 'high',
    affectedDocTypes: ['payslip', 'tax_notice'],
  },
  {
    id: 'bl-thresholds-2025',
    date: '2025-01-01',
    category: 'social_security',
    title_fr: 'Seuils Bituach Leumi 2025',
    description_fr: 'Le seuil de cotisation reduite passe a 7 122₪/mois. En dessous : 0,4% BL + 3,1% sante. Au-dessus : 7% BL + 5% sante. Plafond : 49 030₪/mois.',
    impact: 'high',
    affectedDocTypes: ['payslip', 'bituah_leumi'],
  },
  {
    id: 'pension-rates-2025',
    date: '2025-01-01',
    category: 'pension',
    title_fr: 'Taux de pension obligatoire confirmes',
    description_fr: 'Les taux de pension obligatoires restent a 6% employe + 6,5% employeur + 6% pitzouim employeur = 18,5% total. Obligatoire apres 6 mois d\'emploi.',
    impact: 'medium',
    affectedDocTypes: ['payslip', 'pension'],
  },
  {
    id: 'havraa-rate-2024',
    date: '2024-06-01',
    category: 'labor_law',
    title_fr: 'Taux dmei havra\'a 2024',
    description_fr: 'La prime de convalescence (dmei havra\'a) est fixee a 418₪/jour pour 2024. Le nombre de jours varie de 5 (1ere annee) a 10 (20+ ans).',
    impact: 'low',
    affectedDocTypes: ['payslip'],
  },
  {
    id: 'keren-hishtalmut-ceiling-2025',
    date: '2025-01-01',
    category: 'tax',
    title_fr: 'Plafond keren hishtalmut 2025',
    description_fr: 'Le plafond annuel pour gains exoneres d\'impot sur la keren hishtalmut est de ~15 712₪. Taux standard : 2,5% employe / 7,5% employeur. Retrait exonere apres 6 ans.',
    impact: 'medium',
    affectedDocTypes: ['payslip', 'pension'],
  },
  {
    id: 'surtax-threshold-2025',
    date: '2025-01-01',
    category: 'tax',
    title_fr: 'Surtaxe hauts revenus (mas yoter)',
    description_fr: 'La surtaxe de 3% s\'applique aux revenus annuels superieurs a 721 560₪ (soit ~60 130₪/mois). Taux marginal effectif : 53%.',
    impact: 'low',
    affectedDocTypes: ['payslip', 'tax_notice'],
  },
  {
    id: 'severance-tax-exempt-2025',
    date: '2025-01-01',
    category: 'labor_law',
    title_fr: 'Plafond exoneration pitzouim',
    description_fr: 'L\'exoneration d\'impot sur les indemnites de licenciement (pitzouim) est de 13 750₪ par annee de service. Au-dela, imposition selon les tranches normales.',
    impact: 'medium',
    affectedDocTypes: ['payslip', 'work_contract'],
  },
  {
    id: 'maternity-leave-2025',
    date: '2025-01-01',
    category: 'labor_law',
    title_fr: 'Conge maternite 2025',
    description_fr: 'Le conge maternite reste a 26 semaines totales dont 15 payees par le Bituach Leumi. Paternite : 5 jours. Le pere peut prendre jusqu\'a 6 semaines transferees de la mere.',
    impact: 'low',
    affectedDocTypes: ['bituah_leumi', 'work_contract'],
  },
  {
    id: 'pension-payout-exemption-2026',
    date: '2026-01-01',
    category: 'pension',
    title_fr: 'Exoneration versements pension 2026',
    description_fr: 'A partir de 2026, 57,5% des versements de pension de retraite sont exoneres d\'impot (augmentation a 62,5% en 2027). Important pour la planification retraite.',
    impact: 'medium',
    affectedDocTypes: ['pension'],
  },
]

/**
 * Get updates relevant to a specific document type
 */
export function getRelevantUpdates(documentType: string): RegulatoryUpdate[] {
  return REGULATORY_UPDATES_2025
    .filter(u => u.affectedDocTypes.includes(documentType))
    .sort((a, b) => b.date.localeCompare(a.date))
}

/**
 * Get updates from the last N months
 */
export function getRecentUpdates(months: number = 6): RegulatoryUpdate[] {
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - months)
  const cutoffStr = cutoff.toISOString().split('T')[0]
  return REGULATORY_UPDATES_2025
    .filter(u => u.date >= cutoffStr)
    .sort((a, b) => b.date.localeCompare(a.date))
}

/**
 * Get high-impact updates for dashboard notification
 */
export function getHighImpactUpdates(): RegulatoryUpdate[] {
  return REGULATORY_UPDATES_2025
    .filter(u => u.impact === 'high')
    .sort((a, b) => b.date.localeCompare(a.date))
}
