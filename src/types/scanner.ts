// ============================================================
// SCANNER — Types pour l'analyse multi-documents
// ============================================================

// ------ Document Types ------
export type DocumentType =
  | "payslip"          // Fiche de paie (tlush)
  | "contract"         // Contrat de travail
  | "officialLetter"   // Lettre officielle
  | "taxNotice"        // Avis d'imposition
  | "lease"            // Contrat de location
  | "termination"      // Lettre de licenciement
  | "universal";       // Fallback : analyse générique pour tout autre document

// Types spécialisés (= tous sauf "universal")
export type SpecializedDocumentType = Exclude<DocumentType, "universal">;

// ------ Contract (Contrat de travail) ------
export interface ContractAnalysis {
  employerName: string | null;
  employeeName: string | null;
  startDate: string | null;           // ISO date
  endDate: string | null;             // ISO date (null = indefinite)
  salary: number | null;              // monthly in ILS
  workHours: number | null;           // weekly hours
  probationPeriod: string | null;     // e.g. "3 months"
  nonCompeteClause: {
    present: boolean;
    details: string | null;
  };
  benefits: {
    pension: boolean;
    kerenHishtalmut: boolean;         // learning fund
    healthInsurance: boolean;
    other: string[];
  };
  noticePeriod: string | null;        // e.g. "30 days"
  specialClauses: Array<{
    title: string;
    description: string;
    flagged: boolean;
  }>;
  overallAssessment: "standard" | "attention_needed" | "problematic";
  alerts: Array<{
    severity: "low" | "medium" | "high";
    message: string;
    recommendation: string;
  }>;
}

// ------ Official Letter (Lettre officielle) ------
export interface OfficialLetterAnalysis {
  sender: string | null;              // organization name
  subject: string | null;
  urgencyLevel: "urgent" | "action_required" | "informational" | "archive";
  deadline: string | null;            // ISO date
  actionRequired: string | null;
  summary: string;                    // 2-3 sentences in French
  fullTranslation: string;            // key paragraphs translated
  suggestedResponse: string | null;   // template if action required
  alerts: Array<{
    severity: "low" | "medium" | "high";
    message: string;
  }>;
}

// ------ Tax Notice (Avis d'imposition) ------
export interface TaxNoticeAnalysis {
  taxYear: number | null;
  totalIncome: number | null;         // ILS
  totalTax: number | null;            // ILS
  refundAmount: number | null;        // ILS (can be negative = owed)
  deductions: Array<{
    name: string;
    amount: number;
  }>;
  credits: Array<{
    name: string;
    amount: number;
  }>;
  olimBenefitsApplied: boolean;
  anomalies: Array<{
    type: string;
    description: string;
    severity: "low" | "medium" | "high";
  }>;
  estimatedRefund: number | null;     // ILS
  alerts: Array<{
    severity: "low" | "medium" | "high";
    message: string;
    recommendation: string;
  }>;
}

// ------ Lease (Contrat de location) ------
export interface LeaseAnalysis {
  landlordName: string | null;
  tenantName: string | null;
  address: string | null;
  monthlyRent: number | null;         // ILS
  deposit: number | null;             // ILS
  duration: string | null;            // e.g. "12 months"
  startDate: string | null;           // ISO date
  endDate: string | null;             // ISO date
  specialConditions: string[];
  abusiveClauses: Array<{
    clause: string;
    issue: string;
    severity: "low" | "medium" | "high";
  }>;
  missingProtections: string[];
  alerts: Array<{
    severity: "low" | "medium" | "high";
    message: string;
    recommendation: string;
  }>;
}

// ------ Termination Letter (Lettre de licenciement) ------
export interface TerminationAnalysis {
  employerName: string | null;
  employeeName: string | null;
  terminationDate: string | null;     // ISO date
  lastWorkDay: string | null;         // ISO date
  reason: string | null;
  severanceMentioned: {
    present: boolean;
    amount: number | null;            // ILS
  };
  noticePeriodRespected: boolean | null;
  pitzuimCalculation: {
    expected: number | null;          // ILS
    mentioned: number | null;         // ILS
    matches: boolean | null;
  };
  legalComplianceIssues: Array<{
    issue: string;
    severity: "low" | "medium" | "high";
    recommendation: string;
  }>;
  urgentActions: string[];
}

