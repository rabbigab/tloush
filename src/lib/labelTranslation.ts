// ============================================================
// LABEL TRANSLATION -- Dictionnaire hebreu -> cle normalisee
// ============================================================
// Version BMAD 1.1 -- +60 termes supplementaires avec caracteres hebreux
// ============================================================

import type { PayrollLineKey } from "@/types";

interface LabelMapping {
  key: PayrollLineKey;
  frenchLabel: string;
  frenchExplanation: string;
}

export const HEBREW_LABEL_MAP: Record<string, LabelMapping> = {
  // ---------- Salaires de base ----------
  "שכר יסוד":    { key: "baseSalary",  frenchLabel: "Salaire de base",    frenchExplanation: "Le salaire contractuel de base avant ajouts ou deductions." },
  "שכר בסיס":    { key: "baseSalary",  frenchLabel: "Salaire de base",    frenchExplanation: "Le salaire contractuel de base avant ajouts ou deductions." },
  "שכר חודשי": { key: "baseSalary", frenchLabel: "Salaire mensuel",   frenchExplanation: "Le salaire mensuel brut de base." },
  "ברוטו":                 { key: "grossSalary", frenchLabel: "Salaire brut",       frenchExplanation: "Montant total avant deductions fiscales et sociales." },
  'סה"כ ברוטו': { key: "grossSalary", frenchLabel: "Total brut",   frenchExplanation: "Montant total avant deductions fiscales et sociales." },
  "שכר ברוטו": { key: "grossSalary", frenchLabel: "Salaire brut",    frenchExplanation: "Total brut avant deductions." },
  "נטו":                             { key: "netSalary",   frenchLabel: "Salaire net",         frenchExplanation: "Montant final verse apres toutes les deductions." },
  "לתשלום":           { key: "netSalary",   frenchLabel: "A payer (net)",       frenchExplanation: "Montant final effectivement verse sur le compte bancaire." },
  "שכר נטו":          { key: "netSalary",   frenchLabel: "Salaire net",         frenchExplanation: "Salaire net a verser." },

  // ---------- Heures ----------
  "שעות רגילות":      { key: "regularHours",     frenchLabel: "Heures normales",       frenchExplanation: "Heures travaillees au taux normal." },
  "שעות עבודה":            { key: "regularHours",     frenchLabel: "Heures de travail",      frenchExplanation: "Nombre d'heures travaillees au taux normal." },
  "שעות נוספות":      { key: "overtimeHours",    frenchLabel: "Heures supplementaires", frenchExplanation: "Heures effectuees au-dela du contrat, payees a taux majore." },
  "שעות נוספות 125%": { key: "overtimeHours125", frenchLabel: "Heures sup. 125%",       frenchExplanation: "2 premieres heures supplementaires par jour." },
  "שעות נוספות 150%": { key: "overtimeHours150", frenchLabel: "Heures sup. 150%",       frenchExplanation: "Heures supplementaires au-dela des 2 premieres." },
  "גלובלית שעות נוספות": { key: "overtimeHours", frenchLabel: "Heures sup. globales", frenchExplanation: "Forfait heures supplementaires inclus dans le salaire." },
  "תעריף שעתי":            { key: "hourlyRate",       frenchLabel: "Taux horaire",            frenchExplanation: "Montant brut par heure de travail." },
  "שעות חג":                              { key: "overtimeHours",    frenchLabel: "Heures feries",           frenchExplanation: "Heures travaillees un jour ferie." },
  "שעות שבת":                        { key: "overtimeHours",    frenchLabel: "Heures Shabbat",          frenchExplanation: "Heures travaillees le Shabbat, avec majoration specifique." },
  "היעדרות":                         { key: "otherDeduction",   frenchLabel: "Absence",                 frenchExplanation: "Deduction pour absence non remuneree." },
  "חיסור שעות":           { key: "otherDeduction",   frenchLabel: "Deduction heures",        frenchExplanation: "Retenue sur salaire pour heures manquantes." },

  // ---------- Conges & Absences ----------
  "חופשה":             { key: "vacationPay",  frenchLabel: "Conges payes",    frenchExplanation: "Jours de conges pris et remuneres ce mois-ci." },
  "דמי חופשה": { key: "vacationPay", frenchLabel: "Conges payes", frenchExplanation: "Remuneration des conges pris ce mois." },
  "חופש":                   { key: "vacationPay",  frenchLabel: "Conges",          frenchExplanation: "Jours de conges pris ce mois." },
  "יתרת חופשה": { key: "leaveBalance", frenchLabel: "Solde conges", frenchExplanation: "Nombre de jours de conges restants a votre credit." },
  "יתרת חופש":  { key: "leaveBalance", frenchLabel: "Solde conges",  frenchExplanation: "Jours de conges disponibles." },
  "יתרת חופשה צבורה": { key: "leaveBalance", frenchLabel: "Conges cumules", frenchExplanation: "Total des conges accumules depuis le debut de l'annee." },
  "מחלה":                   { key: "sickPay",      frenchLabel: "Conge maladie",   frenchExplanation: "Jours d'absence pour maladie pris ce mois-ci." },
  "דמי מחלה": { key: "sickPay",    frenchLabel: "Conge maladie",   frenchExplanation: "Remuneration des jours maladie." },
  "יתרת מחלה": { key: "sickBalance", frenchLabel: "Solde maladie", frenchExplanation: "Nombre de jours de maladie disponibles a votre credit." },
  "יתרת מחלה צבורה": { key: "sickBalance", frenchLabel: "Maladie cumulee", frenchExplanation: "Total jours maladie accumules." },

  // ---------- Avantages & Primes ----------
  "נסיעות":       { key: "travelAllowance", frenchLabel: "Remboursement transport",  frenchExplanation: "Indemnite couvrant les frais de transport domicile-travail." },
  "החזר נסיעות": { key: "travelAllowance", frenchLabel: "Remboursement transport", frenchExplanation: "Indemnite couvrant les frais de transport." },
  "דמי נסיעות": { key: "travelAllowance", frenchLabel: "Remboursement transport", frenchExplanation: "Indemnite mensuelle de transport." },
  'אש"ל':                        { key: "mealAllowance",   frenchLabel: "Indemnite repas",           frenchExplanation: "Indemnite pour couvrir les frais de repas pendant le travail." },
  "דמי מזון": { key: "mealAllowance",  frenchLabel: "Indemnite repas",           frenchExplanation: "Allocation repas mensuelle." },
  "הבראה":             { key: "holidayBonus",    frenchLabel: "Prime de convalescence (Havraa)", frenchExplanation: "Prime annuelle legale de convalescence, versee selon l'anciennete." },
  "דמי הבראה": { key: "holidayBonus", frenchLabel: "Prime de convalescence (Havraa)", frenchExplanation: "Prime annuelle de convalescence (dmei havraa)." },
  "בונוס":             { key: "bonus",           frenchLabel: "Prime / Bonus",             frenchExplanation: "Prime exceptionnelle ou reguliere versee en plus du salaire." },
  "עמלות":             { key: "commission",      frenchLabel: "Commissions",               frenchExplanation: "Commissions sur ventes ou objectifs atteints." },
  "עמלה":                   { key: "commission",      frenchLabel: "Commission",                frenchExplanation: "Commission sur ventes ou objectifs." },
  "תוספת וותק": { key: "seniority", frenchLabel: "Prime d'anciennete", frenchExplanation: "Complement de salaire lie a la duree de presence dans l'entreprise." },
  "תוספת והץ":       { key: "seniority", frenchLabel: "Prime anciennete",   frenchExplanation: "Supplement salaire selon l'anciennete." },
  "תוספת יוקר מחייה": { key: "otherBenefit", frenchLabel: "Indemnite cout de la vie", frenchExplanation: "Supplement lie au cout de la vie." },
  "מענק":                   { key: "bonus",           frenchLabel: "Prime exceptionnelle",       frenchExplanation: "Prime non recurrente versee selon les resultats." },
  "החזר הוצאות": { key: "otherBenefit", frenchLabel: "Remboursement de frais", frenchExplanation: "Remboursement de frais professionnels divers." },
  "טלפון":             { key: "otherBenefit",    frenchLabel: "Indemnite telephone",        frenchExplanation: "Remboursement partiel ou total des frais de telephone professionnel." },
  "רכב":                         { key: "otherBenefit",    frenchLabel: "Indemnite vehicule",         frenchExplanation: "Indemnite pour usage du vehicule personnel ou vehicule de fonction." },

  // ---------- Epargne & Retraite ----------
  "פנסיה":             { key: "pension",              frenchLabel: "Cotisation pension",       frenchExplanation: "Part salarie versee au fonds de retraite." },
  "תגמולים": { key: "pension",              frenchLabel: "Epargne retraite",          frenchExplanation: "Cotisation d'epargne retraite versee au fonds." },
  "פיצויים": { key: "pensionCompensation",  frenchLabel: "Provision licenciement",   frenchExplanation: "Part employeur provisionnee pour l'indemnite de licenciement future." },
  "פנסיה מעביק": { key: "pensionEmployer", frenchLabel: "Pension (part employeur)", frenchExplanation: "Cotisation retraite versee par l'employeur." },
  "תגמולים מעביק": { key: "pensionEmployer", frenchLabel: "Epargne retraite (patronal)", frenchExplanation: "Part employeur versee au fonds de retraite." },
  "קרן השתלמות": { key: "kerenHishtalmut", frenchLabel: "Keren Hishtalmut (epargne formation)", frenchExplanation: "Fonds d'epargne formation obligatoire dans de nombreux secteurs (exonere d'impot jusqu'a un plafond)." },
  "קרן השתלמ":              { key: "kerenHishtalmut", frenchLabel: "Keren Hishtalmut",         frenchExplanation: "Fonds d'epargne formation." },
  "ביטוח מנהלים": { key: "bituahMenahalim", frenchLabel: "Assurance cadres (Bituah Menahalim)", frenchExplanation: "Assurance vie et retraite pour cadres, remplace souvent la pension classique." },
  "אבדן כושר עבודה": { key: "otherDeduction", frenchLabel: "Assurance incapacite de travail", frenchExplanation: "Assurance couvrant la perte de salaire en cas d'invalidite prolongee." },
  "קופת גמל":                    { key: "pension",         frenchLabel: "Caisse de retraite complementaire", frenchExplanation: "Fonds complementaire d'epargne retraite." },

  // ---------- Cotisations sociales & Impots ----------
  "ביטוח לאומי": { key: "nationalInsurance", frenchLabel: "Securite sociale (Bituah Leumi)", frenchExplanation: "Cotisation obligatoire a la securite sociale israelienne." },
  "דמי ביטוח לאומי": { key: "nationalInsurance", frenchLabel: "Bituah Leumi", frenchExplanation: "Cotisation mensuelle a l'assurance nationale." },
  "ביטוח בריאות": { key: "healthInsurance", frenchLabel: "Assurance sante (Kupat Holim)", frenchExplanation: "Cotisation a l'assurance maladie nationale." },
  "דמי בריאות":        { key: "healthInsurance",  frenchLabel: "Assurance sante",             frenchExplanation: "Part de cotisation sante deduite du salaire." },
  "מס הכנסה":                   { key: "incomeTax",        frenchLabel: "Impot sur le revenu (Mas Hakhnasa)", frenchExplanation: "Precompte de l'impot sur le revenu deduit directement du salaire." },
  "מס הכנסא":                   { key: "incomeTax",        frenchLabel: "Impot sur le revenu",         frenchExplanation: "Precompte mensuel de l'impot sur le revenu." },
  "נקודות זיכוי": { key: "otherBenefit", frenchLabel: "Points de credit fiscal", frenchExplanation: "Credits d'impot auxquels vous avez droit, reduisant votre imposition." },
  "ניכויים":                    { key: "otherDeduction",   frenchLabel: "Deductions diverses",         frenchExplanation: "Autres retenues non detaillees separement." },
  "קרן הסתדרות": { key: "unionFee",         frenchLabel: "Cotisation syndicale (Histadrut)", frenchExplanation: "Cotisation au syndicat général des travailleurs israéliens." },

  // ---------- Recapitulatifs ----------
  "סךה זכויות":  { key: "grossSalary",    frenchLabel: "Total gains",       frenchExplanation: "Somme de toutes les composantes positives (salaire + primes + avantages)." },
  "סךה ניכויים": { key: "otherDeduction", frenchLabel: "Total deductions", frenchExplanation: "Somme de toutes les retenues (cotisations, impots, etc.)." },
  "עלות מעביק":   { key: "pensionEmployer", frenchLabel: "Cout employeur",    frenchExplanation: "Cout total de l'employe pour l'employeur (salaire + charges patronales)." },
};

