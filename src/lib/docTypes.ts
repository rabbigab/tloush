/**
 * Single source of truth for document type labels, icons, colors, and categories.
 * Import from here instead of duplicating in each component.
 */

export const DOC_LABELS: Record<string, string> = {
  payslip: 'Fiche de paie',
  bituah_leumi: 'Bituah Leumi',
  tax_notice: 'Avis d\'impot',
  work_contract: 'Contrat de travail',
  pension: 'Retraite',
  health_insurance: 'Assurance sante',
  rental: 'Logement',
  bank: 'Bancaire',
  official_letter: 'Courrier officiel',
  contract: 'Contrat',
  invoice: 'Facture',
  receipt: 'Ticket de caisse',
  utility_bill: 'Facture service',
  insurance: 'Assurance',
  tax: 'Document fiscal',
  other: 'Document',
  unknown: 'Document',
}

export const DOC_ICONS: Record<string, string> = {
  payslip: '💰',
  bituah_leumi: '🏛️',
  tax_notice: '🧾',
  work_contract: '📋',
  pension: '🏦',
  health_insurance: '🏥',
  rental: '🏠',
  bank: '💳',
  official_letter: '📬',
  contract: '📄',
  invoice: '🧾',
  receipt: '🧾',
  utility_bill: '💡',
  insurance: '🛡️',
  tax: '📊',
  other: '📎',
  unknown: '📎',
}

export const DOC_COLORS: Record<string, string> = {
  payslip: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  bituah_leumi: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800',
  tax_notice: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
  work_contract: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
  pension: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  health_insurance: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800',
  rental: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  bank: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800',
  official_letter: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  contract: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  tax: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
  invoice: 'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/30 dark:text-lime-300 dark:border-lime-800',
  receipt: 'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/30 dark:text-lime-300 dark:border-lime-800',
  utility_bill: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800',
  insurance: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
  other: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
  unknown: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
}

export const DOC_CATEGORIES: Record<string, string> = {
  payslip: 'travail',
  work_contract: 'travail',
  bituah_leumi: 'securite_sociale',
  health_insurance: 'securite_sociale',
  tax_notice: 'fiscal',
  tax: 'fiscal',
  pension: 'retraite',
  rental: 'logement',
  bank: 'bancaire',
  invoice: 'finance',
  receipt: 'finance',
  utility_bill: 'finance',
  insurance: 'finance',
  official_letter: 'autre',
  contract: 'autre',
  other: 'autre',
  unknown: 'autre',
}

export function getDocLabel(type: string): string {
  return DOC_LABELS[type] || DOC_LABELS.other
}

export function getDocIcon(type: string): string {
  return DOC_ICONS[type] || DOC_ICONS.other
}

export function getDocColor(type: string): string {
  return DOC_COLORS[type] || DOC_COLORS.other
}
