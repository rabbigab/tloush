// =====================================================
// Scraper Yad2 — Annonces immobilieres
// =====================================================
// Yad2 a une API JSON interne qu'on peut interroger directement.
// Plus fiable que du scraping HTML et moins fragile.

import type { Listing, ListingType, PropertyType, ScrapingResult } from '@/types/listings'
import { geocodeAddress, geocodeCity } from './geocode'

const YAD2_API_BASE = 'https://gw.yad2.co.il/feed-search-legacy/realestate'

// Mapping des types de propriete Yad2 -> nos types
const PROPERTY_TYPE_MAP: Record<string, PropertyType> = {
  'דירה': 'apartment',
  'דירת גן': 'garden_apartment',
  'בית פרטי/קוטג\'': 'house',
  'קוטג\'': 'house',
  'פנטהאוז': 'penthouse',
  'דופלקס': 'duplex',
  'סטודיו/לופט': 'studio',
  'דירת גג': 'rooftop',
  'יחידת דיור': 'studio',
}

interface Yad2FeedItem {
  id: string
  link_token?: string
  title_1?: string
  title_2?: string
  city?: string
  neighborhood?: string
  street?: string
  address?: string
  price?: string
  Rooms_text?: string
  SquareMeter_text?: string
  Floor_text?: string
  row_1?: Array<{ value?: string; key?: string }>
  row_2?: Array<{ value?: string; key?: string }>
  row_3?: Array<{ value?: string; key?: string }>
  row_4?: Array<{ value?: string; key?: string }>
  images?: Array<{ src?: string }>
  date?: string
  date_added?: string
  merchant?: boolean
  contact_name?: string
  line_1?: string
  line_2?: string
  line_3?: string
  // Additional info
  PropertyType_text?: string
  Parking_text?: string
  Elevator_text?: string
  AirConditioner_text?: string
  Furniture_text?: string
  Balcony_text?: string
  TotalFloor_text?: string
  EntranceDate_text?: string
  info_text?: string
  coordinates?: { latitude?: number; longitude?: number }
}

interface Yad2ApiResponse {
  data?: {
    feed?: {
      feed_items?: Yad2FeedItem[]
      total_items?: number
      current_page?: number
      total_pages?: number
    }
  }
}

function parsePrice(priceStr?: string): number | null {
  if (!priceStr) return null
  const cleaned = priceStr.replace(/[^\d]/g, '')
  const num = parseInt(cleaned, 10)
  return isNaN(num) ? null : num
}

function parseRooms(roomsStr?: string): number | null {
  if (!roomsStr) return null
  const num = parseFloat(roomsStr.replace(/[^\d.]/g, ''))
  return isNaN(num) ? null : num
}

function parseFloor(floorStr?: string): number | null {
  if (!floorStr) return null
  // Yad2 format: "קומה 3" ou "קרקע" (rez-de-chaussee)
  if (floorStr.includes('קרקע')) return 0
  const num = parseInt(floorStr.replace(/[^\d-]/g, ''), 10)
  return isNaN(num) ? null : num
}

function parseSqm(sqmStr?: string): number | null {
  if (!sqmStr) return null
  const num = parseFloat(sqmStr.replace(/[^\d.]/g, ''))
  return isNaN(num) ? null : num
}

function mapPropertyType(typeStr?: string): PropertyType {
  if (!typeStr) return 'apartment'
  for (const [key, value] of Object.entries(PROPERTY_TYPE_MAP)) {
    if (typeStr.includes(key)) return value
  }
  return 'other'
}

function hasBooleanFeature(text?: string): boolean | null {
  if (!text) return null
  if (text === 'יש' || text === 'כן') return true
  if (text === 'אין' || text === 'לא') return false
  return text.length > 0 ? true : null
}

function extractFieldValue(
  rows: Array<Array<{ value?: string; key?: string }> | undefined>,
  key: string
): string | undefined {
  for (const row of rows) {
    if (!row) continue
    const field = row.find(f => f.key === key)
    if (field?.value) return field.value
  }
  return undefined
}

/**
 * Scrape les annonces Yad2 pour une ville et un type donne.
 */
