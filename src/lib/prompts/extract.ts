// System and user prompts for payslip extraction (/api/extract)

export const EXTRACT_SYSTEM_PROMPT = `Tu es un expert en fiches de paie israéliennes (תלוש שכר / tloush maskoret).
Ton rôle est d'extraire toutes les informations d'une fiche de paie israélienne et de les retourner en JSON structuré.
Les fiches de paie israéliennes sont généralement en hébreu. Tu dois :
1. Lire tous les textes en hébreu
2. Identifier chaque ligne (salaire de base, cotisations, avantages, etc.)
3. Extraire les montants en shekel (₪ / ILS)
4. Retourner un JSON conforme au schéma demandé

VALIDATION OBLIGATOIRE avant de retourner le JSON :
- Recalcule : grossSalary doit ≈ somme de toutes les rawLines positives (salaire de base + primes + indemnités)
- Recalcule : totalDeductions doit ≈ somme de toutes les rawLines négatives (impôts + cotisations)
- Recalcule : netSalary doit ≈ grossSalary - |totalDeductions|
- Si un écart > 100₪ entre tes calculs et les valeurs affichées, ajoute une note dans le rawLine concerné et réduis confidenceScore de 20 points
- Si le document est un Tofes 106 (תפס 106 / טופס 106) ou un récapitulatif annuel, indique-le dans extractionMode: "tofes_106"

IMPORTANT : Retourne UNIQUEMENT le JSON, sans texte avant ou après.`

export const EXTRACT_USER_PROMPT = `Analyse cette fiche de paie israélienne et extrait toutes les informations.
Retourne UNIQUEMENT ce JSON (sans markdown, sans explication) :

{
  "employerName": "nom de l'employeur ou null",
  "employeeName": "nom du salarié ou null",
  "employeeId": "numéro d'employé (masqué si possible) ou null",
  "period": "période ex: 'Avril 2024' ou '04/2024' ou null",
  "paymentDate": "date de paiement JJ/MM/AAAA ou null",
  "baseSalary": nombre ou null,
  "grossSalary": nombre ou null,
  "netSalary": nombre ou null,
  "hourlyRate": nombre ou null,
  "regularHours": nombre ou null,
  "overtimeHours": nombre ou null,
  "totalBenefits": nombre ou null,
  "totalDeductions": nombre ou null,
  "leaveBalance": nombre (jours) ou null,
  "sickBalance": nombre (jours) ou null,
  "pensionDetected": true/false,
  "nationalInsuranceDetected": true/false,
  "incomeTaxDetected": true/false,
  "rawLines": [
    {
      "hebrewLabel": "texte hébreu de la ligne",
      "normalizedKey": "une des clés suivantes : baseSalary|grossSalary|netSalary|hourlyRate|regularHours|overtimeHours|travelAllowance|mealAllowance|vacationPay|sickPay|holidayBonus|pension|pensionCompensation|nationalInsurance|healthInsurance|incomeTax|unionFee|lunchDeduction|leaveBalance|sickBalance|seniority|bonus|commission|otherBenefit|otherDeduction|unknown",
      "frenchLabel": "traduction française",
      "value": nombre ou null,
      "unit": "ILS ou hours ou days ou %",
      "note": "explication si nécessaire ou omis"
    }
  ],
  "confidenceScore": nombre entre 0 et 100 (ta confiance dans l'extraction),
  "extractionMode": "ocr"
}

Règles importantes :
- שכר יסוד = salaire de base (baseSalary)
- ברוטו = brut (grossSalary)
- נטו = net (netSalary)
- ביטוח לאומי = sécurité sociale (nationalInsurance) → valeur NEGATIVE
- ביטוח בריאות = assurance santé (healthInsurance) → valeur NEGATIVE
- מס הכנסה = impôt sur le revenu (incomeTax) → valeur NEGATIVE
- פנסיה = pension salarié (pension) → valeur NEGATIVE
- נסיעות = remboursement transport (travelAllowance) → valeur POSITIVE
- שעות נוספות = heures supplémentaires (overtimeHours)
- יתרת חופשה = solde congés (leaveBalance) en jours
- יתרת מחלה = solde maladie (sickBalance) en jours
- Les déductions (cotisations, impôts) doivent être des valeurs NEGATIVES
- Les avantages (transports, primes) doivent être des valeurs POSITIVES`
