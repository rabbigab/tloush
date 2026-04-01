/**
 * Israeli Labor Law & Olim Rights Data
 * Comprehensive data structures for the Tloush app
 * Last updated: 2025-2026
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Minimum wage and basic employment rates
 */
export interface MinimumWage {
  monthly: number;
  hourly: number;
  updatedDate: string;
}

/**
 * Work week regulations
 */
export interface WorkWeek {
  maxHours: number;
  standardDays: 5 | 6;
}

/**
 * Overtime multipliers for different scenarios
 */
export interface OvertimeRates {
  first2Hours: number;
  beyond2Hours: number;
  shabbat: number;
  holiday: number;
}

/**
 * Annual leave accumulation based on tenure
 * netDays = actual work days off (excluding rest days)
 * brutoDays = calendar days including weekly rest day(s)
 */
export interface AnnualLeaveEntry {
  minYears: number;
  maxYears: number;
  days: number; // kept for backward compat, equals netDays
  netDays: number; // actual work days off
  brutoDays: number; // calendar days incl. rest days
}

/**
 * Full annual leave schedule for both work week types
 */
export interface AnnualLeaveSchedule {
  fiveDayWeek: {
    withTzoHarchava: AnnualLeaveEntry[]; // Most workplaces (extension order)
    withoutTzoHarchava: AnnualLeaveEntry[]; // Law only (small employers, households, etc.)
  };
  sixDayWeek: AnnualLeaveEntry[];
  notes: string[];
}

/**
 * Sick leave regulations
 */
export interface SickLeavePolicy {
  accrualPerMonth: number;
  maxAccumulation: number;
  firstDayPaid: boolean;
  day2_3Rate: number;
  day4PlusRate: number;
}

/**
 * Severance/termination regulations
 */
export interface SeverancePolicy {
  monthsPerYear: number;
  minTenure: number;
  noticePeriod: {
    under6Months: string;
    months6to12: string;
    over1Year: string;
  };
}

/**
 * Recuperation days (ÃÂÃÂÃÂ ÃÂÃÂÃÂ¨ÃÂÃÂ) - additional paid days for long service
 */
export interface RecuperationPolicy {
  name: string;
  daysPerYear: AnnualLeaveEntry[];
  dailyRate: number;
}

/**
 * Travel allowance regulations
 */
export interface TravelAllowance {
  maxDaily: number;
}

/**
 * Complete labor law structure
 */
export interface LaborLaw {
  minimumWage: MinimumWage;
  workWeek: WorkWeek;
  overtime: OvertimeRates;
  annualLeave: AnnualLeaveEntry[]; // kept for backward compat (6-day law table)
  annualLeaveSchedule: AnnualLeaveSchedule; // full detailed schedule
  sickLeave: SickLeavePolicy;
  severance: SeverancePolicy;
  recuperation: RecuperationPolicy;
  travelAllowance: TravelAllowance;
}

/**
 * National Insurance (Bituach Leumi) rates
 */
export interface BituachLeumiRates {
  employee: {
    lowRate: number;
    highRate: number;
    threshold: number;
  };
  employer: {
    lowRate: number;
    highRate: number;
  };
  healthInsurance: {
    employeeLowRate: number;
    employeeHighRate: number;
    employerLowRate: number;
    employerHighRate: number;
  };
  maxMonthlyIncome: number;
  selfEmployed: {
    lowRate: number;
    highRate: number;
  };
}

/**
 * Income tax bracket
 */
export interface TaxBracket {
  from: number;
  to: number;
  rate: number;
}

/**
 * Income tax structure with brackets and credits
 */
export interface IncomeTax {
  brackets: TaxBracket[];
  creditPoints: {
    value: number;
    olimMonths: number;
    olimPoints: number;
  };
}

/**
 * Education/study fund (Keren Hishtalmut)
 */
export interface KerenHishtalmut {
  employee: {
    standardRate: number;
    maxRate: number;
  };
  employer: {
    standardRate: number;
    maxRate: number;
  };
  withdrawalYears: number;
  educationWithdrawalYears: number;
  taxFreeCapitalGains: boolean;
}

/**
 * Pension/provident fund requirements
 */
export interface Pension {
  employee: {
    minRate: number;
  };
  employer: {
    minRate: number;
    severanceComponent: number;
  };
  mandatory: boolean;
  afterMonths: number;
}

/**
 * Maternity and paternity benefits
 */
export interface MaternityBenefits {
  duration: {
    weeks: number;
    extensionMultipleBirth: number;
  };
  paternity: {
    partnerWeeks: number;
    additionalIfMotherConsents: boolean;
  };
  eligibility: {
    minContributionMonths: number;
    within14Months: boolean;
    or15MonthsWithin22: boolean;
  };
  protectedPeriod: {
    monthsAfterReturn: number;
  };
  allowance: {
    basedOnSalary: boolean;
    maxDaily: number;
  };
}

/**
 * Olim (immigrant) right or benefit
 */
