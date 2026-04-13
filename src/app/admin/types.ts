// Shared types for AdminDashboard tab components

export interface UserData {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  plan: string
  subscription_status: string
  total_documents: number
  documents_this_month: number
  provider: string
  phone: string | null
}

export interface Feedback {
  id: string
  user_id: string
  email: string | null
  category: string
  message: string
  status: string
  admin_note: string | null
  created_at: string
}

export interface RecentDoc {
  id: string
  user_id: string
  file_name: string
  document_type: string
  status: string
  created_at: string
  summary_fr: string | null
}

export interface AdminData {
  overview: {
    total_users: number
    recent_signups_7d: number
    active_users_7d: number
    active_users_30d: number
    total_documents: number
    mrr: number
    active_solo: number
    active_family: number
    avg_docs_per_user: number
    retention_rate_7d: number
    conversion_rate: number
    users_with_docs: number
    feedback_new: number
  }
  plan_distribution: { free: number; solo: number; family: number }
  signup_trend: { date: string; count: number }[]
  docs_trend: { date: string; count: number }[]
  doc_type_distribution: Record<string, number>
  feedback_stats: {
    total: number
    new: number
    byCategory: { bug: number; suggestion: number; question: number; other: number }
  }
  feedbacks: Feedback[]
  users: UserData[]
  recent_documents: RecentDoc[]
}

// ---- Constants shared across tabs ----

export const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuit', solo: 'Solo', family: 'Famille',
}

export const PLAN_COLORS: Record<string, string> = {
  free: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  solo: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  family: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
}

export const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  past_due: 'bg-yellow-100 text-yellow-700',
  canceled: 'bg-red-100 text-red-700',
  none: 'bg-slate-100 text-slate-500',
}

export const DOC_LABELS: Record<string, string> = {
  payslip: 'Fiche de paie', bituah_leumi: 'Bituah Leumi', tax_notice: 'Fiscal',
  work_contract: 'Contrat', invoice: 'Facture', other: 'Autre',
  pension: 'Retraite', health_insurance: 'Santé', rental: 'Location',
  bank: 'Bancaire', official_letter: 'Courrier', receipt: 'Reçu',
  utility_bill: 'Facture', insurance: 'Assurance', contract: 'Contrat',
}

export const FEEDBACK_STATUS_LABELS: Record<string, string> = {
  new: 'Nouveau', read: 'Lu', resolved: 'Résolu', archived: 'Archivé',
}

export const FEEDBACK_STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  read: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  resolved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  archived: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
}

export const CATEGORY_LABELS: Record<string, string> = {
  bug: 'Bug', suggestion: 'Suggestion', question: 'Question', other: 'Autre',
}

// ---- Utility functions ----

export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `il y a ${days}j`
  const months = Math.floor(days / 30)
  return `il y a ${months} mois`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