export function resolveHebrewLabel(rawLabel: string): LabelMapping {
  const cleaned = rawLabel.trim();

  if (HEBREW_LABEL_MAP[cleaned]) {
    return HEBREW_LABEL_MAP[cleaned];
  }

  for (const [pattern, mapping] of Object.entries(HEBREW_LABEL_MAP)) {
    if (cleaned.includes(pattern) || pattern.includes(cleaned)) {
      return mapping;
    }
  }

  return {
    key: "unknown",
    frenchLabel: rawLabel,
    frenchExplanation: "Ligne non identifiee automatiquement. Veuillez verifier manuellement.",
  };
}

export const KEY_FRENCH_LABELS: Record<PayrollLineKey, string> = {
  baseSalary:            "Salaire de base",
  grossSalary:           "Salaire brut",
  netSalary:             "Salaire net",
  hourlyRate:            "Taux horaire",
  regularHours:          "Heures normales",
  overtimeHours:         "Heures supplementaires",
  overtimeHours125:      "Heures sup. 125%",
  overtimeHours150:      "Heures sup. 150%",
  travelAllowance:       "Remboursement transport",
  mealAllowance:         "Indemnite repas",
  vacationPay:           "Conges payes",
  sickPay:               "Conge maladie",
  holidayBonus:          "Prime Havraa",
  pension:               "Cotisation pension",
  pensionCompensation:   "Provision licenciement",
  pensionEmployer:       "Pension (part employeur)",
  kerenHishtalmut:       "Keren Hishtalmut",
  bituahMenahalim:       "Assurance cadres",
  nationalInsurance:     "Securite sociale",
  healthInsurance:       "Assurance sante",
  incomeTax:             "Impot sur le revenu",
  unionFee:              "Cotisation syndicale",
  lunchDeduction:        "Retenue repas",
  leaveBalance:          "Solde conges",
  sickBalance:           "Solde maladie",
  seniority:             "Prime anciennete",
  bonus:                 "Prime / Bonus",
  commission:            "Commissions",
  otherBenefit:          "Autre avantage",
  otherDeduction:        "Autre deduction",
  unknown:               "Ligne non identifiee",
};
