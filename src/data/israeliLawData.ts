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
 * Recuperation days (××× ×××¨××) - additional paid days for long service
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
  // Full detailed schedule validated from Kol Zchut (××-××××ª)
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
      "Source: Kol Zchut (××-××××ª) - site officiel des droits en IsraÃ«l",
      "Les jours bruto incluent les jours de repos hebdomadaire (vendredi+samedi pour 5j, samedi pour 6j)",
      "5j/semaine: 5 jours de repos effectifs pour chaque 7 jours bruto de congÃ©",
      "6j/semaine: 6 jours de repos effectifs pour chaque 7 jours bruto de congÃ©",
      "Pour bÃ©nÃ©ficier du quota complet: avoir travaillÃ© au moins 200 jours dans l'annÃ©e (employÃ© toute l'annÃ©e) ou 240 jours (employÃ© une partie de l'annÃ©e)",
      "Sinon: calcul proportionnel = (jours travaillÃ©s / 200 ou 240) Ã quota bruto",
      "Le Tzo Harchava s'applique Ã  la majoritÃ© des secteurs: industrie, commerce, sÃ©curitÃ©, nettoyage, bureaux, import/export, etc.",
      "Ne s'applique PAS aux: < 4 employÃ©s, employÃ©s de maison, sociÃ©tÃ©s gouvernementales, sociÃ©tÃ©s municipales",
      "Jeunes (< 18 ans): 18 jours de congÃ© quelle que soit l'anciennetÃ©",
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
      under6Months: "1 jour par mois travaillÃ© (ex: 4 mois = 4 jours calendaires)",
      months6to12: "1 jour par mois pour les 6 premiers mois + 2,5 jours par mois complet supplÃ©mentaire (ex: 9 mois = 6 + 7,5 = 13,5 jours)",
      over1Year: "1 mois complet (30 jours calendaires)",
      // Hourly/daily salary employee:
      // Year 1: 1 day per month worked
      // Year 2: 14 days + 1 day per 2 months in year 2
      // Year 3: 21 days + 1 day per 2 months in year 3
      // 3+ years: 1 month (30 days)
    },
  },
  // Havraah (××× ×××¨××) - validated from Kol Zchut
  // Private sector daily rate: 418âª (frozen since 2023, same for 2024-2025)
  // Public sector daily rate: 471.4âª
  recuperation: {
    name: "××× ×××¨××",
    daysPerYear: [
      { minYears: 1, maxYears: 1, days: 5, netDays: 5, brutoDays: 5 },
      { minYears: 2, maxYears: 3, days: 6, netDays: 6, brutoDays: 6 },
      { minYears: 4, maxYears: 10, days: 7, netDays: 7, brutoDays: 7 },
      { minYears: 11, maxYears: 15, days: 8, netDays: 8, brutoDays: 8 },
      { minYears: 16, maxYears: 19, days: 9, netDays: 9, brutoDays: 9 },
      { minYears: 20, maxYears: 999, days: 10, netDays: 10, brutoDays: 10 },
    ],
    dailyRate: 418, // âª per day, private sector (frozen since 2023)
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
    titleFR: "Panier d'intÃ©gration (Sal Klita)",
    titleHE: "×¡× ×§××××",
    description:
      "Package d'aide directe versÃ©e en 8 paiements mensuels. Montant total d'environ 25 000âª. DestinÃ© Ã  couvrir les frais initiaux d'installation et d'intÃ©gration en IsraÃ«l.",
    amount: "~25,000âª total",
    duration: "6 mois",
    deadline: "DÃ¨s l'arrivÃ©e",
    eligibility: "Olim enregistrÃ©s auprÃ¨s du MinistÃ¨re de l'Absorption",
    howToClaim:
      "1. S'enregistrer auprÃ¨s du MinistÃ¨re de l'Absorption (Misrad Haklita) dans les 30 jours. 2. PrÃ©senter le passeport et le visa d'olÃ©. 3. Les paiements sont versÃ©s automatiquement si vous Ãªtes enregistrÃ©.",
    category: "financial",
    priority: "high",
    updatedYear: 2025,
  },
  {
    id: "tax-credit-points",
    titleFR: "Points de crÃ©dit d'impÃ´t (Nekudot Zikui)",
    titleHE: "× ×§××××ª ×××××",
    description:
      "CrÃ©dit d'impÃ´t annuel de 4,5 points supplÃ©mentaires pour les 42 premiers mois. Chaque point vaut environ 235âª par mois. RÃ©duit directement vos impÃ´ts mensuels.",
    amount: "~235âª par point/mois",
    duration: "42 mois",
    deadline: "Automatique",
    eligibility: "Tous les olim, olimim dÃ©clarÃ©s",
    howToClaim:
      "1. DÃ©clarer le statut d'olÃ© Ã  l'administration fiscale (Misrad Hareset). 2. Fournir la preuve du visa d'olÃ©. 3. Le crÃ©dit est automatiquement appliquÃ© Ã  votre dÃ©claration de revenus.",
    category: "tax",
    priority: "high",
    updatedYear: 2025,
  },
  {
    id: "foreign-income-exemption",
    titleFR: "Exemption de l'impÃ´t sur les revenus Ã©trangers",
    titleHE: "×¤×××¨ ××¡ ××× ×¡× ×¢××´×",
    description:
      "Les revenus gÃ©nÃ©rÃ©s en dehors d'IsraÃ«l sont exonÃ©rÃ©s d'impÃ´t pour 10 ans. Aucune dÃ©claration requise avant 2026. Ã partir de 2026, dÃ©claration obligatoire aux autoritÃ©s fiscales.",
    amount: null,
    duration: "10 ans",
    deadline: "DÃ©claration requise Ã  partir de 2026",
    eligibility: "Olim avec revenus Ã©trangers (indÃ©pendants, pensions, dividendes)",
    howToClaim:
      "1. Avant 2026 : Aucune dÃ©claration requise, exemption automatique. 2. Ã partir de 2026 : DÃ©clarer les revenus Ã©trangers Ã  Misrad Hareset avec preuve de source Ã©trangÃ¨re. 3. Conserver les documents justificatifs de revenus Ã©trangers.",
    category: "tax",
    priority: "high",
    updatedYear: 2026,
  },
  {
    id: "israeli-income-exemption",
    titleFR: "Exemption de l'impÃ´t sur les revenus israÃ©liens (NOUVEAU 2026)",
    titleHE: "×¤×××¨ ××× ×¡× ××©×¨××××ª ×××© 2026",
    description:
      "Les nouveaux olim peuvent Ãªtre exonÃ©rÃ©s jusqu'Ã  1 million de shÃ©quels par an de revenus israÃ©liens pour les deux premiÃ¨res annÃ©es fiscales. DÃ©cision gouvernementale de 2026.",
    amount: "Jusqu'Ã  1Mâª/an",
    duration: "2 ans fiscaux",
    deadline: "Ã partir de 2026",
    eligibility: "Olim enregistrÃ©s aprÃ¨s 2024, revenus israÃ©liens",
    howToClaim:
      "1. Demander l'exemption auprÃ¨s de Misrad Hareset. 2. PrÃ©senter la preuve du statut d'olÃ© et la date d'arrivÃ©e. 3. Appliquer l'exemption sur votre dÃ©claration fiscale pour les deux premiÃ¨res annÃ©es fiscales.",
    category: "tax",
    priority: "high",
    updatedYear: 2026,
  },
  {
    id: "arnona-reduction",
    titleFR: "RÃ©duction de la taxe fonciÃ¨re (Arnona)",
    titleHE: "×× ×× ×¢× ××¨× ×× ×",
    description:
      "RÃ©duction de 25-33% sur la taxe fonciÃ¨re (arnona) pour les habitations rÃ©sidentielles principales pendant 12 mois suivant l'arrivÃ©e.",
    amount: "25-33% de rÃ©duction",
    duration: "12 mois",
    deadline: "DÃ¨s l'enregistrement de propriÃ©tÃ©",
    eligibility: "Olim propriÃ©taires de leur rÃ©sidence principale",
    howToClaim:
      "1. S'enregistrer auprÃ¨s de la municipalitÃ© locale avec preuve du statut d'olÃ©. 2. PrÃ©senter le contrat de propriÃ©tÃ© et le visa d'olÃ©. 3. La municipalitÃ© applique la rÃ©duction automatiquement sur la prochaine facture d'arnona.",
    category: "financial",
    priority: "medium",
    updatedYear: 2025,
  },
  {
    id: "tv-license-exemption",
    titleFR: "Exemption de taxe tÃ©lÃ©vision",
    titleHE: "×¤×××¨ ××¨×©××× ××××××××",
    description:
      "Exemption de la taxe tÃ©lÃ©vision (redevance tÃ©lÃ©visuelle) pour 12 mois. Tarif normal : environ 80âª par mois.",
    amount: "~80âª/mois",
    duration: "12 mois",
    deadline: "DÃ¨s la demande",
    eligibility: "Tous les olim enregistrÃ©s",
    howToClaim:
      "1. Contacter la SociÃ©tÃ© de Radiodiffusion IsraÃ©lienne (Rashut Hashidur). 2. PrÃ©senter le visa d'olÃ© et la preuve d'enregistrement. 3. L'exemption est appliquÃ©e au compte pour 12 mois.",
    category: "financial",
    priority: "low",
    updatedYear: 2025,
  },
  {
    id: "customs-duty-exemption",
    titleFR: "Exemption des droits de douane - biens personnels et automobile",
    titleHE: "×¤×××¨ ××××× ×××××§×¡",
    description:
      "Exemption des droits de douane sur les biens personnels et possessions transportÃ©s depuis le pays d'origine. PossibilitÃ© d'importer une voiture d'occasion sans droits de douane si Ã©ligible.",
    amount: null,
    duration: "Permanent",
    deadline: "Dans les 12 mois suivant l'arrivÃ©e",
    eligibility: "Olim avec biens personnels. Automobile : conditions spÃ©cifiques d'Ã¢ge et de valeur",
    howToClaim:
      "1. Contacter les douanes israÃ©liennes (Misrad Misuim). 2. Remplir le formulaire d'importation d'olÃ© avec liste des biens. 3. Pour automobile : consulter l'administration pour les conditions de tarif rÃ©duit. 4. Fournir la preuve du statut d'olÃ© et des documents d'ownership.",
    category: "financial",
    priority: "medium",
    updatedYear: 2025,
  },
  {
    id: "ulpan-hebrew",
    titleFR: "Cours d'hÃ©breu gratuit (Ulpan)",
    titleHE: "×§××¨×¡ ×¢××¨××ª ××× × - ××××¤×",
    description:
      "Programme gratuit d'enseignement intensif de l'hÃ©breu : 500 heures de cours sur plusieurs mois. Offert par le MinistÃ¨re de l'Absorption pour tous les olim.",
    amount: null,
    duration: "3-6 mois",
    deadline: "DÃ¨s l'arrivÃ©e",
    eligibility: "Tous les olim enregistrÃ©s",
    howToClaim:
      "1. S'enregistrer au Misrad Haklita (MinistÃ¨re de l'Absorption). 2. Demander l'accÃ¨s Ã  un programme ulpan. 3. Choisir un ulpan (public, kibboutz, ou acadÃ©mique). 4. Commencer les cours - gÃ©nÃ©ralement gratuits ou Ã  coÃ»t rÃ©duit.",
    category: "education",
    priority: "high",
    updatedYear: 2025,
  },
  {
    id: "housing-assistance",
    titleFR: "Assistance au logement (prÃªts et subventions)",
    titleHE: "×¡×××¢ ××××¨",
    description:
      "Le Misrad Haklita propose des prÃªts sans intÃ©rÃªt et des subventions pour l'achat ou la location d'un logement. Les conditions varient selon le profil et la rÃ©gion.",
    amount: "Variable selon profil",
    duration: "Variable",
    deadline: "DÃ¨s l'enregistrement",
    eligibility: "Olim avec demande prouvÃ©e. PrioritÃ© aux profils dÃ©favorisÃ©s et zones pÃ©riphÃ©riques.",
    howToClaim:
      "1. Contacter le Misrad Haklita localement ou en ligne. 2. PrÃ©senter preuve de revenus et demande de logement. 3. Remplir les formulaires d'aide au logement. 4. Attendre Ã©valuation et approbation. 5. Les prÃªts sont gÃ©nÃ©ralement sans intÃ©rÃªt et remboursables sur plusieurs annÃ©es.",
    category: "housing",
    priority: "high",
    updatedYear: 2025,
  },
  {
    id: "health-insurance",
    titleFR: "Assurance maladie (Kupat Holim)",
    titleHE: "××××× ××¨××××ª ×§××¤×ª ×××××",
    description:
      "AccÃ¨s immÃ©diat Ã  l'assurance maladie avec choix entre 4 fournisseurs de soins : Clalit, Maccabi, Leumit, Meuhedet. Couverture complÃ¨te dÃ¨s l'arrivÃ©e.",
    amount: null,
    duration: "Permanent",
    deadline: "DÃ¨s l'arrivÃ©e",
    eligibility: "Tous les olim - obligation lÃ©gale",
    howToClaim:
      "1. S'enregistrer auprÃ¨s du Bituach Leumi (SÃ©curitÃ© Sociale) dÃ¨s l'arrivÃ©e. 2. Choisir une Kupat Holim (provider de santÃ©). 3. S'inscrire auprÃ¨s de votre provider choisi. 4. Recevoir la couverture santÃ© immÃ©diatement et complÃ¨te.",
    category: "health",
    priority: "high",
    updatedYear: 2025,
  },
  {
    id: "university-tuition-reduction",
    titleFR: "RÃ©duction des frais de scolaritÃ© universitaires",
    titleHE: "×× ×× ×¢× ××××××× ××× ×××¨×¡××××××",
    description:
      "Les Ã©tudiants olim reÃ§oivent une rÃ©duction significative des frais d'inscription et de scolaritÃ© dans les universitÃ©s israÃ©liennes (gÃ©nÃ©ralement 30-50% de rÃ©duction).",
    amount: "30-50% de rÃ©duction",
    duration: "DurÃ©e des Ã©tudes",
    deadline: "Ã l'inscription",
    eligibility: "Olim Ã©tudiants dans universitÃ©s israÃ©liennes reconnues",
    howToClaim:
      "1. Contacter le bureau des Ã©tudiants olim de l'universitÃ©. 2. PrÃ©senter le visa d'olÃ© et preuve d'enregistrement. 3. Remplir formulaire de demande de rÃ©duction. 4. Les frais rÃ©duits sont appliquÃ©s automatiquement Ã  l'inscription.",
    category: "education",
    priority: "medium",
    updatedYear: 2025,
  },
  {
    id: "employment-assistance",
    titleFR: "Assistance Ã  l'emploi et centres d'orientation",
    titleHE: "×¡×××¢ ×××¢×¡×§×",
    description:
      "Les centres pour l'emploi (Misrad HaTa'asuka) offrent des services gratuits : aide Ã  la rÃ©daction CV, prÃ©paration entretien, placement professionnel, formation professionnelle.",
    amount: null,
    duration: "Services continus",
    deadline: "DÃ¨s l'enregistrement",
    eligibility: "Tous les olim cherchant emploi",
    howToClaim:
      "1. Visiter le centre pour l'emploi local (Misrad HaTa'asuka). 2. S'enregistrer en tant que demandeur d'emploi olÃ©. 3. BÃ©nÃ©ficier de conseils en orientation professionnelle. 4. AccÃ©der Ã  offres d'emploi et programmes de formation.",
    category: "employment",
    priority: "high",
    updatedYear: 2025,
  },
  {
    id: "keren-klita",
    titleFR: "Keren Klita - subventions d'absorption pour professions spÃ©cifiques",
    titleHE: "×§×¨× ×§××××",
    description:
      "Subventions et bourses additionnelles pour olim dans certaines professions prioritaires : enseignement, secteur hi-tech, santÃ©, agriculture, startup. Montants variables selon profession.",
    amount: "Variable par profession",
    duration: "Variable",
    deadline: "Ã vÃ©rifier par profession",
    eligibility: "Olim dans professions dÃ©signÃ©es, avec qualifications",
    howToClaim:
      "1. Identifier si votre profession bÃ©nÃ©ficie du Keren Klita (consulter Misrad Haklita). 2. Rassembler certificats de qualification et diplÃ´mes Ã©trangers. 3. Demander reconnaissance de diplÃ´mes si nÃ©cessaire. 4. Soumettre demande auprÃ¨s de l'organisme gestionnaire du Keren Klita.",
    category: "financial",
    priority: "medium",
    updatedYear: 2025,
  },
  {
    id: "right-to-vote",
    titleFR: "Droit de vote et participation politique",
    titleHE: "××××ª ××××¨×",
    description:
      "Les olim peuvent voter et se prÃ©senter aux Ã©lections une fois citoyens israÃ©liens. AccÃ¨s Ã  la citoyennetÃ© simplifiÃ©e via la Loi du Retour aprÃ¨s 3 ans de rÃ©sidence.",
    amount: null,
    duration: "AprÃ¨s 3 ans ou plus",
    deadline: "AprÃ¨s naturalisation",
    eligibility: "Olim devenant citoyens israÃ©liens",
    howToClaim:
      "1. RÃ©sider en IsraÃ«l pour la durÃ©e requise (gÃ©nÃ©ralement 3 ans minimum). 2. Demander la citoyennetÃ© auprÃ¨s du MinistÃ¨re de l'IntÃ©rieur. 3. Recevoir le certificat de citoyennetÃ© israÃ©lienne. 4. Vous pouvez alors voter et vous prÃ©senter aux Ã©lections.",
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
    nameHE: "×ª×××© ×©××¨",
    nameFR: "Fiche de paie",
    description:
      "Document mensuel dÃ©taillant salaire brut, dÃ©ductions, cotisations sociales et montant net. UtilisÃ© pour vÃ©rifier revenus et calculs de paie.",
  },
  employmentContract: {
    nameHE: "×××× ×¢××××",
    nameFR: "Contrat de travail",
    description:
      "Accord lÃ©gal entre employeur et employÃ© dÃ©finissant termes d'emploi, salaire, heures, droits et obligations.",
  },
  terminationLetter: {
    nameHE: "×××ª× ×¤××××¨××",
    nameFR: "Lettre de licenciement",
    description:
      "Document officiel notifiant la fin de contrat de travail. Inclut date effective, raison, et droits Ã  indemnitÃ©s de licenciement.",
  },
  taxAssessment: {
    nameHE: "×©×××ª ××¡",
    nameFR: "Avis d'imposition",
    description:
      "Document du Misrad Hareset (administration fiscale) dÃ©taillant revenus imposables, impÃ´ts dus, et crÃ©dits d'impÃ´t appliquÃ©s.",
  },
  officialLetter: {
    nameHE: "×××ª× ×¨×©××",
    nameFR: "Lettre officielle",
    description:
      "Correspondance officielle de gouvernement israÃ©lien, municipalitÃ©, ou institution. Peut concerner impÃ´ts, allocations, enregistrement, etc.",
  },
  lease: {
    nameHE: "×××× ×©×××¨××ª",
    nameFR: "Contrat de location",
    description:
      "Accord de location pour rÃ©sidence ou propriÃ©tÃ©. DÃ©finit loyer, conditions, durÃ©e bail, et droits/obligations propriÃ©taire et locataire.",
  },
  bituachLeumiLetter: {
    nameHE: "×××ª× ××××× ×××××",
    nameFR: "Courrier Bituach Leumi",
    description:
      "Correspondance du Bituach Leumi (SÃ©curitÃ© Sociale israÃ©lienne) concernant cotisations, droits aux allocations, statut d'assurÃ©.",
  },
};

/**
 * French-Hebrew Glossary
 * 50+ administrative and labor law terms in French and Hebrew
 */
export const FRENCH_HEBREW_GLOSSARY: GlossaryEntry[] = [
  {
    hebrew: "×©××¨",
    french: "Salaire",
    category: "salaire",
    explanation:
      "RÃ©munÃ©ration versÃ©e par l'employeur Ã  l'employÃ© pour travail effectuÃ©.",
  },
  {
    hebrew: "×©××¨ ××× ××××",
    french: "Salaire minimum",
    category: "salaire",
    explanation: