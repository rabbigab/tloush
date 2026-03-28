import type { PayrollLineKey } from "@/types";

interface LabelMapping {
  key: PayrollLineKey;
  frenchLabel: string;
  frenchExplanation: string;
}

export const HEBREW_LABEL_MAP: Record<string, LabelMapping> = {
  "שכר יסוד": { key: "baseSalary", frenchLabel: "Salaire de base", frenchExplanation: "Le salaire contractuel de base avant ajouts ou déductions." },
  "שכר בסיס": { key: "baseSalary", frenchLabel: "Salaire de base", frenchExplanation: "Le salaire contractuel de base avant ajouts ou déductions." },
  "שכר חודשי": { key: "baseSalary", frenchLabel: "Salaire mensuel", frenchExplanation: "Le salaire mensuel brut de base." },
  "ברוטו": { key: "grossSalary", frenchLabel: "Salaire brut", frenchExplanation: "Montant total avant déductions fiscales et sociales." },
  "נטו": { key: "netSalary", frenchLabel: "Salaire net", frenchExplanation: "Montant final versé après toutes les déductions." },
  "לתשלום": { key: "netSalary", frenchLabel: "À payer (net)", frenchExplanation: "Montant final effectivement versé sur le compte bancaire." },
  "שעות רגילות": { key: "regularHours", frenchLabel: "Heures normales", frenchExplanation: "Nombre d'heures travaillées au taux normal." },
  "שעות נוספות": { key: "overtimeHours", frenchLabel: "Heures supplémentaires", frenchExplanation: "Heures effectuées au-delà du contrat, payées à taux majoré." },
  "תעריף שעתי": { key: "hourlyRate", frenchLabel: "Taux horaire", frenchExplanation: "Montant brut par heure de travail." },
  "נסיעות": { key: "travelAllowance", frenchLabel: "Remboursement transport", frenchExplanation: "Indemnité couvrant les frais de transport domicile-travail." },
  "אש\"ל": { key: "mealAllowance", frenchLabel: "Indemnité repas", frenchExplanation: "Indemnité pour couvrir les frais de repas pendant le travail." },
  "הבראה": { key: "holidayBonus", frenchLabel: "Prime de convalescence (Havraa)", frenchExplanation: "Prime annuelle légale de convalescence versée selon l'ancienneté." },
  "דמי הבראה": { key: "holidayBonus", frenchLabel: "Prime de convalescence (Havraa)", frenchExplanation: "Prime annuelle légale de convalescence versée selon l'ancienneté." },
  "בונוס": { key: "bonus", frenchLabel: "Prime / Bonus", frenchExplanation: "Prime exceptionnelle ou régulière versée en plus du salaire." },
  "עמלות": { key: "commission", frenchLabel: "Commissions", frenchExplanation: "Commissions sur ventes ou objectifs atteints." },
  "חופשה": { key: "vacationPay", frenchLabel: "Congés payés", frenchExplanation: "Jours de congés pris et rémunérés ce mois-ci." },
  "יתרת חופשה": { key: "leaveBalance", frenchLabel: "Solde congés", frenchExplanation: "Nombre de jours de congés restants à votre crédit." },
  "מחלה": { key: "sickPay", frenchLabel: "Congé maladie", frenchExplanation: "Jours d'absence pour maladie pris ce mois-ci." },
  "יתרת מחלה": { key: "sickBalance", frenchLabel: "Solde maladie", frenchExplanation: "Nombre de jours de maladie disponibles à votre crédit." },
  "פנסיה": { key: "pension", frenchLabel: "Cotisation pension", frenchExplanation: "Part salarié versée au fonds de retraite." },
  "תגמולים": { key: "pension", frenchLabel: "Épargne retraite (tgmulim)", frenchExplanation: "Cotisation d'épargne retraite versée au fonds." },
  "פיצויים": { key: "pensionCompensation", frenchLabel: "Provision indemnités de licenciement", frenchExplanation: "Part employeur provisionnée pour l'indemnité de licenciement future." },
  "ביטוח לאומי": { key: "nationalInsurance", frenchLabel: "Sécurité sociale (Bituah Leumi)", frenchExplanation: "Cotisation obligatoire à la sécurité sociale israélienne." },
  "ביטוח בריאות": { key: "healthInsurance", frenchLabel: "Assurance santé (Koupat Holim)", frenchExplanation: "Cotisation à l'assurance maladie nationale." },
  "מס הכנסה": { key: "incomeTax", frenchLabel: "Impôt sur le revenu (Mas Hachnasa)", frenchExplanation: "Précompte de l'impôt sur le revenu déduit directement du salaire." },
  "ניכויים": { key: "otherDeduction", frenchLabel: "Déductions diverses", frenchExplanation: "Autres retenues non détaillées séparément." },
};

export function resolveHebrewLabel(rawLabel: string): LabelMapping {
  const cleaned = rawLabel.trim();
  if (HEBREW_LABEL_MAP[cleaned]) return HEBREW_LABEL_MAP[cleaned];
  for (const [pattern, mapping] of Object.entries(HEBREW_LABEL_MAP)) {
    if (cleaned.includes(pattern) || pattern.includes(cleaned)) return mapping;
  }
  return { key: "unknown", frenchLabel: rawLabel, frenchExplanation: "Ligne non identifiée automatiquement. Veuillez vérifier manuellement." };
}

export const KEY_FRENCH_LABELS: Record<PayrollLineKey, string> = {
  baseSalary: "Salaire de base", grossSalary: "Salaire brut", netSalary: "Salaire net",
  hourlyRate: "Taux horaire", regularHours: "Heures normales", overtimeHours: "Heures supplémentaires",
  travelAllowance: "Remboursement transport", mealAllowance: "Indemnité repas",
  vacationPay: "Congés payés", sickPay: "Congé maladie", holidayBonus: "Prime Havraa",
  pension: "Cotisation pension", pensionCompensation: "Provision indemnités licenciement",
  nationalInsurance: "Sécurité sociale", healthInsurance: "Assurance santé",
  incomeTax: "Impôt sur le revenu", unionFee: "Cotisation syndicale", lunchDeduction: "Retenue repas",
  leaveBalance: "Solde congés", sickBalance: "Solde maladie", seniority: "Prime ancienneté",
  bonus: "Prime / Bonus", commission: "Commissions", otherBenefit: "Autre avantage",
  otherDeduction: "Autre déduction", unknown: "Ligne non identifiée",
};
