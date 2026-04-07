/**
 * Israeli Regulatory Updates 2024-2026
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

export const REGULATORY_UPDATES: RegulatoryUpdate[] = [
  // ─── 2026 Updates ───
  {
    id: 'min-wage-2026',
    date: '2026-04-01',
    category: 'salary',
    title_fr: 'Salaire minimum avril 2026',
    description_fr: 'Le salaire minimum passe a 6 060₪/mois (33,28₪/h). Verifiez votre fiche de paie a partir d\'avril 2026.',
    impact: 'high',
    affectedDocTypes: ['payslip', 'work_contract'],
  },
  {
    id: 'tax-brackets-2026',
    date: '2026-01-01',
    category: 'tax',
    title_fr: 'Tranches d\'impot mises a jour pour 2026',
    description_fr: 'Les tranches d\'impot sur le revenu sont reindexees pour 2026. La valeur du point de credit fiscal passe a 248₪/mois. Les seuils de chaque tranche augmentent d\'environ 2,5%.',
    impact: 'high',
    affectedDocTypes: ['payslip', 'tax_notice'],
  },
  {
    id: 'bl-thresholds-2026',
    date: '2026-01-01',
    category: 'social_security',
    title_fr: 'Seuils Bituach Leumi 2026',
    description_fr: 'Le seuil de cotisation reduite passe a 7 300₪/mois. Taux reduit : 0,4% BL + 3,1% sante. Taux normal : 7% BL + 5% sante. Plafond cotisable : 50 250₪/mois.',
    impact: 'high',
    affectedDocTypes: ['payslip', 'bituah_leumi'],
  },
  {
    id: 'pension-payout-exemption-2026',
    date: '2026-01-01',
    category: 'pension',
    title_fr: 'Exoneration versements pension 2026',
    description_fr: '57,5% des versements de pension de retraite sont exoneres d\'impot (augmentation a 62,5% en 2027). Important pour la planification retraite.',
    impact: 'medium',
    affectedDocTypes: ['pension'],
  },
  {
    id: 'keren-hishtalmut-2026',
    date: '2026-01-01',
    category: 'tax',
    title_fr: 'Plafond keren hishtalmut 2026',
    description_fr: 'Le plafond annuel pour gains exoneres sur la keren hishtalmut passe a ~16 100₪. Taux standard : 2,5% employe / 7,5% employeur.',
    impact: 'medium',
    affectedDocTypes: ['payslip', 'pension'],
  },
  {
    id: 'havraa-rate-2026',
    date: '2026-06-01',
    category: 'labor_law',
    title_fr: 'Taux dmei havra\'a 2026',
    description_fr: 'La prime de convalescence (dmei havra\'a) est fixee a 430₪/jour pour 2026. Le nombre de jours varie de 5 (1ere annee) a 10 (20+ ans).',
    impact: 'low',
    affectedDocTypes: ['payslip'],
  },
  {
    id: 'digital-payslip-2026',
    date: '2026-03-01',
    category: 'labor_law',
    title_fr: 'Fiche de paie numerique obligatoire',
    description_fr: 'Les employeurs de plus de 50 salaries doivent desormais fournir une fiche de paie numerique (tloush electronique) en plus de la version papier. Le format doit inclure tous les champs requis par la loi.',
    impact: 'medium',
    affectedDocTypes: ['payslip', 'work_contract'],
  },
  // ─── 2025 Updates (still relevant) ───
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
    id: 'surtax-threshold-2026',
    date: '2026-01-01',
    category: 'tax',
    title_fr: 'Surtaxe hauts revenus (mas yoter) 2026',
    description_fr: 'La surtaxe de 3% s\'applique aux revenus annuels superieurs a 739 600₪ (soit ~61 633₪/mois). Taux marginal effectif : 53%.',
    impact: 'low',
    affectedDocTypes: ['payslip', 'tax_notice'],
  },
  {
    id: 'severance-tax-exempt-2026',
    date: '2026-01-01',
    category: 'labor_law',
    title_fr: 'Plafond exoneration pitzouim 2026',
    description_fr: 'L\'exoneration d\'impot sur les indemnites de licenciement (pitzouim) passe a 14 100₪ par annee de service. Au-dela, imposition selon les tranches normales.',
    impact: 'medium',
    affectedDocTypes: ['payslip', 'work_contract'],
  },
  {
    id: 'maternity-leave-2026',
    date: '2026-01-01',
    category: 'labor_law',
    title_fr: 'Conge maternite/paternite 2026',
    description_fr: 'Le conge maternite reste a 26 semaines dont 15 payees par le BL. Paternite : extension a 7 jours (contre 5 auparavant). Le pere peut prendre jusqu\'a 6 semaines transferees de la mere.',
    impact: 'medium',
    affectedDocTypes: ['bituah_leumi', 'work_contract'],
  },
]

// Keep backward compat
export const REGULATORY_UPDATES_2025 = REGULATORY_UPDATES

/**
 * Get updates relevant to a specific document type
 */
export function getRelevantUpdates(documentType: string): RegulatoryUpdate[] {
  return REGULATORY_UPDATES
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
  return REGULATORY_UPDATES
    .filter(u => u.date >= cutoffStr)
    .sort((a, b) => b.date.localeCompare(a.date))
}

/**
 * Get high-impact updates for dashboard notification
 */
export function getHighImpactUpdates(): RegulatoryUpdate[] {
  return REGULATORY_UPDATES
    .filter(u => u.impact === 'high')
    .sort((a, b) => b.date.localeCompare(a.date))
}
