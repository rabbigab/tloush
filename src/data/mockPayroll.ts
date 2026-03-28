// ============================================================
// MOCK DATA — Fiche de paie de démonstration
// ============================================================
// Simule une extraction OCR réaliste d'une fiche de paie
// israélienne typique (salarié à temps plein, ~8 500 ₪/mois).
// ============================================================

import type { PayrollDocument, PayrollRawLine } from "@/types";

export const DEMO_PAYROLL_LINES: PayrollRawLine[] = [
  {
    hebrewLabel: "שכר יסוד",
    normalizedKey: "baseSalary",
    frenchLabel: "Salaire de base",
    value: 8500,
    unit: "ILS",
  },
  {
    hebrewLabel: "שעות רגילות",
    normalizedKey: "regularHours",
    frenchLabel: "Heures normales",
    value: 182,
    unit: "hours",
    note: "182h/mois (temps plein standard)",
  },
  {
    hebrewLabel: "שעות נוספות",
    normalizedKey: "overtimeHours",
    frenchLabel: "Heures supplémentaires",
    value: 10,
    unit: "hours",
    note: "Taux majoré 125%/150%",
  },
  {
    hebrewLabel: "נסיעות",
    normalizedKey: "travelAllowance",
    frenchLabel: "Remboursement transport",
    value: 550,
    unit: "ILS",
  },
  {
    hebrewLabel: "ברוטו",
    normalizedKey: "grossSalary",
    frenchLabel: "Salaire brut",
    value: 9800,
    unit: "ILS",
  },
  {
    hebrewLabel: "ביטוח לאומי",
    normalizedKey: "nationalInsurance",
    frenchLabel: "Sécurité sociale (Bituah Leumi)",
    value: -352,
    unit: "ILS",
  },
  {
    hebrewLabel: "ביטוח בריאות",
    normalizedKey: "healthInsurance",
    frenchLabel: "Assurance santé",
    value: -102,
    unit: "ILS",
  },
  {
    hebrewLabel: "מס הכנסה",
    normalizedKey: "incomeTax",
    frenchLabel: "Impôt sur le revenu",
    value: -620,
    unit: "ILS",
  },
  {
    hebrewLabel: "פנסיה",
    normalizedKey: "pension",
    frenchLabel: "Cotisation pension (part salarié)",
    value: -510,
    unit: "ILS",
    note: "6% du brut",
  },
  {
    hebrewLabel: "יתרת חופשה",
    normalizedKey: "leaveBalance",
    frenchLabel: "Solde congés",
    value: 14,
    unit: "days",
  },
  {
    hebrewLabel: "יתרת מחלה",
    normalizedKey: "sickBalance",
    frenchLabel: "Solde maladie",
    value: 18,
    unit: "days",
  },
  {
    hebrewLabel: "נטו",
    normalizedKey: "netSalary",
    frenchLabel: "Salaire net",
    value: 8216,
    unit: "ILS",
  },
];

export const DEMO_PAYROLL_DOCUMENT: PayrollDocument = {
  employerName: "חברת הדוגמה בע\u05f3מ (Société Exemple SARL)",
  employeeName: "David Cohen",
  employeeId: "***4567",
  period: "Avril 2024",
  paymentDate: "30/04/2024",

  baseSalary: 8500,
  grossSalary: 9800,
  netSalary: 8216,
  hourlyRate: 46.7,
  regularHours: 182,
  overtimeHours: 10,

  totalBenefits: 550,
  totalDeductions: 1584,

  leaveBalance: 14,
  sickBalance: 18,
  pensionDetected: true,
  nationalInsuranceDetected: true,
  incomeTaxDetected: true,

  rawLines: DEMO_PAYROLL_LINES,
  confidenceScore: 82,
  extractionMode: "mock",
};

// ------ Contexte utilisateur de démo ------
import type { UserContext } from "@/types";

export const DEMO_USER_CONTEXT: UserContext = {
  payType: "monthly",
  startDate: "2022-09-01",
  workTime: "full",
  salaryType: "fixed",
  hasContract: true,
  isFirstPayslip: false,

  tookVacation: true,
  vacationDays: 3,
  wasSick: false,
  sickDays: null,
  hasMedicalCertificate: null,
  hadUnpaidLeave: false,
  didOvertime: true,
  workedHoliday: false,
  gotBonus: false,

  moreThanOneYear: true,
  hasPensionViaEmployer: true,
  receivesRegularAllowances: true,
  postOrHoursChanged: false,
  hadIncompleteMonth: false,

  hasTimesheet: true,
  hasPreviousPayslips: true,
  hasPensionStatement: false,
};

// ------ Génération d'un document vide pour upload réel ------
export function createEmptyPayrollDocument(): PayrollDocument {
  return {
    employerName: null,
    employeeName: null,
    employeeId: null,
    period: null,
    paymentDate: null,
    baseSalary: null,
    grossSalary: null,
    netSalary: null,
    hourlyRate: null,
    regularHours: null,
    overtimeHours: null,
    totalBenefits: null,
    totalDeductions: null,
    leaveBalance: null,
    sickBalance: null,
    pensionDetected: false,
    nationalInsuranceDetected: false,
    incomeTaxDetected: false,
    rawLines: [],
    confidenceScore: 0,
    extractionMode: "manual",
  };
}

// ------ Simulation d'extraction OCR ------
// Dans le MVP, on simule une extraction avec délai et données partielles.
// À remplacer par un vrai appel API (GPT-4 Vision, AWS Textract, etc.)
export async function simulateOcrExtraction(
  _file: File
): Promise<PayrollDocument> {
  // Simule le délai de traitement
  await new Promise((resolve) => setTimeout(resolve, 2500));

  // Retourne les données mock avec un score de confiance légèrement réduit
  return {
    ...DEMO_PAYROLL_DOCUMENT,
    confidenceScore: 75,
    extractionMode: "mock",
    // On laisse quelques champs "null" pour montrer l'intérêt du formulaire de vérification
    overtimeHours: null,
    leaveBalance: null,
  };
}
