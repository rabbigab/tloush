/**
 * Israeli Bank CSV/Excel Import Parser
 *
 * Parses transaction exports from major Israeli banks.
 * Supports: Hapoalim, Leumi, Discount, Mizrahi-Tefahot, and generic formats.
 */

export interface BankTransaction {
  date: string        // YYYY-MM-DD
  description: string
  amount: number      // positive = credit, negative = debit
  balance?: number
  reference?: string
  category?: string   // auto-categorized
}

export interface ParseResult {
  success: boolean
  transactions: BankTransaction[]
  bankDetected: string
  error?: string
  stats: {
    totalTransactions: number
    dateRange: { from: string; to: string }
    totalIncome: number
    totalExpenses: number
    netFlow: number
  }
}

// ─── Category auto-detection ───

const CATEGORY_PATTERNS: [RegExp, string][] = [
  // Salary
  [/משכורת|salary|שכר|maskoret/i, 'salary'],
  [/ביטוח לאומי|bituach leumi|national insurance/i, 'bituach_leumi'],

  // Housing
  [/שכר דירה|rent|שכ"ד|דמי שכירות/i, 'rent'],
  [/ארנונה|arnona|municipal/i, 'arnona'],
  [/חשמל|electric|חברת חשמל|iec/i, 'electricity'],
  [/מים|water|מקורות|mekorot/i, 'water'],
  [/גז|gas|SuperGaz|AmeriGas/i, 'gas'],
  [/ועד בית|vaad|building committee/i, 'vaad_bayit'],

  // Telecom
  [/סלקום|cellcom|פלאפון|pelephone|פרטנר|partner|הוט|hot mobile|גולן|golan|012|019|018/i, 'telecom'],
  [/אינטרנט|internet|בזק|bezeq|yes/i, 'internet'],

  // Transport
  [/רב קו|rav kav|אגד|egged|דן|dan|רכבת|israel railways|train|sonol|paz|delek|fuel|דלק/i, 'transport'],
  [/מונית|taxi|gett|yango/i, 'transport'],

  // Food
  [/שופרסל|shufersal|רמי לוי|rami levy|יוחננוף|yochananof|מגא|mega|ויקטורי|victory|am:pm|tiv taam|osher ad/i, 'groceries'],
  [/מסעדה|restaurant|קפה|cafe|מקדונלד|mcdonalds|בורגר|burger|פיצה|pizza|סושי|sushi/i, 'restaurant'],

  // Health
  [/כללית|clalit|מכבי|maccabi|מאוחדת|meuhedet|לאומית|leumit|בית מרקחת|pharmacy|סופר פארם|super pharm/i, 'health'],

  // Shopping
  [/אמזון|amazon|aliexpress|ebay|paypal/i, 'online_shopping'],
  [/עזריאלי|azrieli|קניון|mall|h&m|zara|fox|castro|golf/i, 'shopping'],

  // Insurance
  [/ביטוח|insurance|הראל|harel|מגדל|migdal|כלל|clal|פניקס|phoenix|aig/i, 'insurance'],

  // Education
  [/גן|kindergarten|בית ספר|school|אוניברסיטה|university|מכון|college|חוגים/i, 'education'],

  // Bank fees
  [/עמלה|commission|fee|דמי ניהול|management fee/i, 'bank_fees'],

  // ATM
  [/כספומט|atm|משיכת מזומן|cash withdrawal/i, 'cash'],

  // Transfer
  [/העברה|transfer|bit|paybox/i, 'transfer'],
]

function categorize(description: string): string {
  for (const [pattern, category] of CATEGORY_PATTERNS) {
    if (pattern.test(description)) return category
  }
  return 'other'
}

// ─── Bank-specific parsers ───

function parseDate(dateStr: string): string {
  // Try DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, YYYY-MM-DD
  const ddmmyyyy = dateStr.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/)
  if (ddmmyyyy) {
    return `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`
  }
  const yyyymmdd = dateStr.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/)
  if (yyyymmdd) {
    return `${yyyymmdd[1]}-${yyyymmdd[2].padStart(2, '0')}-${yyyymmdd[3].padStart(2, '0')}`
  }
  return dateStr
}

function parseAmount(amountStr: string): number {
  // Remove currency symbols, commas, spaces
  const cleaned = amountStr.replace(/[₪,\s$€]/g, '').replace(/[()]/g, m => m === '(' ? '-' : '')
  return parseFloat(cleaned) || 0
}

/**
 * Parse CSV content into transactions
 */
