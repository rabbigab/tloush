// ============================================================
// SCANNER — Types pour l'analyse multi-documents
// ============================================================

// ------ Document Types ------
export type DocumentType =
  | "payslip"           // Fiche de paie (tlush)
  | "contract"          // Contrat de travail
  | "officialLetter"    // Lettre officielle
  | "taxNotice"         // Avis d'imposition
  | "lease"             // Contrat de location
  | "termination"       // Lettre de licenciement
  | "medicalBill"       // Facture médicale / hospitalière
  | "kupatHolimLetter"  // Courrier caisse de santé (Clalit/Maccabi/Meuhedet/Leumit)
  | "prescription"      // Ordonnance (mirsham)
  | "labResults"        // Résultats d'analyses de laboratoire
  | "personalLetter"    // Courrier personnel / email / SMS
  | "schoolLetter"      // Courrier de l'école
  | "privateLetter"     // Courrier banque / assurance / institution privée
  | "utilityInvoice"    // Facture arnona / électricité / eau / gaz
  | "universal";        // Fallback : analyse générique pour tout autre document

// Types spécialisés (= tous sauf "universal")
export type SpecializedDocumentType = Exclude<DocumentType, "universal">;

// ------ Health documents ------
// Sous-ensemble de types qui déclenchent un disclaimer médical dans l'UI.
export type HealthDocumentType =
  | "medicalBill"
  | "kupatHolimLetter"
  | "prescription"
  | "labResults";

export const HEALTH_DOCUMENT_TYPES: HealthDocumentType[] = [
  "medicalBill",
  "kupatHolimLetter",
  "prescription",
  "labResults",
];

export function isHealthDocument(type: DocumentType): type is HealthDocumentType {
  return (HEALTH_DOCUMENT_TYPES as DocumentType[]).includes(type);
}

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

// ------ Medical Bill (Facture médicale) ------
// Couvre factures d'hôpital, cliniques privées, laboratoires, dentistes,
// médecine privée. Attention : ne remplace pas un avis médical.
export interface MedicalBillAnalysis {
  provider: string | null;            // Nom établissement (hôpital, clinique, labo)
  providerType:
    | "hospital"
    | "clinic"
    | "laboratory"
    | "doctor"
    | "dentist"
    | "pharmacy"
    | "other"
    | null;
  patientName: string | null;
  serviceDate: string | null;         // ISO date du soin
  invoiceDate: string | null;         // ISO date d'émission
  dueDate: string | null;             // ISO date limite de paiement
  totalAmount: number | null;         // NIS — montant total facturé
  amountDue: number | null;           // NIS — reste à payer par le patient
  amountReimbursable: number | null;  // NIS — part remboursable par kupat holim / assurance
  reimburserName: string | null;      // Nom kupat holim ou assurance
  serviceType: string | null;         // Description courte du soin (FR)
  items: Array<{
    description: string;              // Poste de facturation (traduit FR)
    amount: number;                   // NIS
  }>;
  alerts: Array<{
    severity: "low" | "medium" | "high";
    message: string;
    recommendation: string;
  }>;
}

// ------ Kupat Holim Letter (Courrier caisse de santé) ------
export interface KupatHolimLetterAnalysis {
  sender: string | null;              // Nom complet expéditeur
  kupatHolim:
    | "clalit"
    | "maccabi"
    | "meuhedet"
    | "leumit"
    | "other"
    | null;
  subject: string | null;
  letterType:
    | "authorization"      // Autorisation d'un traitement
    | "refusal"            // Refus
    | "summons"            // Convocation / RDV imposé
    | "payment_reminder"   // Rappel de paiement
    | "information"        // Information générale
    | "other"
    | null;
  treatmentConcerned: string | null;  // Traitement / procédure concerné (FR)
  deadline: string | null;            // ISO date limite de réponse / action
  summary: string;                    // 2-3 phrases FR
  fullTranslation: string;            // Traduction HE→FR des sections importantes
  appealProcess: string | null;       // Procédure d'appel si refus
  suggestedResponse: string | null;   // Template de réponse prête à envoyer
  alerts: Array<{
    severity: "low" | "medium" | "high";
    message: string;
    recommendation: string;
  }>;
}

