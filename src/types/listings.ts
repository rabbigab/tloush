// =====================================================
// Types — Aggregateur immobilier
// =====================================================

export type ListingSource = 'yad2' | 'facebook'
export type ListingType = 'rent' | 'sale'
export type PropertyType = 'apartment' | 'house' | 'penthouse' | 'studio' | 'duplex' | 'garden_apartment' | 'rooftop' | 'other'

export interface Listing {
  id: string
  source: ListingSource
  source_id: string            // ID unique sur la plateforme d'origine
  source_url: string           // Lien vers l'annonce originale
  listing_type: ListingType
  property_type: PropertyType

  // Localisation
  city: string
  neighborhood: string | null
  street: string | null
  address_full: string | null
  latitude: number | null
  longitude: number | null

  // Details
  price: number | null
  currency: 'ILS' | 'USD' | 'EUR'
  rooms: number | null
  floor: number | null
  total_floors: number | null
  size_sqm: number | null
  balcony_sqm: number | null
  parking: boolean | null
  elevator: boolean | null
  air_conditioning: boolean | null
  furnished: boolean | null
  accessible: boolean | null

  // Dates
  entry_date: string | null    // Date d'entree disponible
  published_at: string | null  // Date de publication sur la source
  scraped_at: string           // Date du scraping

  // Contenu
  title: string | null
  description: string | null
  images: string[]
  contact_name: string | null
  contact_phone: string | null

  // Meta
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ListingFilters {
  source?: ListingSource
  listing_type?: ListingType
  property_type?: PropertyType
  city?: string
  min_price?: number
  max_price?: number
  min_rooms?: number
  max_rooms?: number
  min_size?: number
  max_size?: number
  has_parking?: boolean
  has_elevator?: boolean
  furnished?: boolean
  page?: number
  limit?: number
  sort_by?: 'price_asc' | 'price_desc' | 'date_desc' | 'size_desc'
}

export interface ScrapingResult {
  source: ListingSource
  total_scraped: number
  new_listings: number
  updated_listings: number
  errors: string[]
  duration_ms: number
}

// Villes principales israeliennes
export const ISRAELI_CITIES = [
  { slug: 'tel-aviv', name: 'Tel Aviv', nameHe: 'תל אביב', lat: 32.0853, lng: 34.7818 },
  { slug: 'jerusalem', name: 'Jerusalem', nameHe: 'ירושלים', lat: 31.7683, lng: 35.2137 },
  { slug: 'haifa', name: 'Haifa', nameHe: 'חיפה', lat: 32.7940, lng: 34.9896 },
  { slug: 'beer-sheva', name: 'Beer Sheva', nameHe: 'באר שבע', lat: 31.2530, lng: 34.7915 },
  { slug: 'netanya', name: 'Netanya', nameHe: 'נתניה', lat: 32.3215, lng: 34.8532 },
  { slug: 'raanana', name: "Ra'anana", nameHe: 'רעננה', lat: 32.1842, lng: 34.8710 },
  { slug: 'herzliya', name: 'Herzliya', nameHe: 'הרצליה', lat: 32.1629, lng: 34.8447 },
  { slug: 'ashdod', name: 'Ashdod', nameHe: 'אשדוד', lat: 31.8044, lng: 34.6553 },
  { slug: 'rishon-lezion', name: 'Rishon LeZion', nameHe: 'ראשון לציון', lat: 31.9730, lng: 34.7925 },
  { slug: 'petah-tikva', name: 'Petah Tikva', nameHe: 'פתח תקווה', lat: 32.0841, lng: 34.8878 },
  { slug: 'holon', name: 'Holon', nameHe: 'חולון', lat: 32.0115, lng: 34.7748 },
  { slug: 'bat-yam', name: 'Bat Yam', nameHe: 'בת ים', lat: 32.0236, lng: 34.7515 },
  { slug: 'rehovot', name: 'Rehovot', nameHe: 'רחובות', lat: 31.8928, lng: 34.8113 },
  { slug: 'ashkelon', name: 'Ashkelon', nameHe: 'אשקלון', lat: 31.6688, lng: 34.5743 },
  { slug: 'modiin', name: "Modi'in", nameHe: 'מודיעין', lat: 31.8969, lng: 35.0104 },
  { slug: 'kfar-saba', name: 'Kfar Saba', nameHe: 'כפר סבא', lat: 32.1780, lng: 34.9068 },
  { slug: 'givatayim', name: 'Givatayim', nameHe: 'גבעתיים', lat: 32.0726, lng: 34.8116 },
  { slug: 'ramat-gan', name: 'Ramat Gan', nameHe: 'רמת גן', lat: 32.0826, lng: 34.8131 },
] as const

export type CitySlug = typeof ISRAELI_CITIES[number]['slug']
