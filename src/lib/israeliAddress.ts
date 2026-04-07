/**
 * Israeli Address Validation & Autocomplete
 *
 * Validates Israeli addresses, mikud (postal codes), and provides
 * city/street data for form autocomplete.
 */

// Major Israeli cities with mikud ranges and Hebrew names
export const ISRAELI_CITIES: { name_fr: string; name_he: string; name_en: string; mikudPrefix: string[] }[] = [
  { name_fr: 'Jerusalem', name_he: 'ירושלים', name_en: 'Jerusalem', mikudPrefix: ['91', '93', '94', '95', '96', '97'] },
  { name_fr: 'Tel Aviv', name_he: 'תל אביב-יפו', name_en: 'Tel Aviv-Yafo', mikudPrefix: ['61', '62', '63', '64', '65', '66', '67', '68', '69'] },
  { name_fr: 'Haifa', name_he: 'חיפה', name_en: 'Haifa', mikudPrefix: ['31', '32', '33', '34', '35'] },
  { name_fr: "Be'er Sheva", name_he: 'באר שבע', name_en: 'Beer Sheva', mikudPrefix: ['84'] },
  { name_fr: 'Netanya', name_he: 'נתניה', name_en: 'Netanya', mikudPrefix: ['42'] },
  { name_fr: 'Ashdod', name_he: 'אשדוד', name_en: 'Ashdod', mikudPrefix: ['77'] },
  { name_fr: 'Rishon LeZion', name_he: 'ראשון לציון', name_en: 'Rishon LeZion', mikudPrefix: ['75'] },
  { name_fr: 'Petah Tikva', name_he: 'פתח תקווה', name_en: 'Petah Tikva', mikudPrefix: ['49'] },
  { name_fr: 'Holon', name_he: 'חולון', name_en: 'Holon', mikudPrefix: ['58'] },
  { name_fr: 'Bat Yam', name_he: 'בת ים', name_en: 'Bat Yam', mikudPrefix: ['59'] },
  { name_fr: 'Ramat Gan', name_he: 'רמת גן', name_en: 'Ramat Gan', mikudPrefix: ['52'] },
  { name_fr: 'Ashkelon', name_he: 'אשקלון', name_en: 'Ashkelon', mikudPrefix: ['78'] },
  { name_fr: 'Herzliya', name_he: 'הרצליה', name_en: 'Herzliya', mikudPrefix: ['46'] },
  { name_fr: 'Kfar Saba', name_he: 'כפר סבא', name_en: 'Kfar Saba', mikudPrefix: ['44'] },
  { name_fr: "Ra'anana", name_he: 'רעננה', name_en: "Ra'anana", mikudPrefix: ['43'] },
  { name_fr: 'Raanana', name_he: 'רעננה', name_en: "Ra'anana", mikudPrefix: ['43'] },
  { name_fr: 'Rehovot', name_he: 'רחובות', name_en: 'Rehovot', mikudPrefix: ['76'] },
  { name_fr: 'Hadera', name_he: 'חדרה', name_en: 'Hadera', mikudPrefix: ['38'] },
  { name_fr: 'Modiin', name_he: "מודיעין-מכבים-רעות", name_en: "Modi'in-Maccabim-Re'ut", mikudPrefix: ['71'] },
  { name_fr: 'Nazareth', name_he: 'נצרת', name_en: 'Nazareth', mikudPrefix: ['16'] },
  { name_fr: 'Eilat', name_he: 'אילת', name_en: 'Eilat', mikudPrefix: ['88'] },
  { name_fr: 'Acre (Akko)', name_he: 'עכו', name_en: 'Akko', mikudPrefix: ['24'] },
  { name_fr: 'Tiberiade', name_he: 'טבריה', name_en: 'Tiberias', mikudPrefix: ['14'] },
]

/**
 * Validate Israeli mikud (postal code) — 7 digits
 */
export function validateMikud(input: string): { valid: boolean; formatted: string; city?: string; error?: string } {
  const cleaned = input.replace(/\D/g, '')

  if (cleaned.length !== 7) {
    return { valid: false, formatted: input, error: 'Le mikud israelien contient exactement 7 chiffres' }
  }

  const prefix = cleaned.slice(0, 2)
  const city = ISRAELI_CITIES.find(c => c.mikudPrefix.includes(prefix))

  return {
    valid: true,
    formatted: cleaned,
    city: city?.name_fr,
  }
}

/**
 * Search cities by name (FR, HE, or EN)
 */
export function searchCity(query: string): typeof ISRAELI_CITIES {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return ISRAELI_CITIES.filter(
    c =>
      c.name_fr.toLowerCase().includes(q) ||
      c.name_en.toLowerCase().includes(q) ||
      c.name_he.includes(q)
  ).slice(0, 10)
}

/**
 * Transliterate common Hebrew street prefixes to French
 */
export function transliterateStreet(hebrewStreet: string): string {
  const prefixes: [string, string][] = [
    ['רח\'', 'Rue'],
    ['רחוב', 'Rue'],
    ['שד\'', 'Blvd.'],
    ['שדרות', 'Boulevard'],
    ['דרך', 'Route'],
    ['ככר', 'Place'],
    ['סמטה', 'Ruelle'],
    ['מעלה', 'Montee'],
  ]

  for (const [he, fr] of prefixes) {
    if (hebrewStreet.startsWith(he)) {
      return `${fr} ${hebrewStreet.slice(he.length).trim()}`
    }
  }
  return hebrewStreet
}

export interface IsraeliAddress {
  street?: string
  number?: string
  apartment?: string
  city: string
  mikud?: string
}

/**
 * Format an Israeli address for display
 */
export function formatAddress(addr: IsraeliAddress, lang: 'fr' | 'he' = 'fr'): string {
  const parts: string[] = []
  if (addr.street) {
    let street = addr.street
    if (lang === 'fr') street = transliterateStreet(street)
    parts.push(addr.number ? `${street} ${addr.number}` : street)
  }
  if (addr.apartment) parts.push(`Apt. ${addr.apartment}`)
  parts.push(addr.city)
  if (addr.mikud) parts.push(addr.mikud)
  parts.push('Israel')
  return parts.join(', ')
}