// ------ Prescription (Ordonnance / mirsham) ------
export interface PrescriptionAnalysis {
  prescriber: string | null;          // Nom du médecin
  prescriberSpecialty: string | null; // Spécialité (FR)
  issueDate: string | null;           // ISO date d'émission
  patientName: string | null;
  medications: Array<{
    nameHe: string | null;            // Nom hébreu tel qu'écrit
    nameFr: string | null;            // Nom français / DCI si possible
    dosage: string | null;            // Ex: "500 mg"
    frequency: string | null;         // Ex: "3 fois par jour"
    duration: string | null;          // Ex: "7 jours"
    quantity: string | null;          // Ex: "30 comprimés"
    renewable: boolean | null;        // Renouvelable oui/non
  }>;
  interactionWarnings: string[];      // Alertes d'interaction détectées
  alerts: Array<{
    severity: "low" | "medium" | "high";
    message: string;
    recommendation: string;
  }>;
}

// ------ Lab Results (Résultats d'analyses) ------
export interface LabResultsAnalysis {
  labName: string | null;             // Nom du laboratoire
  testDate: string | null;            // ISO date du prélèvement
  reportDate: string | null;          // ISO date du compte-rendu
  patientName: string | null;
  prescribingDoctor: string | null;   // Médecin prescripteur
  results: Array<{
    nameHe: string | null;            // Nom hébreu du paramètre
    nameFr: string;                   // Traduction française (hémoglobine, glucose, etc.)
    value: number | string | null;    // Valeur mesurée (nombre ou texte type "positif")
    unit: string | null;              // Unité (g/dL, mg/dL, %, etc.)
    referenceRange: string | null;    // Intervalle de référence (ex: "12-15", "< 100")
    horsNorme: boolean;               // Flag visible : true si valeur hors normes
    interpretation: "low" | "high" | "normal" | "unclear" | null;
  }>;
  hasAbnormalValues: boolean;         // True si au moins un horsNorme
  summary: string;                    // "Tout est normal" OU liste des anormales à discuter
  alerts: Array<{
    severity: "low" | "medium" | "high";
    message: string;
    recommendation: string;
  }>;
}

// ------ Personal Letter (Courrier personnel / email / SMS) ------
// Lettre manuscrite scannée, email imprimé, capture d'écran de SMS, etc.
export interface PersonalLetterAnalysis {
  sender: string | null;              // Expéditeur si identifiable
  date: string | null;                // ISO date (quand datée)
  language: "he" | "fr" | "en" | "mixed" | "other";
  originalText: string | null;        // Texte original si lisible (HE notamment)
  fullTranslation: string | null;     // Traduction FR si document non-FR
  summary: string;                    // 3 phrases max
  tone:
    | "formal"
    | "informal"
    | "urgent"
    | "friendly"
    | "neutral"
    | null;
  suggestedReply: string | null;      // Template adapté au ton détecté
  alerts: Array<{
    severity: "low" | "medium" | "high";
    message: string;
  }>;
}

// ------ School Letter (Courrier école) ------
export interface SchoolLetterAnalysis {
  schoolName: string | null;
  className: string | null;           // Classe concernée (ex: "ג'2", "כיתה ד")
  childName: string | null;
  subject:
    | "meeting"                       // Réunion parents
    | "trip"                          // Sortie scolaire
    | "payment"                       // Paiement demandé
    | "behavior"                      // Comportement enfant
    | "schedule"                      // Horaires / emploi du temps
    | "announcement"                  // Annonce générale
    | "other"
    | null;
  subjectDetail: string | null;       // Description FR (ex: "Sortie musée d'Israël 15/05")
  deadline: string | null;            // ISO date limite
  amountDue: number | null;           // NIS (si paiement demandé)
  actionsRequired: Array<{
    action: string;                   // Description action en FR
    type: "signature" | "payment" | "authorization" | "response" | "other";
  }>;
  suggestedReply: string | null;      // Template de réponse si requis
  fullTranslation: string;            // Traduction HE→FR
  alerts: Array<{
    severity: "low" | "medium" | "high";
    message: string;
    recommendation: string;
  }>;
}

