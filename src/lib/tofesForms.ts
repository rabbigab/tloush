/**
 * Israeli Tax Form Pre-fill (Tofes 101, 106)
 *
 * Generates pre-filled data for common Israeli tax forms based on
 * information extracted from payslips and user profile.
 */

export interface Tofes101Input {
  // Personal
  fullName: string
  fullNameHe?: string
  tz: string
  dateOfBirth?: string
  gender: 'male' | 'female'
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed'
  spouseName?: string
  spouseTz?: string
  spouseWorks?: boolean

  // Address
  street?: string
  houseNumber?: string
  apartment?: string
  city?: string
  mikud?: string

  // Employment
  employerName?: string
  employerHp?: string
  startDate?: string // date started at current employer

  // Oleh
  isOleh?: boolean
  aliyahDate?: string

  // Children
  childrenCount?: number
  childrenUnder18?: number

  // Bank
  bankCode?: string
  branchCode?: string
  accountNumber?: string

  // From payslip data
  lastGrossSalary?: number
  hasPension?: boolean
  hasKerenHishtalmut?: boolean
}

export interface Tofes101Field {
  fieldNumber: string
  label_he: string
  label_fr: string
  value: string
  section: string
  note_fr?: string
}

/**
 * Generate Tofes 101 field values from input data
 */