export async function scrapeYad2(
  listingType: ListingType = 'rent',
  cityName?: string,
  maxPages: number = 3
): Promise<{ listings: Partial<Listing>[]; errors: string[] }> {
  const listings: Partial<Listing>[] = []
  const errors: string[] = []

  const endpoint = listingType === 'rent' ? 'rent' : 'forsale'

  for (let page = 1; page <= maxPages; page++) {
    try {
      const params = new URLSearchParams({
        page: String(page),
      })

      if (cityName) {
        params.set('city', cityName)
      }

      const url = `${YAD2_API_BASE}/${endpoint}?${params}`

      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8',
        },
      })

      if (!res.ok) {
        errors.push(`Yad2 page ${page}: HTTP ${res.status}`)
        continue
      }

      const data: Yad2ApiResponse = await res.json()
      const items = data?.data?.feed?.feed_items ?? []

      for (const item of items) {
        if (!item.id) continue

        const rows = [item.row_1, item.row_2, item.row_3, item.row_4]
        const roomsText = item.Rooms_text || extractFieldValue(rows, 'rooms')
        const sqmText = item.SquareMeter_text || extractFieldValue(rows, 'square_meters')
        const floorText = item.Floor_text || extractFieldValue(rows, 'floor')

        // Geocoding: utiliser les coordonnees Yad2 si disponibles, sinon geocoder
        let latitude = item.coordinates?.latitude ?? null
        let longitude = item.coordinates?.longitude ?? null

        if (!latitude || !longitude) {
          const address = item.street || item.address || ''
          const city = item.city || ''
          if (address && city) {
            const coords = await geocodeAddress(address, city)
            if (coords) {
              latitude = coords.lat
              longitude = coords.lng
            }
          } else if (city) {
            const coords = geocodeCity(city)
            if (coords) {
              latitude = coords.lat
              longitude = coords.lng
            }
          }
        }

        const listing: Partial<Listing> = {
          source: 'yad2',
          source_id: String(item.id),
          source_url: `https://www.yad2.co.il/item/${item.link_token || item.id}`,
          listing_type: listingType,
          property_type: mapPropertyType(item.PropertyType_text),

          city: item.city || 'Inconnu',
          neighborhood: item.neighborhood || null,
          street: item.street || null,
          address_full: [item.street, item.neighborhood, item.city].filter(Boolean).join(', ') || null,
          latitude,
          longitude,

          price: parsePrice(item.price),
          currency: 'ILS',
          rooms: parseRooms(roomsText),
          floor: parseFloor(floorText),
          total_floors: parseFloor(item.TotalFloor_text),
          size_sqm: parseSqm(sqmText),
          balcony_sqm: parseSqm(item.Balcony_text),
          parking: hasBooleanFeature(item.Parking_text),
          elevator: hasBooleanFeature(item.Elevator_text),
          air_conditioning: hasBooleanFeature(item.AirConditioner_text),
          furnished: hasBooleanFeature(item.Furniture_text),

          entry_date: item.EntranceDate_text || null,
          published_at: item.date_added || item.date || null,
          scraped_at: new Date().toISOString(),

          title: [item.title_1, item.title_2].filter(Boolean).join(' — ') || null,
          description: item.info_text || null,
          images: (item.images || []).map(img => img.src).filter(Boolean) as string[],
          contact_name: item.contact_name || null,

          is_active: true,
        }

        listings.push(listing)
      }

      // Respecter le rate limit
      if (page < maxPages) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    } catch (err) {
      errors.push(`Yad2 page ${page}: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return { listings, errors }
}

/**
 * Scrape Yad2 pour toutes les villes principales.
 */
export async function scrapeYad2All(
  listingType: ListingType = 'rent',
  maxPagesPerCity: number = 2
): Promise<ScrapingResult> {
  const startTime = Date.now()
  const allListings: Partial<Listing>[] = []
  const allErrors: string[] = []

  // Scraper sans filtre de ville pour obtenir le maximum d'annonces
  const { listings, errors } = await scrapeYad2(listingType, undefined, maxPagesPerCity)
  allListings.push(...listings)
  allErrors.push(...errors)

  return {
    source: 'yad2',
    total_scraped: allListings.length,
    new_listings: 0,  // Sera mis a jour apres insertion en DB
    updated_listings: 0,
    errors: allErrors,
    duration_ms: Date.now() - startTime,
  }
}