// ------ Private Letter (Banque / assurance / institution privée) ------
export interface PrivateLetterAnalysis {
  sender: string | null;              // Nom complet de l'émetteur
  senderType:
    | "bank"
    | "insurance"
    | "telecom"
    | "utility"
    | "private_other"
    | null;
  date: string | null;                // ISO
  subject: string | null;             // Sujet résumé en FR
  subjectType:
    | "contract_update"               // Mise à jour contrat
    | "payment_reminder"              // Relance paiement
    | "commercial_offer"              // Offre commerciale
    | "document_request"              // Demande de documents
    | "notification"                  // Notification / info
    | "other"
    | null;
  urgency: "urgent" | "not_urgent" | null;
  actionsRequired: Array<{
    action: string;                   // Description FR
    deadline: string | null;          // ISO ou null
  }>;
  suggestedResponse: string | null;   // Template (réponse ou contestation)
  fullTranslation: string;            // Traduction HE→FR
  alerts: Array<{
    severity: "low" | "medium" | "high";
    message: string;
    recommendation: string;
  }>;
}

// ------ Utility Invoice (Arnona / électricité / eau / gaz) ------
export interface UtilityInvoiceAnalysis {
  provider: string | null;            // Nom du fournisseur
  utilityType:
    | "arnona"
    | "electricity"
    | "water"
    | "gas"
    | "internet"
    | "phone"
    | "other"
    | null;
  period: string | null;              // Ex: "Mars-Avril 2026"
  periodStart: string | null;         // ISO
  periodEnd: string | null;           // ISO
  totalAmount: number | null;         // NIS
  dueDate: string | null;             // ISO
  customerCode: string | null;        // Code client / numéro de compte
  paymentReference: string | null;    // Référence pour virement / paiement
  previousPeriodAmount: number | null; // NIS (si affiché sur la facture)
  increasePercent: number | null;     // % d'augmentation vs période précédente (si calculable)
  abnormalIncrease: boolean;          // true si > 20% vs période précédente
  suggestedReminderDate: string | null; // ISO = dueDate - 3 jours
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
  | MedicalBillAnalysis
  | KupatHolimLetterAnalysis
  | PrescriptionAnalysis
  | LabResultsAnalysis
  | PersonalLetterAnalysis
  | SchoolLetterAnalysis
  | PrivateLetterAnalysis
  | UtilityInvoiceAnalysis
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
    id: "medicalBill",
    icon: "🏥",
    label: "Facture médicale",
    description: "Hôpital, clinique, laboratoire, dentiste",
    color: "info",
  },
  {
    id: "kupatHolimLetter",
    icon: "⚕️",
    label: "Courrier caisse santé",
    description: "Clalit, Maccabi, Meuhedet, Leumit",
    color: "info",
  },
  {
    id: "prescription",
    icon: "💊",
    label: "Ordonnance",
    description: "Mirsham : médicaments, posologie, durée",
    color: "info",
  },
  {
    id: "labResults",
    icon: "🧪",
    label: "Résultats d'analyses",
    description: "Bilan sanguin, urines, autres examens",
    color: "info",
  },
  {
    id: "personalLetter",
    icon: "✉️",
    label: "Courrier personnel",
    description: "Lettre manuscrite, email, SMS",
    color: "info",
  },
  {
    id: "schoolLetter",
    icon: "🎒",
    label: "Courrier école",
    description: "Réunion, sortie, paiement, autorisation",
    color: "info",
  },
  {
    id: "privateLetter",
    icon: "🏢",
    label: "Banque / Assurance",
    description: "Banque, assurance, télécom, institution privée",
    color: "info",
  },
  {
    id: "utilityInvoice",
    icon: "💡",
    label: "Facture arnona / énergie",
    description: "Arnona, électricité, eau, gaz",
    color: "warning",
  },
  {
    id: "universal",
    icon: "📎",
    label: "Document général",
    description: "Résumé, traduction et actions suggérées pour tout document",
    color: "info",
  },
];
