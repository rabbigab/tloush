/**
 * Hebrew Letter/Message Templates
 *
 * Pre-built templates for common administrative communications in Israel.
 * Each template has a French description and Hebrew output.
 *
 * Sources: skills-il/localization/hebrew-content-writer patterns
 */

export interface LetterTemplate {
  id: string
  category: 'employer' | 'bituach_leumi' | 'tax' | 'landlord' | 'general'
  title_fr: string
  description_fr: string
  fields: TemplateField[]
  generateHebrew: (values: Record<string, string>) => string
  generateFrench: (values: Record<string, string>) => string
}

interface TemplateField {
  key: string
  label_fr: string
  placeholder: string
  type: 'text' | 'date' | 'number' | 'textarea'
  required: boolean
}

export const LETTER_TEMPLATES: LetterTemplate[] = [
  // ─── Employer Letters ───
  {
    id: 'pension-missing',
    category: 'employer',
    title_fr: 'Reclamation pension non versee',
    description_fr: 'Demander a votre employeur de verser les cotisations pension manquantes (obligatoire apres 6 mois).',
    fields: [
      { key: 'employee_name', label_fr: 'Votre nom (hebreu)', placeholder: 'ישראל ישראלי', type: 'text', required: true },
      { key: 'employer_name', label_fr: 'Nom employeur', placeholder: 'חברה בע"מ', type: 'text', required: true },
      { key: 'start_date', label_fr: 'Date debut emploi', placeholder: '01/01/2024', type: 'text', required: true },
      { key: 'months_missing', label_fr: 'Nombre de mois manquants', placeholder: '3', type: 'number', required: true },
    ],
    generateHebrew: (v) => `לכבוד
${v.employer_name}

הנדון: דרישה להפרשות פנסיוניות חסרות

שלום רב,

אני ${v.employee_name}, עובד/ת בחברה מתאריך ${v.start_date}.

בבדיקת תלושי השכר שלי, גיליתי כי הפרשות הפנסיה שלי לא בוצעו במשך ${v.months_missing} חודשים.

בהתאם לצו ההרחבה לביטוח פנסיוני מקיף במשק, מעסיק חייב להפריש לפנסיה של עובד לאחר 6 חודשי עבודה. שיעורי ההפרשה הם:
- עובד: 6%
- מעסיק: 6.5%
- פיצויים: 6%

אבקש להסדיר את ההפרשות החסרות בהקדם האפשרי, כולל הפרשות רטרואקטיביות עבור ${v.months_missing} חודשים.

בברכה,
${v.employee_name}`,
    generateFrench: (v) => `A l'attention de ${v.employer_name}

Objet : Reclamation — cotisations pension non versees

Bonjour,

Je suis ${v.employee_name}, employe(e) depuis le ${v.start_date}.

En verifiant mes fiches de paie, j'ai constate que mes cotisations pension n'ont pas ete versees pendant ${v.months_missing} mois.

Conformement au decret d'extension sur l'assurance pension globale, l'employeur est tenu de cotiser apres 6 mois d'emploi :
- Employe : 6%
- Employeur : 6,5%
- Indemnites : 6%

Je vous demande de regulariser la situation dans les plus brefs delais, y compris les versements retroactifs.

Cordialement,
${v.employee_name}`,
  },
  {
    id: 'payslip-request',
    category: 'employer',
    title_fr: 'Demande de fiches de paie manquantes',
    description_fr: 'Reclamer les fiches de paie que votre employeur ne vous a pas fournies.',
    fields: [
      { key: 'employee_name', label_fr: 'Votre nom (hebreu)', placeholder: 'ישראל ישראלי', type: 'text', required: true },
      { key: 'employer_name', label_fr: 'Nom employeur', placeholder: 'חברה בע"מ', type: 'text', required: true },
      { key: 'missing_months', label_fr: 'Mois manquants', placeholder: 'ינואר-מרץ 2025', type: 'text', required: true },
    ],
    generateHebrew: (v) => `לכבוד
${v.employer_name}

הנדון: דרישה למסירת תלושי שכר

שלום רב,

אני ${v.employee_name}. טרם קיבלתי תלושי שכר עבור החודשים ${v.missing_months}.

בהתאם לחוק הגנת השכר, תשי"ח-1958, מעסיק חייב למסור תלוש שכר מפורט לעובד עד ה-9 לחודש שלאחר חודש העבודה. אי מסירת תלוש שכר מהווה עבירה פלילית.

אבקש לקבל את התלושים החסרים בהקדם.

בברכה,
${v.employee_name}`,
    generateFrench: (v) => `A l'attention de ${v.employer_name}

Objet : Demande de fiches de paie manquantes

Bonjour,

Je suis ${v.employee_name}. Je n'ai pas recu mes fiches de paie pour les mois de ${v.missing_months}.

Conformement a la Loi sur la protection des salaires (1958), l'employeur est tenu de fournir un bulletin de salaire detaille au plus tard le 9 du mois suivant. Le non-respect constitue une infraction penale.

Je vous prie de me transmettre les fiches manquantes dans les plus brefs delais.

Cordialement,
${v.employee_name}`,
  },
  {
    id: 'severance-claim',
    category: 'employer',
    title_fr: 'Reclamation pitzouim (indemnites de licenciement)',
    description_fr: 'Reclamer vos indemnites de licenciement apres un depart.',
    fields: [
      { key: 'employee_name', label_fr: 'Votre nom (hebreu)', placeholder: 'ישראל ישראלי', type: 'text', required: true },
      { key: 'employer_name', label_fr: 'Nom employeur', placeholder: 'חברה בע"מ', type: 'text', required: true },
      { key: 'start_date', label_fr: 'Date debut emploi', placeholder: '01/01/2020', type: 'text', required: true },
      { key: 'end_date', label_fr: 'Date fin emploi', placeholder: '01/01/2025', type: 'text', required: true },
      { key: 'last_salary', label_fr: 'Dernier salaire brut', placeholder: '10000', type: 'number', required: true },
    ],
    generateHebrew: (v) => `לכבוד
${v.employer_name}

הנדון: דרישה לתשלום פיצויי פיטורים

שלום רב,

אני ${v.employee_name}, עבדתי בחברה מתאריך ${v.start_date} ועד ${v.end_date}.

בהתאם לחוק פיצויי פיטורים, תשכ"ג-1963, אני זכאי/ת לפיצויי פיטורים בגובה משכורת אחרונה (${v.last_salary}₪) כפול שנות עבודה.

על פי החוק, על המעסיק לשלם את הפיצויים תוך 15 יום ממועד סיום העבודה. עיכוב בתשלום עלול להקים עילה לפיצויי הלנה.

אבקש להסדיר את התשלום בהקדם.

בברכה,
${v.employee_name}`,
    generateFrench: (v) => `A l'attention de ${v.employer_name}

Objet : Reclamation d'indemnites de licenciement (pitzouim)

Bonjour,

Je suis ${v.employee_name}, j'ai travaille dans votre entreprise du ${v.start_date} au ${v.end_date}.

Conformement a la Loi sur les indemnites de licenciement (1963), j'ai droit a des indemnites egales a mon dernier salaire (${v.last_salary}₪) multiplie par les annees de service.

La loi impose un paiement sous 15 jours apres la fin de l'emploi. Tout retard peut entrainer des penalites.

Je vous prie de proceder au versement dans les meilleurs delais.

Cordialement,
${v.employee_name}`,
  },
  // ─── Bituach Leumi ───
  {
    id: 'bl-rights-inquiry',
    category: 'bituach_leumi',
    title_fr: 'Demande de verification de droits',
    description_fr: 'Demander au Bituach Leumi un releve de vos droits et allocations.',
    fields: [
      { key: 'name', label_fr: 'Votre nom (hebreu)', placeholder: 'ישראל ישראלי', type: 'text', required: true },
      { key: 'teudat_zehut', label_fr: 'Numero de Teudat Zehut', placeholder: '123456789', type: 'text', required: true },
      { key: 'subject', label_fr: 'Sujet de la demande', placeholder: 'דמי אבטלה / קצבת ילדים / ...', type: 'text', required: true },
    ],
    generateHebrew: (v) => `לכבוד
המוסד לביטוח לאומי

הנדון: בירור זכויות — ${v.subject}

שלום רב,

אני ${v.name}, ת.ז. ${v.teudat_zehut}.

אבקש לקבל פירוט מלא של זכויותיי בנושא ${v.subject}, כולל:
- סכומים המגיעים לי
- תנאי הזכאות
- מסמכים נדרשים להגשת תביעה
- לוחות זמנים לטיפול

תודה מראש,
${v.name}`,
    generateFrench: (v) => `A l'attention du Bituach Leumi

Objet : Verification de droits — ${v.subject}

Bonjour,

Je suis ${v.name}, Teudat Zehut ${v.teudat_zehut}.

Je souhaite obtenir un releve complet de mes droits concernant ${v.subject}, incluant :
- Les montants auxquels j'ai droit
- Les conditions d'eligibilite
- Les documents requis
- Les delais de traitement

Merci,
${v.name}`,
  },
  // ─── Landlord ───
  {
    id: 'rent-increase-dispute',
    category: 'landlord',
    title_fr: 'Contestation augmentation de loyer',
    description_fr: 'Contester une augmentation de loyer abusive ou non conforme au contrat.',
    fields: [
      { key: 'tenant_name', label_fr: 'Votre nom (hebreu)', placeholder: 'ישראל ישראלי', type: 'text', required: true },
      { key: 'landlord_name', label_fr: 'Nom du proprietaire', placeholder: 'בעל הדירה', type: 'text', required: true },
      { key: 'address', label_fr: 'Adresse du logement', placeholder: 'רחוב הרצל 1, תל אביב', type: 'text', required: true },
      { key: 'current_rent', label_fr: 'Loyer actuel', placeholder: '5000', type: 'number', required: true },
      { key: 'proposed_rent', label_fr: 'Loyer propose', placeholder: '6000', type: 'number', required: true },
    ],
    generateHebrew: (v) => `לכבוד
${v.landlord_name}

הנדון: התנגדות להעלאת שכר דירה

שלום רב,

אני ${v.tenant_name}, שוכר/ת הדירה ברחוב ${v.address}.

קיבלתי את הודעתך על העלאת שכר הדירה מ-${v.current_rent}₪ ל-${v.proposed_rent}₪ לחודש, שינוי של ${Math.round(((Number(v.proposed_rent) - Number(v.current_rent)) / Number(v.current_rent)) * 100)}%.

אני מתנגד/ת להעלאה זו מהסיבות הבאות:
1. ההעלאה חורגת מהסביר בהשוואה למחירי השוק באזור
2. לא בוצעו שיפורים או שיפוצים המצדיקים העלאה כזו

אבקש לבחון מחדש את ההעלאה או להגיע להסכם סביר.

בברכה,
${v.tenant_name}`,
    generateFrench: (v) => `A l'attention de ${v.landlord_name}

Objet : Contestation d'augmentation de loyer

Bonjour,

Je suis ${v.tenant_name}, locataire au ${v.address}.

J'ai recu votre notification d'augmentation du loyer de ${v.current_rent}₪ a ${v.proposed_rent}₪/mois, soit une hausse de ${Math.round(((Number(v.proposed_rent) - Number(v.current_rent)) / Number(v.current_rent)) * 100)}%.

Je conteste cette augmentation pour les raisons suivantes :
1. Elle depasse les prix du marche dans le quartier
2. Aucune amelioration ou renovation ne la justifie

Je vous propose de revoir cette augmentation ou de trouver un accord raisonnable.

Cordialement,
${v.tenant_name}`,
  },
  // ─── Tax Authority ───
  {
    id: 'tax-refund-request',
    category: 'tax',
    title_fr: 'Demande de remboursement d\'impot',
    description_fr: 'Reclamer un trop-percu d\'impot sur le revenu (mas hachnasa).',
    fields: [
      { key: 'name', label_fr: 'Votre nom (hebreu)', placeholder: 'ישראל ישראלי', type: 'text', required: true },
      { key: 'teudat_zehut', label_fr: 'Numero de Teudat Zehut', placeholder: '123456789', type: 'text', required: true },
      { key: 'tax_year', label_fr: 'Annee fiscale', placeholder: '2024', type: 'text', required: true },
      { key: 'reason', label_fr: 'Raison du trop-percu', placeholder: 'Points de credit oleh non appliques', type: 'text', required: true },
    ],
    generateHebrew: (v) => `לכבוד
רשות המסים בישראל

הנדון: בקשה להחזר מס — שנת ${v.tax_year}

שלום רב,

אני ${v.name}, ת.ז. ${v.teudat_zehut}.

אני פונה בבקשה להחזר מס הכנסה עבור שנת המס ${v.tax_year}.

סיבת הבקשה: ${v.reason}

מצורפים המסמכים הרלוונטיים. אבקש לבדוק את תיקי ולהחזיר לי את הסכום העודף שנגבה.

בברכה,
${v.name}`,
    generateFrench: (v) => `A l'attention de l'Autorite fiscale israelienne

Objet : Demande de remboursement d'impot — annee ${v.tax_year}

Bonjour,

Je suis ${v.name}, Teudat Zehut ${v.teudat_zehut}.

Je demande un remboursement d'impot sur le revenu pour l'annee fiscale ${v.tax_year}.

Motif : ${v.reason}

Les documents justificatifs sont joints. Je vous prie de bien vouloir examiner mon dossier.

Cordialement,
${v.name}`,
  },
]

export function getTemplatesByCategory(category: string): LetterTemplate[] {
  return LETTER_TEMPLATES.filter(t => t.category === category)
}

export function getTemplateById(id: string): LetterTemplate | undefined {
  return LETTER_TEMPLATES.find(t => t.id === id)
}