export function parseBankCSV(csvContent: string, separator: string = ','): ParseResult {
  const lines = csvContent.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  if (lines.length < 2) {
    return { success: false, transactions: [], bankDetected: 'unknown', error: 'Fichier vide ou trop court', stats: { totalTransactions: 0, dateRange: { from: '', to: '' }, totalIncome: 0, totalExpenses: 0, netFlow: 0 } }
  }

  // Auto-detect separator if not comma
  const firstLine = lines[0]
  if (firstLine.includes('\t') && !firstLine.includes(',')) separator = '\t'
  else if (firstLine.split(';').length > firstLine.split(',').length) separator = ';'

  // Detect bank from headers
  const header = firstLine.toLowerCase()
  let bankDetected = 'generic'
  if (header.includes('תאריך') && header.includes('תיאור') && header.includes('סכום')) bankDetected = 'hapoalim'
  if (header.includes('date') && header.includes('description') && header.includes('amount')) bankDetected = 'generic_en'

  // Parse header to find column indices
  const headers = lines[0].split(separator).map(h => h.trim().replace(/"/g, '').toLowerCase())
  const dateCol = headers.findIndex(h => h.includes('תאריך') || h.includes('date') || h === 'תאריך ערך')
  const descCol = headers.findIndex(h => h.includes('תיאור') || h.includes('description') || h.includes('פרטים') || h.includes('details'))
  const amountCol = headers.findIndex(h => h.includes('סכום') || h.includes('amount') || h.includes('סה"כ'))
  const debitCol = headers.findIndex(h => h.includes('חובה') || h.includes('debit'))
  const creditCol = headers.findIndex(h => h.includes('זכות') || h.includes('credit'))
  const balanceCol = headers.findIndex(h => h.includes('יתרה') || h.includes('balance'))
  const refCol = headers.findIndex(h => h.includes('אסמכתא') || h.includes('reference') || h.includes('ref'))

  if (dateCol === -1 || (amountCol === -1 && debitCol === -1)) {
    return { success: false, transactions: [], bankDetected, error: 'Format non reconnu. Colonnes requises: date, description, montant. Assurez-vous d\'exporter au format CSV depuis votre banque.', stats: { totalTransactions: 0, dateRange: { from: '', to: '' }, totalIncome: 0, totalExpenses: 0, netFlow: 0 } }
  }

  const transactions: BankTransaction[] = []

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(separator).map(c => c.trim().replace(/^"|"$/g, ''))
    if (cols.length <= Math.max(dateCol, descCol, amountCol)) continue

    const dateRaw = cols[dateCol]
    if (!dateRaw || !/\d/.test(dateRaw)) continue // skip non-data rows

    let amount: number
    if (amountCol !== -1) {
      amount = parseAmount(cols[amountCol])
    } else {
      // Separate debit/credit columns
      const debit = debitCol !== -1 ? parseAmount(cols[debitCol]) : 0
      const credit = creditCol !== -1 ? parseAmount(cols[creditCol]) : 0
      amount = credit - debit
    }

    const description = descCol !== -1 ? cols[descCol] : ''
    const balance = balanceCol !== -1 ? parseAmount(cols[balanceCol]) : undefined
    const reference = refCol !== -1 ? cols[refCol] : undefined

    transactions.push({
      date: parseDate(dateRaw),
      description,
      amount,
      balance,
      reference,
      category: categorize(description),
    })
  }

  transactions.sort((a, b) => a.date.localeCompare(b.date))

  const totalIncome = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)

  return {
    success: true,
    transactions,
    bankDetected,
    stats: {
      totalTransactions: transactions.length,
      dateRange: {
        from: transactions[0]?.date || '',
        to: transactions[transactions.length - 1]?.date || '',
      },
      totalIncome,
      totalExpenses,
      netFlow: totalIncome - totalExpenses,
    },
  }
}

// ─── Category labels ───

export const CATEGORY_LABELS_FR: Record<string, string> = {
  salary: 'Salaire',
  bituach_leumi: 'Bituach Leumi',
  rent: 'Loyer',
  arnona: 'Arnona',
  electricity: 'Electricite',
  water: 'Eau',
  gas: 'Gaz',
  vaad_bayit: 'Vaad Bayit',
  telecom: 'Telecom / Mobile',
  internet: 'Internet',
  transport: 'Transport',
  groceries: 'Courses / Alimentation',
  restaurant: 'Restaurant / Cafe',
  health: 'Sante / Pharmacie',
  online_shopping: 'Achats en ligne',
  shopping: 'Shopping',
  insurance: 'Assurance',
  education: 'Education',
  bank_fees: 'Frais bancaires',
  cash: 'Retrait especes',
  transfer: 'Virement',
  other: 'Autre',
}
