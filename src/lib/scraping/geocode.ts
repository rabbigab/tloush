// =====================================================
// Geocoding — Nominatim (OpenStreetMap) — 100% gratuit
// =====================================================
// Limite: 1 requete/seconde (politique Nominatim)

import { ISRAELI_CITIES } from '@/types/listings'

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const RATE_LIMIT_MS = 1100 // 1.1s entre chaque requete

let lastRequestTime = 0

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS - timeSinceLastRequest))
  }
  lastRequestTime = Date.now()
  return fetch(url, {
    headers: { 'User-Agent': 'Tloush-Immo/1.0 (https://tloush.com)' },
  })
}

/**
 * Geocode une adresse israelienne en coordonnees lat/lng.
 * Utilise Nominatim (OpenStreetMap) — gratuit, pas de cle API.
 */
export async function geocodeAddress(
  address: string,
  city: string
): Promise<{ lat: number; lng: number } | null> {
  // D'abord essayer avec l'adresse complete
  const query = `${address}, ${city}, Israel`

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      countrycodes: 'il',
      limit: '1',
    })

    const res = await rateLimitedFetch(`${NOMINATIM_URL}?${params}`)
    if (!res.ok) return null

    const results: NominatimResult[] = await res.json()
    if (results.length > 0) {
      return {
        lat: parseFloat(results[0].lat),
        lng: parseFloat(results[0].lon),
      }
    }

    // Fallback: essayer juste la ville
    return geocodeCity(city)
  } catch {
    return geocodeCity(city)
  }
}

/**
 * Retourne les coordonnees d'une ville connue (cache local).
 * Evite d'appeler Nominatim pour les villes principales.
 */
export function geocodeCity(cityName: string): { lat: number; lng: number } | null {
  const normalized = cityName.trim().toLowerCase()

  const match = ISRAELI_CITIES.find(
    c =>
      c.name.toLowerCase() === normalized ||
      c.nameHe === cityName.trim() ||
      c.slug === normalized.replace(/\s+/g, '-')
  )

  if (match) {
    return { lat: match.lat, lng: match.lng }
  }

  return null
}

/**
 * Geocode en batch avec respect du rate limit.
 */
export async function geocodeBatch(
  items: Array<{ address: string; city: string }>
): Promise<Array<{ lat: number; lng: number } | null>> {
  const results: Array<{ lat: number; lng: number } | null> = []

  for (const item of items) {
    // D'abord tenter le cache local par ville
    const cityCoords = geocodeCity(item.city)
    if (!item.address && cityCoords) {
      results.push(cityCoords)
      continue
    }

    const coords = await geocodeAddress(item.address, item.city)
    results.push(coords)
  }

  return results
}
