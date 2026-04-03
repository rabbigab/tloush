// ============================================================
// TLOUSH -- Types & Interfaces centraux
// ============================================================

export type PayrollLineKey =
  | "baseSalary"
  | "grossSalary"
  | "netSalary"
  | "hourlyRate"
  | "regularHours"
  | "overtimeHours"
  | "overtimeHours125"
  | "overtimeHours150"
  | "travelAllowance"
  | "mealAllowance"
  | "vacationPay"
  | "sickPay"
  | "holidayBonus"
  | "pension"
  | "pensionCompensation"
  | "pensionEmployer"
  | "kerenHishtalmut"
  | "bituahMenahalim"
  | "nationalInsurance"
  | "healthInsurance"
  | "incomeTax"
  | "unionFee"
  | "lunchDeduction"
  | "leaveBalance"
  | "sickBalance"
  | "seniority"
  | "bonus"
  | "commission"
  | "otherBenefit"
  | "otherDeduction"
  | "unknown";

export interface PayrollRawLine {
  hebrewLabel: string;
  normalizedKey: PayrollLineKey;
  frenchLabel: string;
  value: number | null;
  unit?: "ILS" | "hours" | "days" | "%";
  note?: string;
}

export interface PayrollDocument {
  employerName: string | null;
  employeeName: string | null;
  employeeId: string | null;
  period: string | null;
  paymentDate: string | null;
  baseSalary: number | null;
  grossSalary: number | null;
  netSalary: number | null;
  hourlyRate: number | null;
  regularHours: number | null;
  overtimeHours: number | null;
  totalBenefits: number | null;
  totalDeductions: number | null;
  leaveBalance: number | null;
  sickBalance: number | null;
  pensionDetected: boolean;
  nationalInsuranceDetected: boolean;
  incomeTaxDetected: boolean;
  kerenHishtalmutDetected: boolean;
  rawLines: PayrollRawLine[];
  confidenceScore: number;
  extractionMode: "mock" | "ocr" | "manual";
}

export type PayType = "monthly" | "hourly" | "unknown";
export type WorkTime = "full" | "part" | "unknown";
export type SalaryType = "fixed" | "variable" | "unknown";

export interface UserContext {
  payType: PayType;
  startDate: string | null;
  workTime: WorkTime;
  salaryType: SalaryType;
  hasContract: boolean | null;
  isFirstPayslip: boolean | null;
  tookVacation: boolean | null;
  vacationDays: number | null;
  wasSick: boolean | null;
  sickDays: number | null;
  hasMedicalCertificate: boolean | null;
  hadUnpaidLeave: boolean | null;
  didOvertime: boolean | null;
  workedHoliday: boolean | null;
  gotBonus: boolean | null;
  moreThanOneYear: boolean | null;
  hasPensionViaEmployer: boolean | null;
  receivesRegularAllowances: boolean | null;
  postOrHoursChanged: boolean | null;
  hadIncompleteMonth: boolean | null;
  hasTimesheet: boolean | null;
  hasPreviousPayslips: boolean | null;
  hasPensionStatement: boolean | null;
}

export type FlagSeverity = "low" | "medium" | "high";
export type FlagCategory =
  | "salary"
  | "deductions"
  | "seniority"
  | "leave"
  | "sick"
  | "pension"
  | "overtime"
  | "readability"
  | "general";

export interface AnalysisFlag {
  id: string;
  severity: FlagSeverity;
  category: FlagCategory;
  title: string;
  message: string;
  explanation: string;
  recommendation: string;
}

export interface PositiveFinding {
  id: string;
  category: FlagCategory;
  title: string;
  message: string;
}

export interface EmployerQuestion {
  id: string;
  question: string;
  context: string;
}

export interface NeededDocument {
  id: string;
  name: string;
  reason: string;
}

export interface ReportSummary {
  period: string;
  employer: string;
  payType: string;
  confidenceLevel: "high" | "medium" | "low";
  alertLevel: "none" | "low" | "medium" | "high";
  alertCount: number;
}

export interface FinalReport {
  generatedAt: string;
  summary: ReportSummary;
  extractedData: PayrollDocument;
  userContext: UserContext;
  positiveFindings: PositiveFinding[];
  flags: AnalysisFlag[];
  employerQuestions: EmployerQuestion[];
  neededDocuments: NeededDocument[];
  disclaimer: string;
}

/** Document as stored in DB and used across app views (inbox, dashboard, assistant). */
export interface AppDocument {
  id: string
  file_name: string
  file_type: string
  document_type: string
  status: string
  is_urgent: boolean
  summary_fr: string | null
  action_required: boolean
  action_description: string | null
  period: string | null
  analysis_data?: Record<string, unknown>
  created_at: string
}

export type AppStep = "landing" | "upload" | "extraction" | "questionnaire" | "results";

export interface AppState {
  currentStep: AppStep;
  uploadedFile: File | null;
  payrollDocument: PayrollDocument | null;
  userContext: UserContext;
  finalReport: FinalReport | null;
  setStep: (step: AppStep) => void;
  setUploadedFile: (file: File | null) => void;
  setPayrollDocument: (doc: PayrollDocument) => void;
  updateUserContext: (partial: Partial<UserContext>) => void;
  setFinalReport: (report: FinalReport) => void;
  resetAll: () => void;
}

export type QuestionType = "boolean" | "number" | "select" | "date";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: keyof UserContext;
  block: "A" | "B" | "C" | "D";
  type: QuestionType;
  label: string;
  helpText?: string;
  options?: QuestionOption[];
  showIf?: (ctx: Partial<UserContext>) => boolean;
  required: boolean;
}
