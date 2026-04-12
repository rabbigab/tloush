// =====================================================
// Scraper Facebook Groups — Annonces immobilieres
// =====================================================
// Utilise Playwright pour scraper les groupes Facebook publics
// d'annonces immobilieres en Israel.
//
// Groupes cibles (publics, francophones + hebreux):
// - Appartements a louer Tel Aviv
// - Dirot lehaskara (דירות להשכרה)
// - Francophones en Israel - immobilier

import type { Browser, Page } from 'playwright-core'
import type { Listing, ScrapingResult } from '@/types/listings'
import { geocodeAddress, geocodeCity } from './geocode'

// Dynamic imports pour eviter le bundling webpack
// @sparticuz/chromium fournit un binaire Chromium compatible Vercel/Lambda
async function launchBrowser(): Promise<Browser> {
  const chromium = (await import('@sparticuz/chromium')).default
  const pw = await import('playwright-core')

  // En production (Vercel), utiliser le binaire @sparticuz/chromium
  // En local, utiliser le Chromium installe par Playwright
  const executablePath = await chromium.executablePath()

  return pw.chromium.launch({
    args: chromium.args,
    executablePath,
    headless: true,
  })
}

// Groupes Facebook publics d'immobilier en Israel
const FACEBOOK_GROUPS = [
  {
    id: 'apartments.telaviv',
    name: 'Apartments in Tel Aviv',
    url: 'https://www.facebook.com/groups/apartments.telaviv',
    defaultCity: 'Tel Aviv',
  },
  {
    id: 'dira.lehaskara.tlv',
    name: 'דירות להשכרה תל אביב',
    url: 'https://www.facebook.com/groups/dira.lehaskara.tlv',
    defaultCity: 'Tel Aviv',
  },
  {
    id: 'franceisrael.immo',
    name: 'Francophones Israel Immobilier',
    url: 'https://www.facebook.com/groups/franceisrael.immo',
    defaultCity: null,
  },
  {
    id: 'jerusalem.apartments',
    name: 'Jerusalem Apartments',
    url: 'https://www.facebook.com/groups/jerusalem.apartments',
    defaultCity: 'Jerusalem',
  },
]

