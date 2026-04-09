import { Wrench, Zap, Paintbrush, Key, Thermometer } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// =====================================================
// Types
// =====================================================

export type ProviderCategory = 'plombier' | 'electricien' | 'peintre' | 'serrurier' | 'climatisation'

export type ProviderStatus = 'pending' | 'active' | 'delisted'
export type ReviewStatus = 'pending' | 'published' | 'rejected'
export type ApplicationStatus = 'pending' | 'contacted' | 'referenced' | 'rejected'

export interface Provider {
  id: string
  slug: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
  photo_url: string | null
  category: ProviderCategory
  specialties: string[]
  service_areas: string[]
  languages: string[]
  description: string | null
  years_experience: number | null
  osek_number: string | null
  is_referenced: boolean
  status: ProviderStatus
  average_rating: number
  total_reviews: number
  created_at: string
  updated_at: string
}

export interface ProviderReview {
  id: string
  user_id: string
  provider_id: string
  contact_id: string
  rating: 1 | 2 | 3 | 4 | 5
  comment: string | null
  provider_response: string | null
  provider_responded_at: string | null
  status: ReviewStatus
  created_at: string
  // Joined fields
  user_first_name?: string
}

/** Lighter type for display purposes (from API select) */
export interface ProviderReviewDisplay {
  id: string
  rating: number
  comment: string | null
  provider_response: string | null
  provider_responded_at: string | null
  created_at: string
  user_id: string
}

export interface ProviderContact {
  id: string
  user_id: string
  provider_id: string
  whatsapp_opted_in: boolean
  followup_sent_at: string | null
  followup_reminder_sent_at: string | null
  created_at: string
}

export interface ProviderApplication {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
  category: string
  specialties: string[]
  service_areas: string[]
  description: string | null
  osek_number: string | null
  tz_photo_url: string | null
  reference_name: string | null
  reference_phone: string | null
  status: ApplicationStatus
  admin_notes: string | null
  created_at: string
  reviewed_at: string | null
}

// =====================================================
// Constantes
// =====================================================

export interface CategoryInfo {
  slug: ProviderCategory
  label: string
  hebrewTerm: string
  icon: LucideIcon
  color: string
  iconColor: string
  description: string
}

export const PROVIDER_CATEGORIES: CategoryInfo[] = [
  {
    slug: 'plombier',
    label: 'Plombier',
    hebrewTerm: 'אינסטלטור',
    icon: Wrench,
    color: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    description: 'Fuites, chauffe-eau solaire, salle de bain, canalisations',
  },
  {
    slug: 'electricien',
    label: 'Electricien',
    hebrewTerm: 'חשמלאי',
    icon: Zap,
    color: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
    iconColor: 'text-amber-600 dark:text-amber-400',
    description: 'Installation, depannage, tableau electrique, prises',
  },
  {
    slug: 'peintre',
    label: 'Peintre',
    hebrewTerm: 'צבעי',
    icon: Paintbrush,
    color: 'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800',
    iconColor: 'text-purple-600 dark:text-purple-400',
    description: 'Peinture interieure, exterieure, enduits, renovation',
  },
  {
    slug: 'serrurier',
    label: 'Serrurier',
    hebrewTerm: 'מנעולן',
    icon: Key,
    color: 'bg-slate-50 border-slate-200 dark:bg-slate-950/30 dark:border-slate-700',
    iconColor: 'text-slate-600 dark:text-slate-400',
    description: 'Ouverture de porte, changement de serrure, securite',
  },
  {
    slug: 'climatisation',
    label: 'Climatisation',
    hebrewTerm: 'מזגן',
    icon: Thermometer,
    color: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-800',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    description: 'Installation, entretien, depannage, nettoyage',
  },
]

export const PROVIDER_CITIES = [
  { slug: 'netanya', label: 'Netanya' },
  { slug: 'ashdod', label: 'Ashdod' },
  { slug: 'jerusalem', label: 'Jerusalem' },
  { slug: 'tel-aviv', label: 'Tel Aviv' },
  { slug: 'haifa', label: 'Haifa' },
  { slug: 'raanana', label: "Ra'anana" },
  { slug: 'herzliya', label: 'Herzliya' },
  { slug: 'beer-sheva', label: 'Beer Sheva' },
  { slug: 'petah-tikva', label: 'Petah Tikva' },
  { slug: 'bat-yam', label: 'Bat Yam' },
] as const

export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return PROVIDER_CATEGORIES.find(c => c.slug === slug)
}

export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

export function getProviderDisplayName(provider: Pick<Provider, 'first_name' | 'last_name'>): string {
  return `${provider.first_name} ${provider.last_name.charAt(0)}.`
}