export interface OlimRight {
  id: string;
  titleFR: string;
  titleHE: string;
  description: string;
  amount: string | null;
  duration: string;
  deadline: string | null;
  eligibility: string;
  howToClaim: string;
  category: "financial" | "tax" | "housing" | "health" | "employment" | "education";
  priority: "high" | "medium" | "low";
  updatedYear: number;
}

/**
 * Israeli document type metadata
 */
export interface DocumentType {
  nameHE: string;
  nameFR: string;
  description: string;
}

/**
 * French-Hebrew glossary entry
 */
export interface GlossaryEntry {
  hebrew: string;
  french: string;
  category: string;
  explanation: string;
}

// ============================================================================
// DATA EXPORTS
// ============================================================================

/**
 * Israeli Labor Law 2025 - Core employment regulations
 * Based on Ministry of Labor and Social Services official rates
 */
export const LABOR_LAW_2025: LaborLaw = {
  minimumWage: {
    monthly: 6247,
    hourly: 34.33,
    updatedDate: "2025-04-01",
  },
  workWeek: {
    maxHours: 42, // 42 hours/week standard (5-day), 43 for 6-day per law
    standardDays: 5, // Most workplaces operate on 5-day week since Tzo Harchava
  },
  overtime: {
    first2Hours: 1.25, // 125% for first 2 overtime hours
    beyond2Hours: 1.5, // 150% beyond 2 overtime hours
    shabbat: 1.5, // 150% on Shabbat
    holiday: 1.5, // 150% on holidays (+ 100% holiday pay = effectively 250%)
  },
  // Backward-compatible: 6-day week law table (bruto days incl. Shabbat)
  annualLeave: [
    { minYears: 1, maxYears: 4, days: 14, netDays: 14, brutoDays: 16 },
    { minYears: 5, maxYears: 5, days: 14, netDays: 14, brutoDays: 16 },
    { minYears: 6, maxYears: 6, days: 16, netDays: 16, brutoDays: 18 },
    { minYears: 7, maxYears: 7, days: 18, netDays: 18, brutoDays: 21 },
    { minYears: 8, maxYears: 8, days: 19, netDays: 19, brutoDays: 22 },
    { minYears: 9, maxYears: 9, days: 20, netDays: 20, brutoDays: 23 },
    { minYears: 10, maxYears: 10, days: 21, netDays: 21, brutoDays: 24 },
    { minYears: 11, maxYears: 11, days: 22, netDays: 22, brutoDays: 25 },
    { minYears: 12, maxYears: 12, days: 23, netDays: 23, brutoDays: 26 },
    { minYears: 13, maxYears: 13, days: 24, netDays: 24, brutoDays: 27 },
    { minYears: 14, maxYears: 999, days: 24, netDays: 24, brutoDays: 28 },
  ],
  // Full detailed schedule validated from Kol Zchut (ÃÂÃÂ-ÃÂÃÂÃÂÃÂª)
  annualLeaveSchedule: {
    // === 5-DAY WORK WEEK ===
    fiveDayWeek: {
      // Most workplaces: Tzo Harchava (extension order) applies to most sectors
      // (industry, security, cleaning, import/export, offices, etc.)
      withTzoHarchava: [
        { minYears: 1, maxYears: 4, days: 12, netDays: 12, brutoDays: 16 },
        { minYears: 5, maxYears: 5, days: 12, netDays: 12, brutoDays: 16 },
        { minYears: 6, maxYears: 8, days: 17, netDays: 17, brutoDays: 23 },
        { minYears: 9, maxYears: 999, days: 23, netDays: 23, brutoDays: 31 },
      ],
      // Law only: for workplaces where Tzo Harchava does NOT apply
      // (fewer than 4 employees, household workers, gov companies, etc.)
      withoutTzoHarchava: [
        { minYears: 1, maxYears: 4, days: 12, netDays: 12, brutoDays: 16 },
        { minYears: 5, maxYears: 5, days: 12, netDays: 12, brutoDays: 16 },
        { minYears: 6, maxYears: 6, days: 12, netDays: 12, brutoDays: 18 },
        { minYears: 7, maxYears: 7, days: 15, netDays: 15, brutoDays: 21 },
        { minYears: 8, maxYears: 8, days: 16, netDays: 16, brutoDays: 22 },
        { minYears: 9, maxYears: 9, days: 17, netDays: 17, brutoDays: 23 },
        { minYears: 10, maxYears: 10, days: 18, netDays: 18, brutoDays: 24 },
        { minYears: 11, maxYears: 11, days: 19, netDays: 19, brutoDays: 25 },
        { minYears: 12, maxYears: 12, days: 20, netDays: 20, brutoDays: 26 },
        { minYears: 13, maxYears: 13, days: 20, netDays: 20, brutoDays: 27 },
        { minYears: 14, maxYears: 999, days: 20, netDays: 20, brutoDays: 28 },
      ],
    },
    // === 6-DAY WORK WEEK (law) ===
    // 6/7 ratio: 6 actual work days off per 7 calendar days of leave
    sixDayWeek: [
      { minYears: 1, maxYears: 4, days: 14, netDays: 14, brutoDays: 16 },
      { minYears: 5, maxYears: 5, days: 14, netDays: 14, brutoDays: 16 },
      { minYears: 6, maxYears: 6, days: 16, netDays: 16, brutoDays: 18 },
      { minYears: 7, maxYears: 7, days: 18, netDays: 18, brutoDays: 21 },
      { minYears: 8, maxYears: 8, days: 19, netDays: 19, brutoDays: 22 },
      { minYears: 9, maxYears: 9, days: 20, netDays: 20, brutoDays: 23 },
      { minYears: 10, maxYears: 10, days: 21, netDays: 21, brutoDays: 24 },
      { minYears: 11, maxYears: 11, days: 22, netDays: 22, brutoDays: 25 },
      { minYears: 12, maxYears: 12, days: 23, netDays: 23, brutoDays: 26 },
      { minYears: 13, maxYears: 13, days: 24, netDays: 24, brutoDays: 27 },
      { minYears: 14, maxYears: 999, days: 24, netDays: 24, brutoDays: 28 },
    ],
    notes: [
      "Source: Kol Zchut (ÃÂÃÂ-ÃÂÃÂÃÂÃÂª) - site officiel des droits en IsraÃÂ«l",
      "Les jours bruto incluent les jours de repos hebdomadaire (vendredi+samedi pour 5j, samedi pour 6j)",
      "5j/semaine: 5 jours de repos effectifs pour chaque 7 jours bruto de congÃÂ©",
      "6j/semaine: 6 jours de repos effectifs pour chaque 7 jours bruto de congÃÂ©",
      "Pour bÃÂ©nÃÂ©ficier du quota complet: avoir travaillÃÂ© au moins 200 jours dans l'annÃÂ©e (employÃÂ© toute l'annÃÂ©e) ou 240 jours (employÃÂ© une partie de l'annÃÂ©e)",
      "Sinon: calcul proportionnel = (jours travaillÃÂ©s / 200 ou 240) ÃÂ quota bruto",
      "Le Tzo Harchava s'applique ÃÂ  la majoritÃÂ© des secteurs: industrie, commerce, sÃÂ©curitÃÂ©, nettoyage, bureaux, import/export, etc.",
      "Ne s'applique PAS aux: < 4 employÃÂ©s, employÃÂ©s de maison, sociÃÂ©tÃÂ©s gouvernementales, sociÃÂ©tÃÂ©s municipales",
      "Jeunes (< 18 ans): 18 jours de congÃÂ© quelle que soit l'anciennetÃÂ©",
    ],
  },
  sickLeave: {
    accrualPerMonth: 1.5, // 1.5 days per month
    maxAccumulation: 90, // max 90 days cumulated
    firstDayPaid: false, // Day 1 = unpaid (yom hamilouta)
    day2_3Rate: 0.5, // Days 2-3 = 50% pay
    day4PlusRate: 1.0, // Day 4+ = 100% pay
  },
  severance: {
    monthsPerYear: 1, // 1 month salary per year of work
    minTenure: 12, // minimum 12 months for eligibility
    noticePeriod: {
      // Monthly salary employee:
      under6Months: "1 jour par mois travaillÃÂ© (ex: 4 mois = 4 jours calendaires)",
      months6to12: "1 jour par mois pour les 6 premiers mois + 2,5 jours par mois complet supplÃÂ©mentaire (ex: 9 mois = 6 + 7,5 = 13,5 jours)",
      over1Year: "1 mois complet (30 jours calendaires)",
      // Hourly/daily salary employee:
      // Year 1: 1 day per month worked
      // Year 2: 14 days + 1 day per 2 months in year 2
      // Year 3: 21 days + 1 day per 2 months in year 3
      // 3+ years: 1 month (30 days)
    },
  },
  // Havraah (ÃÂÃÂÃÂ ÃÂÃÂÃÂ¨ÃÂÃÂ) - validated from Kol Zchut
  // Private sector daily rate: 418Ã¢ÂÂª (frozen since 2023, same for 2024-2025)
  // Public sector daily rate: 471.4Ã¢ÂÂª
  recuperation: {
    name: "ÃÂÃÂÃÂ ÃÂÃÂÃÂ¨ÃÂÃÂ",
    daysPerYear: [
      { minYears: 1, maxYears: 1, days: 5, netDays: 5, brutoDays: 5 },
      { minYears: 2, maxYears: 3, days: 6, netDays: 6, brutoDays: 6 },
      { minYears: 4, maxYears: 10, days: 7, netDays: 7, brutoDays: 7 },
      { minYears: 11, maxYears: 15, days: 8, netDays: 8, brutoDays: 8 },
      { minYears: 16, maxYears: 19, days: 9, netDays: 9, brutoDays: 9 },
      { minYears: 20, maxYears: 999, days: 10, netDays: 10, brutoDays: 10 },
    ],
    dailyRate: 418, // Ã¢ÂÂª per day, private sector (frozen since 2023)
  },
  travelAllowance: {
    maxDaily: 22.6,
  },
};