export function generateTofes101(input: Tofes101Input): Tofes101Field[] {
  const fields: Tofes101Field[] = []

  // Section 1: Personal Details
  fields.push(
    { fieldNumber: '1', label_he: 'שם משפחה', label_fr: 'Nom de famille', value: input.fullName.split(' ').slice(-1)[0] || '', section: 'Identite' },
    { fieldNumber: '2', label_he: 'שם פרטי', label_fr: 'Prenom', value: input.fullName.split(' ').slice(0, -1).join(' ') || '', section: 'Identite' },
    { fieldNumber: '3', label_he: 'מספר זהות', label_fr: 'Teudat Zehut', value: input.tz, section: 'Identite' },
    { fieldNumber: '4', label_he: 'תאריך לידה', label_fr: 'Date de naissance', value: input.dateOfBirth || '', section: 'Identite' },
    { fieldNumber: '5', label_he: 'מצב משפחתי', label_fr: 'Situation familiale', value: formatMaritalStatus(input.maritalStatus), section: 'Identite' },
  )

  if (input.gender === 'female') {
    fields.push({ fieldNumber: '5a', label_he: 'מין', label_fr: 'Sexe', value: 'נקבה (F)', section: 'Identite', note_fr: 'Droit a 0.5 point de credit supplementaire' })
  }

  // Address
  if (input.street || input.city) {
    fields.push(
      { fieldNumber: '6', label_he: 'רחוב', label_fr: 'Rue', value: input.street || '', section: 'Adresse' },
      { fieldNumber: '7', label_he: 'מספר בית', label_fr: 'Numero', value: input.houseNumber || '', section: 'Adresse' },
      { fieldNumber: '8', label_he: 'דירה', label_fr: 'Appartement', value: input.apartment || '', section: 'Adresse' },
      { fieldNumber: '9', label_he: 'ישוב', label_fr: 'Ville', value: input.city || '', section: 'Adresse' },
      { fieldNumber: '10', label_he: 'מיקוד', label_fr: 'Code postal (Mikud)', value: input.mikud || '', section: 'Adresse' },
    )
  }

  // Spouse
  if (input.maritalStatus === 'married' && input.spouseName) {
    fields.push(
      { fieldNumber: '11', label_he: 'שם בן/בת הזוג', label_fr: 'Nom du conjoint', value: input.spouseName, section: 'Conjoint' },
      { fieldNumber: '12', label_he: 'ת.ז. בן/בת הזוג', label_fr: 'TZ conjoint', value: input.spouseTz || '', section: 'Conjoint' },
      { fieldNumber: '13', label_he: 'בן/בת הזוג עובד/ת?', label_fr: 'Le conjoint travaille ?', value: input.spouseWorks ? 'כן (Oui)' : 'לא (Non)', section: 'Conjoint' },
    )
  }

  // Children
  if (input.childrenCount && input.childrenCount > 0) {
    fields.push(
      { fieldNumber: '14', label_he: 'מספר ילדים', label_fr: 'Nombre d\'enfants', value: String(input.childrenCount), section: 'Enfants', note_fr: `Dont ${input.childrenUnder18 || 0} de moins de 18 ans. Chaque enfant peut donner droit a des points de credit.` },
    )
  }

  // Employer
  if (input.employerName) {
    fields.push(
      { fieldNumber: '20', label_he: 'שם המעסיק', label_fr: 'Nom de l\'employeur', value: input.employerName, section: 'Emploi' },
      { fieldNumber: '21', label_he: 'ח.פ./ע.מ. מעסיק', label_fr: 'HP/AM employeur', value: input.employerHp || '', section: 'Emploi' },
      { fieldNumber: '22', label_he: 'תאריך תחילת עבודה', label_fr: 'Date de debut', value: input.startDate || '', section: 'Emploi' },
    )
  }

  // Oleh
  if (input.isOleh) {
    fields.push(
      { fieldNumber: '30', label_he: 'עולה חדש?', label_fr: 'Oleh Hadash ?', value: 'כן (Oui)', section: 'Statut special', note_fr: 'Droit a des points de credit supplementaires pendant 3 ans' },
      { fieldNumber: '31', label_he: 'תאריך עלייה', label_fr: 'Date d\'aliyah', value: input.aliyahDate || '', section: 'Statut special' },
    )
  }

  // Bank details
  if (input.bankCode) {
    fields.push(
      { fieldNumber: '40', label_he: 'קוד בנק', label_fr: 'Code banque', value: input.bankCode, section: 'Compte bancaire' },
      { fieldNumber: '41', label_he: 'סניף', label_fr: 'Succursale', value: input.branchCode || '', section: 'Compte bancaire' },
      { fieldNumber: '42', label_he: 'מספר חשבון', label_fr: 'Numero de compte', value: input.accountNumber || '', section: 'Compte bancaire' },
    )
  }

  // Credit points summary
  let creditPoints = 2.25 // base resident
  if (input.gender === 'female') creditPoints += 0.5
  if (input.isOleh && input.aliyahDate) {
    const aliyahDate = new Date(input.aliyahDate)
    const now = new Date()
    const yearsSinceAliyah = (now.getTime() - aliyahDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    if (yearsSinceAliyah < 1) creditPoints += 3
    else if (yearsSinceAliyah < 2) creditPoints += 2
    else if (yearsSinceAliyah < 3) creditPoints += 1
  }
  // Children credits (simplified — real rules are complex)
  if (input.childrenUnder18 && input.childrenUnder18 > 0) {
    creditPoints += input.childrenUnder18 * 1 // simplified
  }

  fields.push({
    fieldNumber: 'CALC',
    label_he: 'נקודות זיכוי (משוער)',
    label_fr: 'Points de credit estimes',
    value: `${creditPoints} points = ${Math.round(creditPoints * 248)}₪/mois de reduction`,
    section: 'Resume',
    note_fr: 'Estimation automatique basee sur vos informations. Le calcul exact depend de votre situation complete.',
  })

  return fields
}

function formatMaritalStatus(status: string): string {
  const map: Record<string, string> = {
    single: 'רווק/ה (Celibataire)',
    married: 'נשוי/אה (Marie/e)',
    divorced: 'גרוש/ה (Divorce/e)',
    widowed: 'אלמן/ה (Veuf/ve)',
  }
  return map[status] || status
}

// ─── Tofes 106 Summary ───

export interface Tofes106Summary {
  year: number
  employer: string
  grossAnnual: number
  taxDeducted: number
  blDeducted: number
  healthDeducted: number
  pensionEmployee: number
  pensionEmployer: number
  netAnnual: number
  creditPoints: number
  workMonths: number
}

/**
 * Generate a Tofes 106 summary from payslip data
 */
export function generateTofes106Summary(
  payslips: { month: string; gross: number; tax: number; bl: number; health: number; pensionEmp: number; pensionEr: number; net: number }[],
  employer: string,
  year: number,
  creditPoints: number
): Tofes106Summary {
  const grossAnnual = payslips.reduce((s, p) => s + p.gross, 0)
  const taxDeducted = payslips.reduce((s, p) => s + p.tax, 0)
  const blDeducted = payslips.reduce((s, p) => s + p.bl, 0)
  const healthDeducted = payslips.reduce((s, p) => s + p.health, 0)
  const pensionEmployee = payslips.reduce((s, p) => s + p.pensionEmp, 0)
  const pensionEmployer = payslips.reduce((s, p) => s + p.pensionEr, 0)
  const netAnnual = payslips.reduce((s, p) => s + p.net, 0)

  return {
    year,
    employer,
    grossAnnual,
    taxDeducted,
    blDeducted,
    healthDeducted,
    pensionEmployee,
    pensionEmployer,
    netAnnual,
    creditPoints,
    workMonths: payslips.length,
  }
}
