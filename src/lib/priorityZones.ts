// =====================================================
// Zones de priorité nationale (Misrad HaPnim / Tax Authority)
// =====================================================
// Seed list des localités les plus fréquemment concernées par les
// aides liées au `city_priority_zone` (crédits fiscaux périphérie,
// baremes arnona majorés).
//
// Source : liste officielle des zones de priorité nationale
// (https://www.gov.il/he/departments/general/national-priority-areas)
// et liste des yeshuvim périphériques du Ministère des Finances.
//
// ⚠️ Liste non-exhaustive : en cas de ville absente, le helper renvoie
// null et l'utilisateur doit sélectionner manuellement dans le formulaire.
// À compléter progressivement avec les cas signalés par les utilisateurs.

import type { CityPriorityZone } from '@/types/userProfile'

/**
 * Table de correspondance ville (nom FR + nom HE fréquent) → zone.
 * Les clés sont normalisées (lowercase + trim).
 */
const CITY_ZONE_MAP: Record<string, CityPriorityZone> = {
  // Zone A — Negev/Galil éloignés, Eilat
  'eilat': 'a',
  'אילת': 'a',
  'kiryat shmona': 'a',
  'קריית שמונה': 'a',
  'tzfat': 'a',
  'safed': 'a',
  'צפת': 'a',
  'beersheva': 'a',
  'beer sheva': 'a',
  'באר שבע': 'a',
  'dimona': 'a',
  'דימונה': 'a',
  'sderot': 'a',
  'שדרות': 'a',
  'arad': 'a',
  'ערד': 'a',
  'mitzpe ramon': 'a',
  'מצפה רמון': 'a',
  'yerukham': 'a',
  'ירוחם': 'a',
  'ofakim': 'a',
  'אופקים': 'a',
  'netivot': 'a',
  'נתיבות': 'a',
  'kiryat gat': 'a',
  'קריית גת': 'a',
  'karmiel': 'a',
  'כרמיאל': 'a',
  'maalot tarshiha': 'a',
  'maalot': 'a',
  'מעלות תרשיחא': 'a',
  'akko': 'a',
  'acre': 'a',
  'עכו': 'a',
  'nahariya': 'a',
  'נהריה': 'a',

  // Zone B — périphérie intermédiaire
  'tiberias': 'b',
  'tverya': 'b',
  'טבריה': 'b',
  'afula': 'b',
  'עפולה': 'b',
  'beit shean': 'b',
  'בית שאן': 'b',
  'ashkelon': 'b',
  'ashqelon': 'b',
  'אשקלון': 'b',
  'lod': 'b',
  'לוד': 'b',
  'ramla': 'b',
  'ramle': 'b',
  'רמלה': 'b',

  // Zone C — zones limitrophes ou à priorité faible
  'hadera': 'c',
  'חדרה': 'c',
}

function normalize(city: string): string {
  return city.trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * Renvoie la zone de priorité nationale d'une ville, ou null si inconnue.
 * Matching tolérant à la casse et aux accents/espaces multiples.
 */
export function inferPriorityZoneFromCity(city: string | null | undefined): CityPriorityZone | null {
  if (!city) return null
  const key = normalize(city)
  return CITY_ZONE_MAP[key] ?? null
}