/**
 * National Insurance (Bituach Leumi) & Health Insurance 2025
 * Employee and employer contribution rates
 */
export const BITUACH_LEUMI_2025: BituachLeumiRates = {
  employee: {
    lowRate: 0.004,
    highRate: 0.07,
    threshold: 7122,
  },
  employer: {
    lowRate: 0.0451,
    highRate: 0.076,
  },
  healthInsurance: {
    employeeLowRate: 0.031,
    employeeHighRate: 0.05,
    employerLowRate: 0.0323,
    employerHighRate: 0.0517,
  },
  maxMonthlyIncome: 50695,
  selfEmployed: {
    lowRate: 0.0447,
    highRate: 0.0788,
  },
};

/**
 * Income Tax Brackets 2025
 * Progressive tax system with brackets for Israeli residents
 */
export const INCOME_TAX_2025: IncomeTax = {
  brackets: [
    { from: 0, to: 7010, rate: 0.1 },
    { from: 7011, to: 10060, rate: 0.14 },
    { from: 10061, to: 16150, rate: 0.2 },
    { from: 16151, to: 22440, rate: 0.31 },
    { from: 22441, to: 46690, rate: 0.35 },
    { from: 46691, to: 60130, rate: 0.47 },
    { from: 60131, to: Infinity, rate: 0.5 },
  ],
  creditPoints: {
    value: 235,
    olimMonths: 42,
    olimPoints: 4.5,
  },
};