// ------ Payslip (Fiche de paie) ------
export interface PayslipAnalysis {
  period: string | null;              // "Mars 2026" ou "03/2026"
  employerName: string | null;
  employeeName: string | null;
  grossSalary: number | null;         // Salaire brut ILS
  netSalary: number | null;           // Salaire net ILS
  workingDays: number | null;         // Jours travaillés
  workingHours: number | null;        // Heures travaillées
  deductions: {
    incomeTax: number | null;         // Impôt sur le revenu (Mas Hakhnasa)
    bituahLeumi: number | null;       // Cotisation Bituah Leumi
    healthInsurance: number | null;   // Assurance santé (Mas Briut)
    pension: number | null;           // Cotisation pension
    kerenHishtalmut: number | null;   // Fonds de perfectionnement
    other: Array<{ label: string; amount: number }>;
  };
  benefits: {
    baseSalary: number | null;
    transportAllowance: number | null; // Prime de transport
    mealAllowance: number | null;      // Prime de repas
    overtimePay: number | null;        // Heures supplémentaires
    other: Array<{ label: string; amount: number }>;
  };
  leaveBalance: number | null;        // Jours de congés restants
  sickBalance: number | null;         // Jours de maladie restants
  seniority: string | null;           // Ancienneté (ex. "3 ans 6 mois")
  cumulativeYear: {
    grossYTD: number | null;          // Cumul annuel brut
    netYTD: number | null;            // Cumul annuel net
  };
  alerts: Array<{
    severity: "low" | "medium" | "high";
    message: string;
    recommendation: string;
  }>;
}

// ------ Universal (fallback) ------
// Produit par le mode "universal" quand le document ne correspond à aucun
// type spécialisé. Toujours renvoie :
// - résumé FR + traduction HE→FR complète si document en hébreu
// - éléments clés (dates, montants, noms, institutions)
// - actions suggérées : reminder (échéance, RDV) ou reply (réponse type)
export interface UniversalAnalysis {
  /** Type effectivement détecté par Claude (peut être un type spécialisé si la détection a sur-classifié). */
  detectedType: DocumentType;
  /** Catégorie lisible en français (ex: "Facture EDF", "RDV médical"). */
  documentCategory: string | null;
  /** Langue principale du document. */
  language: "he" | "fr" | "en" | "mixed" | "other";
  /** Résumé clair en français, 3 à 5 phrases. */
  summary: string;
  /** Traduction complète HE→FR si le document est en hébreu. null sinon. */
  translation: string | null;
  /** Éléments clés détectés automatiquement. */
  keyElements: {
    dates: Array<{ label: string; value: string; iso: string | null }>;
    amounts: Array<{ label: string; amount: number; currency: string }>;
    names: Array<{ label: string; name: string }>;
    institutions: Array<{ label: string; name: string }>;
  };
  /** Actions suggérées — reminder (tâche/échéance) ou reply (template de réponse). */
  suggestedActions: Array<
    | {
        type: "reminder";
        title: string;
        description: string;
        dueDate: string | null; // ISO
      }
    | {
        type: "reply";
        title: string;
        description: string;
        responseTemplate: string;
      }
  >;
  alerts: Array<{
    severity: "low" | "medium" | "high";
    message: string;
  }>;
}

// ------ Union type for any document analysis ------
export type DocumentAnalysis =
  | PayslipAnalysis
  | ContractAnalysis
  | OfficialLetterAnalysis
  | TaxNoticeAnalysis
  | LeaseAnalysis
  | TerminationAnalysis
  | UniversalAnalysis;

// ------ Detection result (first pass) ------
export interface DocumentDetection {
  type: DocumentType;
  language: "he" | "fr" | "en" | "mixed" | "other";
  confidence: number; // 0–100
}

// ------ API Response ------
export interface ScanApiResponse {
  documentType: DocumentType;
  data: DocumentAnalysis;
  confidenceScore: number;            // 0–100
  processingTime: number;             // milliseconds
  /** Résultat de la détection auto (null si type imposé côté client). */
  detection: DocumentDetection | null;
}

// ------ Document Type Metadata ------
export interface DocumentTypeCard {
  id: DocumentType;
  icon: string;
  label: string;
  description: string;
  color: "brand" | "success" | "warning" | "danger" | "info";
}

export const DOCUMENT_TYPES: DocumentTypeCard[] = [
  {
    id: "payslip",
    icon: "💵",
    label: "Fiche de paie (tlush)",
    description: "Analysez votre bulletin de salaire en hebreu",
    color: "brand",
  },
  {
    id: "contract",
    icon: "📄",
    label: "Contrat de travail",
    description: "Analysez les clauses de votre contrat d'emploi",
    color: "brand",
  },
  {
    id: "officialLetter",
    icon: "📬",
    label: "Lettre officielle",
    description: "Mairie, Bituach Leumi, impôts, etc.",
    color: "info",
  },
  {
    id: "taxNotice",
    icon: "💰",
    label: "Avis d'imposition",
    description: "Vérifiez votre calcul d'impôt",
    color: "warning",
  },
  {
    id: "lease",
    icon: "🏠",
    label: "Contrat de location",
    description: "Analysez les clauses de votre bail",
    color: "success",
  },
  {
    id: "termination",
    icon: "❌",
    label: "Lettre de licenciement",
    description: "Vérifiez votre indemnité de fin de contrat",
    color: "danger",
  },
  {
    id: "universal",
    icon: "📎",
    label: "Document général",
    description: "Résumé, traduction et actions suggérées pour tout document",
    color: "info",
  },
];
