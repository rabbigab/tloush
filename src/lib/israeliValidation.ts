/**
 * Israeli Field Validation Utilities
 *
 * Validates common Israeli identifiers: Teudat Zehut, phone numbers,
 * bank account numbers, and company numbers.
 */

/**
 * Validate Israeli Teudat Zehut (ID number)
 * Uses the Luhn-like algorithm specific to Israeli IDs
 */
export function validateTZ(input: string): { valid: boolean; formatted: string; error?: string } {
  const cleaned = input.replace(/\D/g, '')

  if (cleaned.length === 0) {
    return { valid: false, formatted: input, error: 'Numero requis' }
  }

  // Pad to 9 digits
  const padded = cleaned.padStart(9, '0')

  if (padded.length !== 9) {
    return { valid: false, formatted: input, error: 'Le numero doit contenir 9 chiffres' }
  }

  // Israeli ID check digit algorithm
  let sum = 0
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(padded[i]) * ((i % 2) + 1)
    if (digit > 9) digit -= 9
    sum += digit
  }

  if (sum % 10 !== 0) {
    return { valid: false, formatted: padded, error: 'Numero de Teudat Zehut invalide (chiffre de controle incorrect)' }
  }

  return { valid: true, formatted: padded }
}

/**
 * Validate and format Israeli phone number
 * Supports mobile (05X) and landline (02-09) formats
 */
export function validatePhone(input: string): { valid: boolean; formatted: string; international: string; type: 'mobile' | 'landline' | 'unknown'; error?: string } {
  let cleaned = input.replace(/[\s\-\(\)\.]/g, '')

  // Handle +972 prefix
  if (cleaned.startsWith('+972')) {
    cleaned = '0' + cleaned.slice(4)
  } else if (cleaned.startsWith('972')) {
    cleaned = '0' + cleaned.slice(3)
  }

  // Remove leading zeros beyond the area code
  if (cleaned.length === 0) {
    return { valid: false, formatted: input, international: '', type: 'unknown', error: 'Numero requis' }
  }

  // Mobile: 05X-XXXXXXX (10 digits)
  const mobileMatch = cleaned.match(/^(05[0-9])(\d{7})$/)
  if (mobileMatch) {
    const formatted = `${mobileMatch[1]}-${mobileMatch[2].slice(0, 3)}-${mobileMatch[2].slice(3)}`
    const international = `+972-${mobileMatch[1].slice(1)}-${mobileMatch[2].slice(0, 3)}-${mobileMatch[2].slice(3)}`
    return { valid: true, formatted, international, type: 'mobile' }
  }

  // Landline: 0X-XXXXXXX (9 digits) or 0XX-XXXXXXX (10 digits)
  const landline9 = cleaned.match(/^(0[2-9])(\d{7})$/)
  if (landline9) {
    const formatted = `${landline9[1]}-${landline9[2]}`
    const international = `+972-${landline9[1].slice(1)}-${landline9[2]}`
    return { valid: true, formatted, international, type: 'landline' }
  }

  const landline10 = cleaned.match(/^(07[2-9])(\d{7})$/)
  if (landline10) {
    const formatted = `${landline10[1]}-${landline10[2]}`
    const international = `+972-${landline10[1].slice(1)}-${landline10[2]}`
    return { valid: true, formatted, international, type: 'mobile' }
  }

  return { valid: false, formatted: input, international: '', type: 'unknown', error: 'Format de telephone israelien invalide. Attendu: 05X-XXXXXXX ou 0X-XXXXXXX' }
}

/**
 * Validate Israeli bank account format
 */
export function validateBankAccount(bankCode: string, branchCode: string, accountNumber: string): { valid: boolean; error?: string } {
  const VALID_BANKS: Record<string, string> = {
    '10': 'Leumi',
    '11': 'Discount',
    '12': 'Hapoalim',
    '13': 'Igud (Union)',
    '14': 'Otsar HaHayal',
    '17': 'Mercantile',
    '20': 'Mizrahi-Tefahot',
    '31': 'International (FIBI)',
    '46': 'Massad',
    '52': 'Poalei Agudat Israel',
    '54': 'Yerushalayim',
    '68': 'Dexia',
    '09': 'HaDoar (Postal)',
  }

  const cleanBank = bankCode.replace(/\D/g, '').padStart(2, '0')
  const cleanBranch = branchCode.replace(/\D/g, '')
  const cleanAccount = accountNumber.replace(/\D/g, '')

  if (!VALID_BANKS[cleanBank]) {
    return { valid: false, error: `Code banque inconnu (${cleanBank}). Banques connues: ${Object.entries(VALID_BANKS).map(([c, n]) => `${c}=${n}`).join(', ')}` }
  }

  if (cleanBranch.length < 2 || cleanBranch.length > 4) {
    return { valid: false, error: 'Le numero de succursale doit contenir 2 a 4 chiffres' }
  }

  if (cleanAccount.length < 4 || cleanAccount.length > 9) {
    return { valid: false, error: 'Le numero de compte doit contenir 4 a 9 chiffres' }
  }

  return { valid: true }
}

/**
 * Format Israeli currency
 */
export function formatILS(amount: number, showSymbol = true): string {
  const formatted = amount.toLocaleString('he-IL', { maximumFractionDigits: 0 })
  return showSymbol ? `${formatted}₪` : formatted
}

/**
 * Validate Israeli company number (H.P. / ח.פ.)
 */
export function validateCompanyNumber(input: string): { valid: boolean; formatted: string; type: string; error?: string } {
  const cleaned = input.replace(/\D/g, '')

  if (cleaned.length === 9) {
    return {
      valid: true,
      formatted: cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3'),
      type: 'Hevra (ח.פ.)',
    }
  }

  if (cleaned.length === 8) {
    return {
      valid: true,
      formatted: cleaned.replace(/(\d{2})(\d{3})(\d{3})/, '$1-$2-$3'),
      type: 'Osek/Amuta',
    }
  }

  return { valid: false, formatted: input, type: 'Inconnu', error: '9 chiffres pour une societe, 8 pour un Osek/Amuta' }
}