/**
 * Education/Study Fund (Keren Hishtalmut) 2025
 * Mandatory contribution for employee professional development
 */
export const KEREN_HISHTALMUT: KerenHishtalmut = {
  employee: {
    standardRate: 0.025,
    maxRate: 0.05,
  },
  employer: {
    standardRate: 0.075,
    maxRate: 0.075,
  },
  withdrawalYears: 6,
  educationWithdrawalYears: 3,
  taxFreeCapitalGains: true,
};

/**
 * Pension/Provident Fund (Keren Pensia) 2025
 * Mandatory retirement savings for employees and employers
 */
export const PENSION_2025: Pension = {
  employee: {
    minRate: 0.06,
  },
  employer: {
    minRate: 0.065,
    severanceComponent: 0.0833,
  },
  mandatory: true,
  afterMonths: 6,
};

/**
 * Maternity & Paternity Benefits 2025
 * Statutory benefits for new parents
 */
export const MATERNITY_2025: MaternityBenefits = {
  duration: {
    weeks: 15,
    extensionMultipleBirth: 3,
  },
  paternity: {
    partnerWeeks: 1,
    additionalIfMotherConsents: true,
  },
  eligibility: {
    minContributionMonths: 10,
    within14Months: true,
    or15MonthsWithin22: true,
  },
  protectedPeriod: {
    monthsAfterReturn: 2,
  },
  allowance: {
    basedOnSalary: true,
    maxDaily: 1711.33,
  },
};

/**
 * Olim (New Immigrants) Rights & Benefits 2025-2026
 * Comprehensive list of rights available to new immigrants to Israel
 */
