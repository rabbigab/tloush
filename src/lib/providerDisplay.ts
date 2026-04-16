/**
 * Helpers d'affichage des noms de prestataires dans l'annuaire.
 *
 * Motivation (audit technical-mapping #14) : la DB `providers` contient
 * des noms saisis par les prestataires eux-memes, parfois en minuscules
 * ("benjamin", "lellouche"), parfois en majuscules ("LELLOUCHE"), avec
 * ou sans accents. Sans normalisation, les affichages produisaient
 * "Benjamin l." au lieu de "Benjamin L." et d'autres incoherences.
 *
 * Ces helpers garantissent un affichage coherent partout (fiches,
 * cartes, JSON-LD schema, meta titles, APIs).
 */

/**
 * Capitalise la premiere lettre de chaque mot. Gere les noms composes
 * separes par espace ou tiret. Preserve les particules minuscules
 * ("de", "du", "van") si elles sont en milieu de chaine.
 *
 * Exemples :
 *   toTitleCase("lellouche")      -> "Lellouche"
 *   toTitleCase("LELLOUCHE")      -> "Lellouche"
 *   toTitleCase("jean-luc")       -> "Jean-Luc"
 *   toTitleCase("jean de la tour") -> "Jean de la Tour"
 */
export function toTitleCase(name: string | null | undefined): string {
  if (!name) return ''
  const lowered = name.trim().toLowerCase()
  if (!lowered) return ''
  return lowered
    .split(/(\s|-)/)
    .map((part, idx, arr) => {
      if (part === ' ' || part === '-') return part
      if (part.length === 0) return part
      // Particules francaises conservees en minuscules au milieu du nom
      const isParticle = ['de', 'du', 'des', 'la', 'le', 'les', 'van', 'von', 'el', 'al'].includes(part)
      const isFirstWord = idx === 0 || arr.slice(0, idx).every((p) => p === ' ' || p === '-' || p === '')
      if (isParticle && !isFirstWord) return part
      return part[0].toUpperCase() + part.slice(1)
    })
    .join('')
}

/**
 * Normalise un prenom (capitalisation propre).
 */
export function normalizeFirstName(firstName: string | null | undefined): string {
  return toTitleCase(firstName)
}

/**
 * Renvoie l'initiale du nom en majuscule, suivie d'un point.
 * Exemple : "lellouche" -> "L.", "L" -> "L.", "" -> "".
 */
export function normalizeLastInitial(lastName: string | null | undefined): string {
  if (!lastName) return ''
  const trimmed = lastName.trim()
  if (!trimmed) return ''
  return `${trimmed.charAt(0).toUpperCase()}.`
}

/**
 * Renvoie le nom d'affichage public d'un prestataire :
 * "Prenom L." avec capitalisation normalisee.
 *
 * Utilise par tous les rendus publics (cartes, fiches, JSON-LD).
 */
export function getProviderDisplayName(provider: {
  first_name: string | null | undefined
  last_name: string | null | undefined
}): string {
  const firstName = normalizeFirstName(provider.first_name)
  const lastInitial = normalizeLastInitial(provider.last_name)
  if (!firstName && !lastInitial) return 'Prestataire'
  if (!lastInitial) return firstName
  return `${firstName} ${lastInitial}`
}

/**
 * Renvoie l'initiale du prenom normalisee, pour les avatars et placeholders.
 * Exemple : "benjamin" -> "B", "" -> "?".
 */
export function getProviderInitial(firstName: string | null | undefined): string {
  const normalized = normalizeFirstName(firstName)
  if (!normalized) return '?'
  return normalized.charAt(0)
}
