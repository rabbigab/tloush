// ============================================================
// SCANNER — Types pour l'analyse multi-documents
// ============================================================

// ------ Document Types ------
export type DocumentType =
  | "contract"         // Contrat de travail
  | "officialLetter"   // Lettre officielle
  | "taxNotice"        // Avis d'imposition
  | "lease"            // Contrat de location
  | "termination";     // Lettre de licenciement

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

// ------ Union type for any document analysis ------
export type DocumentAnalysis =
  | ContractAnalysis
  | OfficialLetterAnalysis
  | TaxNoticeAnalysis
  | LeaseAnalysis
  | TerminationAnalysis;

// ------ API Response ------
export interface ScanApiResponse {
  documentType: DocumentType;
  data: DocumentAnalysis;
  confidenceScore: number;            // 0–100
  processingTime: number;             // milliseconds
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
];