export const OLIM_RIGHTS: OlimRight[] = [
  {
    id: "sal-klita",
    titleFR: "Panier d'intÃÂ©gration (Sal Klita)",
    titleHE: "ÃÂ¡ÃÂ ÃÂ§ÃÂÃÂÃÂÃÂ",
    description:
      "Package d'aide directe versÃÂ©e en 8 paiements mensuels. Montant total d'environ 25 000Ã¢ÂÂª. DestinÃÂ© ÃÂ  couvrir les frais initiaux d'installation et d'intÃÂ©gration en IsraÃÂ«l.",
    amount: "~25,000Ã¢ÂÂª total",
    duration: "6 mois",
    deadline: "DÃÂ¨s l'arrivÃÂ©e",
    eligibility: "Olim enregistrÃÂ©s auprÃÂ¨s du MinistÃÂ¨re de l'Absorption",
    howToClaim:
      "1. S'enregistrer auprÃÂ¨s du MinistÃÂ¨re de l'Absorption (Misrad Haklita) dans les 30 jours. 2. PrÃÂ©senter le passeport et le visa d'olÃÂ©. 3. Les paiements sont versÃÂ©s automatiquement si vous ÃÂªtes enregistrÃÂ©.",
    category: "financial",
    priority: "high",
    updatedYear: 2025,
  },
  {
    id: "tax-credit-points",
    titleFR: "Points de crÃÂ©dit d'impÃÂ´t (Nekudot Zikui)",
    titleHE: "ÃÂ ÃÂ§ÃÂÃÂÃÂÃÂª ÃÂÃÂÃÂÃÂÃÂ",
    description:
      "CrÃÂ©dit d'impÃÂ´t annuel de 4,5 points supplÃÂ©mentaires pour les 42 premiers mois. Chaque point vaut environ 235Ã¢ÂÂª par mois. RÃÂ©duit directement vos impÃÂ´ts mensuels.",
    amount: "~235Ã¢ÂÂª par point/mois",
    duration: "42 mois",
    deadline: "Automatique",
    eligibility: "Tous les olim, olimim dÃÂ©clarÃÂ©s",
    howToClaim:
      "1. DÃÂ©clarer le statut d'olÃÂ© ÃÂ  l'administration fiscale (Misrad Hareset). 2. Fournir la preuve du visa d'olÃÂ©. 3. Le crÃÂ©dit est automatiquement appliquÃÂ© ÃÂ  votre dÃÂ©claration de revenus.",
    category: "tax",
    priority: "high",
    updatedYear: 2025,
  },
  {
    id: "foreign-income-exemption",
    titleFR: "Exemption de l'impÃÂ´t sur les revenus ÃÂ©trangers",
    titleHE: "ÃÂ¤ÃÂÃÂÃÂ¨ ÃÂÃÂ¡ ÃÂÃÂÃÂ ÃÂ¡ÃÂ ÃÂ¢ÃÂÃÂ´ÃÂ",
    description:
      "Les revenus gÃÂ©nÃÂ©rÃÂ©s en dehors d'IsraÃÂ«l sont exonÃÂ©rÃÂ©s d'impÃÂ´t pour 10 ans. Aucune dÃÂ©claration requise avant 2026. ÃÂ partir de 2026, dÃÂ©claration obligatoire aux autoritÃÂ©s fiscales.",
    amount: null,
    duration: "10 ans",
    deadline: "DÃÂ©claration requise ÃÂ  partir de 2026",
    eligibility: "Olim avec revenus ÃÂ©trangers (indÃÂ©pendants, pensions, dividendes)",
    howToClaim:
      "1. Avant 2026 : Aucune dÃÂ©claration requise, exemption automatique. 2. ÃÂ partir de 2026 : DÃÂ©clarer les revenus ÃÂ©trangers ÃÂ  Misrad Hareset avec preuve de source ÃÂ©trangÃÂ¨re. 3. Conserver les documents justificatifs de revenus ÃÂ©trangers.",
    category: "tax",
    priority: "high",
    updatedYear: 2026,
  },
  {
    id: "israeli-income-exemption",
    titleFR: "Exemption de l'impÃÂ´t sur les revenus israÃÂ©liens (NOUVEAU 2026)",
    titleHE: "ÃÂ¤ÃÂÃÂÃÂ¨ ÃÂÃÂÃÂ ÃÂ¡ÃÂ ÃÂÃÂ©ÃÂ¨ÃÂÃÂÃÂÃÂª ÃÂÃÂÃÂ© 2026",
    description:
      "Les nouveaux olim peuvent ÃÂªtre exonÃÂ©rÃÂ©s jusqu'ÃÂ  1 million de shÃÂ©quels par an de revenus israÃÂ©liens pour les deux premiÃÂ¨res annÃÂ©es fiscales. DÃÂ©cision gouvernementale de 2026.",
    amount: "Jusqu'ÃÂ  1MÃ¢ÂÂª/an",
    duration: "2 ans fiscaux",
    deadline: "ÃÂ partir de 2026",
    eligibility: "Olim enregistrÃÂ©s aprÃÂ¨s 2024, revenus israÃÂ©liens",
    howToClaim:
      "1. Demander l'exemption auprÃÂ¨s de Misrad Hareset. 2. PrÃÂ©senter la preuve du statut d'olÃÂ© et la date d'arrivÃÂ©e. 3. Appliquer l'exemption sur votre dÃÂ©claration fiscale pour les deux premiÃÂ¨res annÃÂ©es fiscales.",
    category: "tax",
    priority: "high",
    updatedYear: 2026,
  },
  {
    id: "arnona-reduction",
    titleFR: "RÃÂ©duction de la taxe fonciÃÂ¨re (Arnona)",
    titleHE: "ÃÂÃÂ ÃÂÃÂ ÃÂ¢ÃÂ ÃÂÃÂ¨ÃÂ ÃÂÃÂ ÃÂ",
    description:
      "RÃÂ©duction de 25-33% sur la taxe fonciÃÂ¨re (arnona) pour les habitations rÃÂ©sidentielles principales pendant 12 mois suivant l'arrivÃÂ©e.",
    amount: "25-33% de rÃÂ©duction",
    duration: "12 mois",
    deadline: "DÃÂ¨s l'enregistrement de propriÃÂ©tÃÂ©",
    eligibility: "Olim propriÃÂ©taires de leur rÃÂ©sidence principale",
    howToClaim:
      "1. S'enregistrer auprÃÂ¨s de la municipalitÃÂ© locale avec preuve du statut d'olÃÂ©. 2. PrÃÂ©senter le contrat de propriÃÂ©tÃÂ© et le visa d'olÃÂ©. 3. La municipalitÃÂ© applique la rÃÂ©duction automatiquement sur la prochaine facture d'arnona.",
    category: "financial",
    priority: "medium",
    updatedYear: 2025,
  },
  {
    id: "tv-license-exemption",
    titleFR: "Exemption de taxe tÃÂ©lÃÂ©vision",
    titleHE: "ÃÂ¤ÃÂÃÂÃÂ¨ ÃÂÃÂ¨ÃÂ©ÃÂÃÂÃÂ ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ",
    description:
      "Exemption de la taxe tÃÂ©lÃÂ©vision (redevance tÃÂ©lÃÂ©visuelle) pour 12 mois. Tarif normal : environ 80Ã¢ÂÂª par mois.",
    amount: "~80Ã¢ÂÂª/mois",
    duration: "12 mois",
    deadline: "DÃÂ¨s la demande",
    eligibility: "Tous les olim enregistrÃÂ©s",
    howToClaim:
      "1. Contacter la SociÃÂ©tÃÂ© de Radiodiffusion IsraÃÂ©lienne (Rashut Hashidur). 2. PrÃÂ©senter le visa d'olÃÂ© et la preuve d'enregistrement. 3. L'exemption est appliquÃÂ©e au compte pour 12 mois.",
    category: "financial",
    priority: "low",
    updatedYear: 2025,
  },
  {
    id: "customs-duty-exemption",
    titleFR: "Exemption des droits de douane - biens personnels et automobile",
    titleHE: "ÃÂ¤ÃÂÃÂÃÂ¨ ÃÂÃÂÃÂÃÂÃÂ ÃÂÃÂÃÂÃÂÃÂ§ÃÂ¡",
    description:
      "Exemption des droits de douane sur les biens personnels et possessions transportÃÂ©s depuis le pays d'origine. PossibilitÃÂ© d'importer une voiture d'occasion sans droits de douane si ÃÂ©ligible.",
    amount: null,
    duration: "Permanent",
    deadline: "Dans les 12 mois suivant l'arrivÃÂ©e",
    eligibility: "Olim avec biens personnels. Automobile : conditions spÃÂ©cifiques d'ÃÂ¢ge et de valeur",
    howToClaim:
      "1. Contacter les douanes israÃÂ©liennes (Misrad Misuim). 2. Remplir le formulaire d'importation d'olÃÂ© avec liste des biens. 3. Pour automobile : consulter l'administration pour les conditions de tarif rÃÂ©duit. 4. Fournir la preuve du statut d'olÃÂ© et des documents d'ownership.",
    category: "financial",
    priority: "medium",
    updatedYear: 2025,
  },
  {
    id: "ulpan-hebrew",
    titleFR: "Cours d'hÃÂ©breu gratuit (Ulpan)",
    titleHE: "ÃÂ§ÃÂÃÂ¨ÃÂ¡ ÃÂ¢ÃÂÃÂ¨ÃÂÃÂª ÃÂÃÂÃÂ ÃÂ - ÃÂÃÂÃÂÃÂ¤ÃÂ",
    description:
      "Programme gratuit d'enseignement intensif de l'hÃÂ©breu : 500 heures de cours sur plusieurs mois. Offert par le MinistÃÂ¨re de l'Absorption pour tous les olim.",
    amount: null,
    duration: "3-6 mois",
    deadline: "DÃÂ¨s l'arrivÃÂ©e",
    eligibility: "Tous les olim enregistrÃÂ©s",
    howToClaim:
      "1. S'enregistrer au Misrad Haklita (MinistÃÂ¨re de l'Absorption). 2. Demander l'accÃÂ¨s ÃÂ  un programme ulpan. 3. Choisir un ulpan (public, kibboutz, ou acadÃÂ©mique). 4. Commencer les cours - gÃÂ©nÃÂ©ralement gratuits ou ÃÂ  coÃÂ»t rÃÂ©duit.",
    category: "education",
    priority: "high",
    updatedYear: 2025,
  },
  {
    id: "housing-assistance",
    titleFR: "Assistance au logement (prÃÂªts et subventions)",
    titleHE: "ÃÂ¡ÃÂÃÂÃÂ¢ ÃÂÃÂÃÂÃÂ¨",
    description:
      "Le Misrad Haklita propose des prÃÂªts sans intÃÂ©rÃÂªt et des subventions pour l'achat ou la location d'un logement. Les conditions varient selon le profil et la rÃÂ©gion.",
    amount: "Variable selon profil",
    duration: "Variable",
    deadline: "DÃÂ¨s l'enregistrement",
    eligibility: "Olim avec demande prouvÃÂ©e. PrioritÃÂ© aux profils dÃÂ©favorisÃÂ©s et zones pÃÂ©riphÃÂ©riques.",
    howToClaim:
      "1. Contacter le Misrad Haklita localement ou en ligne. 2. PrÃÂ©senter preuve de revenus et demande de logement. 3. Remplir les formulaires d'aide au logement. 4. Attendre ÃÂ©valuation et approbation. 5. Les prÃÂªts sont gÃÂ©nÃÂ©ralement sans intÃÂ©rÃÂªt et remboursables sur plusieurs annÃÂ©es.",
    category: "housing",
    priority: "high",
    updatedYear: 2025,
  },
  {
    id: "health-insurance",
    titleFR: "Assurance maladie (Kupat Holim)",
    titleHE: "ÃÂÃÂÃÂÃÂÃÂ ÃÂÃÂ¨ÃÂÃÂÃÂÃÂª ÃÂ§ÃÂÃÂ¤ÃÂª ÃÂÃÂÃÂÃÂÃÂ",
    description:
      "AccÃÂ¨s immÃÂ©diat ÃÂ  l'assurance maladie avec choix entre 4 fournisseurs de soins : Clalit, Maccabi, Leumit, Meuhedet. Couverture complÃÂ¨te dÃÂ¨s l'arrivÃÂ©e.",
    amount: null,
    duration: "Permanent",
    deadline: "DÃÂ¨s l'arrivÃÂ©e",
    eligibility: "Tous les olim - obligation lÃÂ©gale",
    howToClaim:
      "1. S'enregistrer auprÃÂ¨s du Bituach Leumi (SÃÂ©curitÃÂ© Sociale) dÃÂ¨s l'arrivÃÂ©e. 2. Choisir une Kupat Holim (provider de santÃÂ©). 3. S'inscrire auprÃÂ¨s de votre provider choisi. 4. Recevoir la couverture santÃÂ© immÃÂ©diatement et complÃÂ¨te.",
    category: "health",
    priority: "high",
    updatedYear: 2025,
  },
  {
    id: "university-tuition-reduction",
    titleFR: "RÃÂ©duction des frais de scolaritÃÂ© universitaires",
    titleHE: "ÃÂÃÂ ÃÂÃÂ ÃÂ¢ÃÂ ÃÂÃÂÃÂÃÂÃÂÃÂÃÂ ÃÂÃÂÃÂ ÃÂÃÂÃÂ¨ÃÂ¡ÃÂÃÂÃÂÃÂÃÂÃÂ",
    description:
      "Les ÃÂ©tudiants olim reÃÂ§oivent une rÃÂ©duction significative des frais d'inscription et de scolaritÃÂ© dans les universitÃÂ©s israÃÂ©liennes (gÃÂ©nÃÂ©ralement 30-50% de rÃÂ©duction).",
    amount: "30-50% de rÃÂ©duction",
    duration: "DurÃÂ©e des ÃÂ©tudes",
    deadline: "ÃÂ l'inscription",
    eligibility: "Olim ÃÂ©tudiants dans universitÃÂ©s israÃÂ©liennes reconnues",
    howToClaim:
      "1. Contacter le bureau des ÃÂ©tudiants olim de l'universitÃÂ©. 2. PrÃÂ©senter le visa d'olÃÂ© et preuve d'enregistrement. 3. Remplir formulaire de demande de rÃÂ©duction. 4. Les frais rÃÂ©duits sont appliquÃÂ©s automatiquement ÃÂ  l'inscription.",
    category: "education",
    priority: "medium",
    updatedYear: 2025,
  },
  {
    id: "employment-assistance",
    titleFR: "Assistance ÃÂ  l'emploi et centres d'orientation",
    titleHE: "ÃÂ¡ÃÂÃÂÃÂ¢ ÃÂÃÂÃÂ¢ÃÂ¡ÃÂ§ÃÂ",
    description:
      "Les centres pour l'emploi (Misrad HaTa'asuka) offrent des services gratuits : aide ÃÂ  la rÃÂ©daction CV, prÃÂ©paration entretien, placement professionnel, formation professionnelle.",
    amount: null,
    duration: "Services continus",
    deadline: "DÃÂ¨s l'enregistrement",
    eligibility: "Tous les olim cherchant emploi",
    howToClaim:
      "1. Visiter le centre pour l'emploi local (Misrad HaTa'asuka). 2. S'enregistrer en tant que demandeur d'emploi olÃÂ©. 3. BÃÂ©nÃÂ©ficier de conseils en orientation professionnelle. 4. AccÃÂ©der ÃÂ  offres d'emploi et programmes de formation.",
    category: "employment",
    priority: "high",
    updatedYear: 2025,
  },
  {
    id: "keren-klita",
    titleFR: "Keren Klita - subventions d'absorption pour professions spÃÂ©cifiques",
    titleHE: "ÃÂ§ÃÂ¨ÃÂ ÃÂ§ÃÂÃÂÃÂÃÂ",
    description:
      "Subventions et bourses additionnelles pour olim dans certaines professions prioritaires : enseignement, secteur hi-tech, santÃÂ©, agriculture, startup. Montants variables selon profession.",
    amount: "Variable par profession",
    duration: "Variable",
    deadline: "ÃÂ vÃÂ©rifier par profession",
    eligibility: "Olim dans professions dÃÂ©signÃÂ©es, avec qualifications",
    howToClaim:
      "1. Identifier si votre profession bÃÂ©nÃÂ©ficie du Keren Klita (consulter Misrad Haklita). 2. Rassembler certificats de qualification et diplÃÂ´mes ÃÂ©trangers. 3. Demander reconnaissance de diplÃÂ´mes si nÃÂ©cessaire. 4. Soumettre demande auprÃÂ¨s de l'organisme gestionnaire du Keren Klita.",
    category: "financial",
    priority: "medium",
    updatedYear: 2025,
  },
  {
    id: "right-to-vote",
    titleFR: "Droit de vote et participation politique",
    titleHE: "ÃÂÃÂÃÂÃÂª ÃÂÃÂÃÂÃÂ¨ÃÂ",
    description:
      "Les olim peuvent voter et se prÃÂ©senter aux ÃÂ©lections une fois citoyens israÃÂ©liens. AccÃÂ¨s ÃÂ  la citoyennetÃÂ© simplifiÃÂ©e via la Loi du Retour aprÃÂ¨s 3 ans de rÃÂ©sidence.",
    amount: null,
    duration: "AprÃÂ¨s 3 ans ou plus",
    deadline: "AprÃÂ¨s naturalisation",
    eligibility: "Olim devenant citoyens israÃÂ©liens",
    howToClaim:
      "1. RÃÂ©sider en IsraÃÂ«l pour la durÃÂ©e requise (gÃÂ©nÃÂ©ralement 3 ans minimum). 2. Demander la citoyennetÃÂ© auprÃÂ¨s du MinistÃÂ¨re de l'IntÃÂ©rieur. 3. Recevoir le certificat de citoyennetÃÂ© israÃÂ©lienne. 4. Vous pouvez alors voter et vous prÃÂ©senter aux ÃÂ©lections.",
    category: "employment",
    priority: "low",
    updatedYear: 2025,
  },
];