// Patterns pour extraire les infos des posts Facebook
const PRICE_REGEX = /(\d[\d,.']*)\s*(?:₪|шекел|шек|NIS|ILS|ש"ח|שח)/i
const PRICE_USD_REGEX = /\$\s*(\d[\d,.']*)|(\d[\d,.']*)\s*(?:USD|\$|dollars?)/i
const ROOMS_REGEX = /(\d(?:[.,]\d)?)\s*(?:חדרים|חד׳|rooms?|pieces?|chambres?|pi[eè]ces?)/i
const SQM_REGEX = /(\d+)\s*(?:מ"ר|מר|sqm|m2|m²|metres?)/i
const FLOOR_REGEX = /(?:קומה|floor|etage|étage)\s*(\d+)/i
const PHONE_REGEX = /(0[0-9]{1,2}[-.\s]?\d{3}[-.\s]?\d{4}|05\d[-.\s]?\d{3}[-.\s]?\d{4}|\+972[-.\s]?\d{1,2}[-.\s]?\d{3}[-.\s]?\d{4})/

// Villes israeliennes pour detection dans le texte
const CITY_PATTERNS = [
  { pattern: /תל[- ]?אביב|tel[- ]?aviv/i, city: 'Tel Aviv' },
  { pattern: /ירושלים|jerusalem|j[eé]rusalem/i, city: 'Jerusalem' },
  { pattern: /חיפה|haifa|ha[ïi]fa/i, city: 'Haifa' },
  { pattern: /באר[- ]?שבע|beer[- ]?sheva|beer[- ]?sheba/i, city: 'Beer Sheva' },
  { pattern: /נתניה|netanya|n[eé]tanya/i, city: 'Netanya' },
  { pattern: /רעננה|raanana|ra'?anana/i, city: "Ra'anana" },
  { pattern: /הרצליה|herzliya|hertzlia/i, city: 'Herzliya' },
  { pattern: /אשדוד|ashdod/i, city: 'Ashdod' },
  { pattern: /ראשון[- ]?לציון|rishon/i, city: 'Rishon LeZion' },
  { pattern: /פתח[- ]?תקווה|petah[- ]?tikva/i, city: 'Petah Tikva' },
  { pattern: /רמת[- ]?גן|ramat[- ]?gan/i, city: 'Ramat Gan' },
  { pattern: /גבעתיים|givatayim/i, city: 'Givatayim' },
  { pattern: /כפר[- ]?סבא|kfar[- ]?saba/i, city: 'Kfar Saba' },
  { pattern: /מודיעין|modiin|modi'?in/i, city: "Modi'in" },
  { pattern: /רחובות|rehovot/i, city: 'Rehovot' },
  { pattern: /חולון|holon/i, city: 'Holon' },
  { pattern: /בת[- ]?ים|bat[- ]?yam/i, city: 'Bat Yam' },
  { pattern: /אשקלון|ashkelon/i, city: 'Ashkelon' },
]

function detectCity(text: string): string | null {
  for (const { pattern, city } of CITY_PATTERNS) {
    if (pattern.test(text)) return city
  }
  return null
}

function extractPrice(text: string): { price: number | null; currency: 'ILS' | 'USD' | 'EUR' } {
  const ilsMatch = text.match(PRICE_REGEX)
  if (ilsMatch) {
    const num = parseInt(ilsMatch[1].replace(/[,.']/g, ''), 10)
    if (!isNaN(num)) return { price: num, currency: 'ILS' }
  }

  const usdMatch = text.match(PRICE_USD_REGEX)
  if (usdMatch) {
    const raw = usdMatch[1] || usdMatch[2]
    const num = parseInt(raw.replace(/[,.']/g, ''), 10)
    if (!isNaN(num)) return { price: num, currency: 'USD' }
  }

  return { price: null, currency: 'ILS' }
}

function extractNumber(text: string, regex: RegExp): number | null {
  const match = text.match(regex)
  if (!match) return null
  const num = parseFloat(match[1].replace(',', '.'))
  return isNaN(num) ? null : num
}

function extractPhone(text: string): string | null {
  const match = text.match(PHONE_REGEX)
  return match ? match[1] : null
}

interface FacebookPost {
  id: string
  author: string
  text: string
  timestamp: string | null
  images: string[]
  url: string
}

/**
 * Scrape les posts d'un groupe Facebook public avec Playwright.
 */
async function scrapeGroupPosts(
  browser: Browser,
  groupUrl: string,
  maxScrolls: number = 5
): Promise<FacebookPost[]> {
  const page: Page = await browser.newPage()
  const posts: FacebookPost[] = []

  try {
    // Naviguer vers le groupe (mode non connecte)
    await page.goto(groupUrl, { waitUntil: 'networkidle', timeout: 30000 })

    // Attendre le contenu
    await page.waitForTimeout(3000)

    // Fermer les popups de connexion eventuels
    try {
      const closeBtn = page.locator('[aria-label="Close"], [aria-label="Fermer"]').first()
      if (await closeBtn.isVisible({ timeout: 2000 })) {
        await closeBtn.click()
      }
    } catch {
      // Pas de popup, continuer
    }

    // Scroll pour charger plus de posts
    for (let i = 0; i < maxScrolls; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2))
      await page.waitForTimeout(2000)
    }

    // Extraire les posts
    const postElements = await page.locator('[role="article"]').all()

    for (const el of postElements) {
      try {
        const text = await el.innerText().catch(() => '')
        if (!text || text.length < 20) continue

        // Extraire les images
        const imgElements = await el.locator('img[src*="scontent"]').all()
        const images: string[] = []
        for (const img of imgElements) {
          const src = await img.getAttribute('src')
          if (src && !src.includes('emoji')) images.push(src)
        }

        // Extraire l'auteur
        const authorEl = el.locator('h3 a, h4 a, [data-ad-preview="message"] a').first()
        const author = await authorEl.innerText().catch(() => 'Inconnu')

        // Generer un ID unique a partir du contenu
        const hash = text.slice(0, 100).replace(/\s/g, '').slice(0, 50)
        const id = `fb_${Buffer.from(hash).toString('base64').slice(0, 20)}`

        posts.push({
          id,
          author,
          text,
          timestamp: null,
          images,
          url: groupUrl,
        })
      } catch {
        continue
      }
    }
  } catch (err) {
    console.error(`Erreur scraping groupe ${groupUrl}:`, err)
  } finally {
    await page.close()
  }

  return posts
}

/**
 * Convertit un post Facebook en listing normalise.
 */
async function postToListing(
  post: FacebookPost,
  defaultCity: string | null
): Promise<Partial<Listing> | null> {
  const text = post.text

  // Detecter la ville
  const city = detectCity(text) || defaultCity
  if (!city) return null // Impossible de localiser

  // Extraire les infos
  const { price, currency } = extractPrice(text)
  const rooms = extractNumber(text, ROOMS_REGEX)
  const sqm = extractNumber(text, SQM_REGEX)
  const floor = extractNumber(text, FLOOR_REGEX)
  const phone = extractPhone(text)

  // Determiner si location ou vente
  const isForSale = /(?:למכירה|for sale|a vendre|[àa] vendre|vente)/i.test(text)
  const listingType = isForSale ? 'sale' : 'rent'

  // Geocoder
  let latitude: number | null = null
  let longitude: number | null = null
  const cityCoords = geocodeCity(city)
  if (cityCoords) {
    latitude = cityCoords.lat
    longitude = cityCoords.lng
  }

  // Trouver une adresse de rue dans le texte
  const streetMatch = text.match(/(?:רחוב|רח׳|rue)\s+([\u0590-\u05FF\w\s]+)/i)
  const street = streetMatch ? streetMatch[1].trim() : null
  if (street && city) {
    const coords = await geocodeAddress(street, city)
    if (coords) {
      latitude = coords.lat
      longitude = coords.lng
    }
  }

  return {
    source: 'facebook',
    source_id: post.id,
    source_url: post.url,
    listing_type: listingType,
    property_type: 'apartment', // Default, difficile a detecter dans un post FB

    city,
    neighborhood: null,
    street,
    address_full: [street, city].filter(Boolean).join(', ') || city,
    latitude,
    longitude,

    price,
    currency,
    rooms,
    floor,
    total_floors: null,
    size_sqm: sqm,
    balcony_sqm: null,
    parking: /parking|חניה/i.test(text) ? true : null,
    elevator: /(?:elevator|מעלית|ascenseur)/i.test(text) ? true : null,
    air_conditioning: /(?:מזגן|clim|air.?con)/i.test(text) ? true : null,
    furnished: /(?:מרוהבת|meublé|furnished|רהיטים)/i.test(text) ? true : null,

    entry_date: null,
    published_at: post.timestamp,
    scraped_at: new Date().toISOString(),

    title: text.slice(0, 120).replace(/\n/g, ' '),
    description: text.slice(0, 2000),
    images: post.images,
    contact_name: post.author,
    contact_phone: phone,

    is_active: true,
  }
}

/**
 * Scrape tous les groupes Facebook configures.
 * Necessite un navigateur Chromium installe (via Playwright).
 */
export async function scrapeFacebook(
  maxScrollsPerGroup: number = 3
): Promise<{ listings: Partial<Listing>[]; errors: string[] }> {
  const listings: Partial<Listing>[] = []
  const errors: string[] = []

  let browser: Browser | null = null

  try {
    // Lancer le navigateur (compatible Vercel serverless)
    browser = await launchBrowser()

    for (const group of FACEBOOK_GROUPS) {
      try {
        const posts = await scrapeGroupPosts(browser, group.url, maxScrollsPerGroup)

        for (const post of posts) {
          const listing = await postToListing(post, group.defaultCity)
          if (listing) {
            listings.push(listing)
          }
        }

        // Pause entre les groupes
        await new Promise(resolve => setTimeout(resolve, 3000))
      } catch (err) {
        errors.push(`Facebook ${group.name}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }
  } catch (err) {
    errors.push(`Playwright launch: ${err instanceof Error ? err.message : 'Unknown error'}`)
  } finally {
    if (browser) {
      await browser.close()
    }
  }

  return { listings, errors }
}

/**
 * Scrape Facebook et retourne un resume.
 */
export async function scrapeFacebookAll(): Promise<ScrapingResult> {
  const startTime = Date.now()
  const { listings, errors } = await scrapeFacebook()

  return {
    source: 'facebook',
    total_scraped: listings.length,
    new_listings: 0,
    updated_listings: 0,
    errors,
    duration_ms: Date.now() - startTime,
  }
}