/**
 * Document Types - Israeli documents scannable and processable by Tloush
 */
export const DOCUMENT_TYPES: Record<string, DocumentType> = {
  payslip: {
    nameHE: "ÃÂªÃÂÃÂÃÂ© ÃÂ©ÃÂÃÂ¨",
    nameFR: "Fiche de paie",
    description:
      "Document mensuel dÃÂ©taillant salaire brut, dÃÂ©ductions, cotisations sociales et montant net. UtilisÃÂ© pour vÃÂ©rifier revenus et calculs de paie.",
  },
  employmentContract: {
    nameHE: "ÃÂÃÂÃÂÃÂ ÃÂ¢ÃÂÃÂÃÂÃÂ",
    nameFR: "Contrat de travail",
    description:
      "Accord lÃÂ©gal entre employeur et employÃÂ© dÃÂ©finissant termes d'emploi, salaire, heures, droits et obligations.",
  },
  terminationLetter: {
    nameHE: "ÃÂÃÂÃÂªÃÂ ÃÂ¤ÃÂÃÂÃÂÃÂ¨ÃÂÃÂ",
    nameFR: "Lettre de licenciement",
    description:
      "Document officiel notifiant la fin de contrat de travail. Inclut date effective, raison, et droits ÃÂ  indemnitÃÂ©s de licenciement.",
  },
  taxAssessment: {
    nameHE: "ÃÂ©ÃÂÃÂÃÂª ÃÂÃÂ¡",
    nameFR: "Avis d'imposition",
    description:
      "Document du Misrad Hareset (administration fiscale) dÃÂ©taillant revenus imposables, impÃÂ´ts dus, et crÃÂ©dits d'impÃÂ´t appliquÃÂ©s.",
  },
  officialLetter: {
    nameHE: "ÃÂÃÂÃÂªÃÂ ÃÂ¨ÃÂ©ÃÂÃÂ",
    nameFR: "Lettre officielle",
    description:
      "Correspondance officielle de gouvernement israÃÂ©lien, municipalitÃÂ©, ou institution. Peut concerner impÃÂ´ts, allocations, enregistrement, etc.",
  },
  lease: {
    nameHE: "ÃÂÃÂÃÂÃÂ ÃÂ©ÃÂÃÂÃÂ¨ÃÂÃÂª",
    nameFR: "Contrat de location",
    description:
      "Accord de location pour rÃÂ©sidence ou propriÃÂ©tÃÂ©. DÃÂ©finit loyer, conditions, durÃÂ©e bail, et droits/obligations propriÃÂ©taire et locataire.",
  },
  bituachLeumiLetter: {
    nameHE: "ÃÂÃÂÃÂªÃÂ ÃÂÃÂÃÂÃÂÃÂ ÃÂÃÂÃÂÃÂÃÂ",
    nameFR: "Courrier Bituach Leumi",
    description:
      "Correspondance du Bituach Leumi (SÃÂ©curitÃÂ© Sociale israÃÂ©lienne) concernant cotisations, droits aux allocations, statut d'assurÃÂ©.",
  },
};

/**
 * French-Hebrew Glossary
 * 50+ administrative and labor law terms in French and Hebrew
 */
export const FRENCH_HEBREW_GLOSSARY: GlossaryEntry[] = [
  {
    hebrew: "ÃÂ©ÃÂÃÂ¨",
    french: "Salaire",
    category: "salaire",
    explanation:
      "RÃÂ©munÃÂ©ration versÃÂ©e par l'employeur ÃÂ  l'employÃÂ© pour travail effectuÃÂ©.",
  },
  {
    hebrew: "ÃÂ©ÃÂÃÂ¨ ÃÂÃÂÃÂ ÃÂÃÂÃÂÃÂ",
    french: "Salaire minimum",
    category: "salaire",
    explanation:      "Salaire minimal légal fixé par le gouvernement israélien. Tout employeur est tenu de verser au moins ce montant. Révisé périodiquement.",
  },
];
