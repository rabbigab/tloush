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
 * Recuperation days (דמי הבראה) - additional paid days for long service
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
  // Full detailed schedule validated from Kol Zchut (כל-זכות)
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
        { minYears: 5, maxYears: 5, days: 12, netDays: 12, netDays: 12, brutoDays: 16 },
        { minYears: 6, maxYears: 6, days: 12, netDays: 12, brutoDa     { minYears: 7, maxYears: 7, days: 15, netDays: 15, brutoDays: 21 },
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
      "Source: Kol Zchut (כל-זכות) - site officiel des droits en Israël",
      "Les jours bruto incluent les jours de repos hebdomadaire (vendredi+samedi pour 5j, samedi pour 6j)",
      "5j/semaine: 5 jours de repos effectifs pour chaque 7 jours bruto de congé",
      "6j/semaine: 6 jours de repos effectifs pour chaque 7 jours bruto de congé",
      "Pour bénéficier du quota complet: avoir travaillé au moins 200 jours dans l'année (employé toute l'année) ou 240 jours (employé une partie de l'année)",
      "Sinon: calcul proportionnel = (jours travaillés / 200 ou 240) × quota bruto",
      "Le Tzo Harchava s'applique à la majorité des secteurs: industrie, commerce, sécurité, nettoyage, bureaux, import/export, etc.",
      "Ne s'applique PAS aux: < 4 employés, employés de maison, sociétés gouvernementales, sociétés municipales",
      "Jeunes (< 18 ans): 18 jours de congé quelle que soit l'ancienneté",
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
      under6Months: "1 jour par mois travaillé (ex: 4 mois = 4 jours calendaires)",
      months6to12: "1 jour par mois pour les 6 premiers mois + 2,5 jours par mois complet supplémentaire (ex: 9 mois = 6 + 7,5 = 13,5 jours)",
      over1Year: "1 mois complet (30 jours calendaires)",
      // Hourly/daily salary employee:
      // Year 1: 1 day per month worked
      // Year 2: 14 days + 1 day per 2 months in year 2
      // Year 3: 21 days + 1 day per 2 months in year 3
      // 3+ years: 1 month (30 days)
    },
  },
  // Havraah (דמי הבראה) - validated from Kol Zchut
  // Private sector daily rate: 418₪ (frozen since 2023, same for 2024-2025)
  // Public sector daily rate: 471.4₪
  recuperation: {
    name: "דמי הבראה",
    daysPerYear: [
      { minYears: 1, maxYears: 1, days: 5, netDays: 5, brutoDays: 5 },
      { minYears: 2, maxYears: 3, days: 6, netDays: 6, brutoDays: 6 },
      { minYears: 4, maxYears: 10, days: 7, netDays: 7, brutoDays: 7 },
      { minYears: 11, maxYears: 15, days: 8, netDays: 8, brutoDays: 8 },
      { minYears: 16, maxYears: 19, days: 9, netDays: 9, brutoDays: 9 },
      { minYears: 20, maxYears: 999, days: 10, netDays: 10, brutoDays: 10 },
    ],
    dailyRate: 418, // ₪ per day, private sector (frozen since 2023)
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
    titleFR: "Panier d'intégration (Sal Klita)",
    titleHE: "סל קליטה",
    description:
      "Package d'aide directe versée en 8 paiements mensuels. Montant total d'environ 25 000₪. Destiné à couvrir les frais initiaux d'installation et d'intégration en Israël.",
    amount: "~25,000₪ total",
    duration: "6 mois",
    deadline: "Dès l'arrivée",
    eligibility: "Olim enregistrés auprès du Ministère de l'Absorption",
    howToClaim:
      "1. S'enregistrer auprès du Ministère de l'Absorption (Misrad Haklita) dans les 30 jours. 2. Présenter le passeport et le visa d'olé. 3. Les paiements sont versés automatiquement si vous êtes enregistré.",
    category: "financial",
    priority: "high",
    updatedYear: 2025,
  },
  {
    id: "tax-credit-points",
    titleFR: "Points de crédit d'impôt (Nekudot Zikui)",
    titleHE: "נקודות זיכוי",
    description:
      "Crédit d'impôt annuel de 4,5 points supplémentaires pour les 42 premiers mois. Chaque point vaut environ 235₪ par mois. Réduit directement vos impôts mensuels.",
    amount: "~235₪ par point/mois",
    duration: "42 mois",
    deadline: "Automatique",
    eligibility: "Tous les olim, olimim déclarés",
    howToClaim:
      "1. Déclarer le statut d'olé à l'administration fiscale (Misrad Hareset). 2. Fournir la preuve du visa d'olé. 3. Le crédit est automatiquement appliqué à votre déclaration de revenus.",
    category: "tax",
    priority: "high",
    updatedYear: 2025,
  },
  {
    id: "foreign-income-exemption",
    titleFR: "Exemption de l'impôt sur les revenus étrangers",
    titleHE: "פטור מס הכנסה עו״ד",
    description:
      "Les revenus générés en dehors d'Israël sont exonérés d'impôt pour 10 ans. Aucune déclaration requise avant 2026. À partir de 2026, déclaration obligatoire aux autorités fiscales.",
    amount: null,
    duration: "10 ans",
    deadline: "Déclaration requise à partir de 2026",
    eligibility: "Olim avec revenus étrangers (indépendants, pensions, dividendes)",
    howToClaim:
      "1. Avant 2026 : Aucune déclaration requise, exemption automatique. 2. À partir de 2026 : Déclarer les revenus étrangers à Misrad Hareset avec preuve de source étrangère. 3. Conserver les documents justificatifs de revenus étrangers.",
    category: "tax",
    priority: "high",
    updatedYear: 2026,
  },
  {
    id: "israeli-income-exemption",
    titleFR: "Exemption de l'impôt sur les revenus israéliens (NOUVEAU 2026)",
    titleHE: "פטור הכנסה ישראלית חדש 2026",
    description:
      "Les nouveaux olim peuvent être exonérés jusqu'à 1 million de shéquels par an de revenus israéliens pour les deux premières années fiscales. Décision gouvernementale de 2026.",
    amount: "Jusqu'à 1M₪/an",
    duration: "2 ans fiscaux",
    deadline: "À partir de 2026",
    eligibility: "Olim enregistrés après 2024, revenus israéliens",
    howToClaim:
      "1. Demander l'exemption auprès de Misrad Hareset. 2. Présenter la preuve du statut d'olé et la date d'arrivée. 3. Appliquer l'exemption sur votre déclaration fiscale pour les deux premières années fiscales.",
    category: "tax",
    priority: "high",
    updatedYear: 2026,
  },
  {
    id: "arnona-reduction",
    titleFR: "Réduction de la taxe foncière (Arnona)",
    titleHE: "הנחה על ארנונה",
    description:
      "Réduction de 25-33% sur la taxe foncière (arnona) pour les habitations résidentielles principales pendant 12 mois suivant l'arrivée.",
    amount: "25-33% de réduction",
    duration: "12 mois",
    deadline: "Dès l'enregistrement de propriété",
    eligibility: "Olim propriétaires de leur résidence principale",
    howToClaim:
      "1. S'enregistrer auprès de la municipalité locale avec preuve du statut d'olé. 2. Présenter le contrat de propriété et le visa d'olé. 3. La municipalité applique la réduction automatiquement sur la prochaine facture d'arnona.",
    category: "financial",
    priority: "medium",
    updatedYear: 2025,
  },
  {
    id: "tv-license-exemption",
    titleFR: "Exemption de taxe télévision",
    titleHE: "פטור מרשיון טלוויזיה",
    description:
      "Exemption de la taxe télévision (redevance télévisuelle) pour 12 mois. Tarif normal : environ 80₪ par mois.",
    amount: "~80₪/mois",
    duration: "12 mois",
    deadline: "Dès la demande",
    eligibility: "Tous les olim enregistrés",
    howToClaim:
      "1. Contacter la Société de Radiodiffusion Israélienne (Rashut Hashidur). 2. Présenter le visa d'olé et la preuve d'enregistrement. 3. L'exemption est appliquée au compte pour 12 mois.",
    category: "financial",
    priority: "low",
    updatedYear: 2025,
  },
  {
    id: "customs-duty-exemption",
    titleFR: "Exemption des droits de douane - biens personnels et automobile",
    titleHE: "פטור מיבוא בדיוקס",
    description:
      "Exemption des droits de douane sur les biens personnels et possessions transportés depuis le pays d'origine. Possibilité d'importer une voiture d'occasion sans droits de douane si éligible.",
    amount: null,
    duration: "Permanent",
    deadline: "Dans les 12 mois suivant l'arrivée",
    eligibility: "Olim avec biens personnels. Automobile : conditions spécifiques d'âge et de valeur",
    howToClaim:
      "1. Contacter les douanes israéliennes (Misrad Misuim). 2. Remplir le formulaire d'importation d'olé avec liste des biens. 3. Pour automobile : consulter l'administration pour les conditions de tarif réduit. 4. Fournir la preuve du statut d'olé et des documents d'ownership.",
    category: "financial",
    priority: "medium",
    updatedYear: 2025,
  },
  {
    id: "ulpan-hebrew",
    titleFR: "Cours d'hébreu gratuit (Ulpan)",
    titleHE: "קורס עברית חינם - אולפן",
    description:
      "Programme gratuit d'enseignement intensif de l'hébreu : 500 heures de cours sur plusieurs mois. Offert par le Ministère de l'Absorption pour tous les olim.",
    amount: null,
    duration: "3-6 mois",
    deadline: "Dès l'arrivée",
    eligibility: "Tous les olim enregistrés",
    howToClaim:
      "1. S'enregistrer au Misrad Haklita (Ministère de l'Absorption). 2. Demander l'accès à un programme ulpan. 3. Choisir un ulpan (public, kibboutz, ou académique). 4. Commencer les cours - généralement gratuits ou à coût réduit.",
    category: "education",
    priority: "high",
    updatedYear: 2025,
  },
  {
    id: "housing-assistance",
    titleFR: "Assistance au logement (prêts et subventions)",
    titleHE: "סיוע דיור",
    description:
      "Le Misrad Haklita propose des prêts sans intérêt et des subventions pour l'achat ou la location d'un logement. Les conditions varient selon le profil et la région.",
    amount: "Variable selon profil",
    duration: "Variable",
    deadline: "Dès l'enregistrement",
    eligibility: "Olim avec demande prouvée. Priorité aux profils défavorisés et zones périphériques.",
    howToClaim:
      "1. Contacter le Misrad Haklita localement ou en ligne. 2. Présenter preuve de revenus et demande de logement. 3. Remplir les formulaires d'aide au logement. 4. Attendre évaluation et approbation. 5. Les prêts sont généralement sans intérêt et remboursables sur plusieurs années.",
    category: "housing",
    priority: "high",
    updatedYear: 2025,
  },
  {
    id: "health-insurance",
    titleFR: "Assurance maladie (Kupat Holim)",
    titleHE: "ביטוח בריאות קופת חולים",
    description:
      "Accès immédiat à l'assurance maladie avec choix entre 4 fournisseurs de soins : Clalit, Maccabi, Leumit, Meuhedet. Couverture complète dès l'arrivée.",
    amount: null,
    duration: "Permanent",
    deadline: "Dès l'arrivée",
    eligibility: "Tous les olim - obligation légale",
    howToClaim:
      "1. S'enregistrer auprès du Bituach Leumi (Sécurité Sociale) dès l'arrivée. 2. Choisir une Kupat Holim (provider de santé). 3. S'inscrire auprès de votre provider choisi. 4. Recevoir la couverture santé immédiatement et complète.",
    category: "health",
    priority: "high",
    updatedYear: 2025,
  },
  {
    id: "university-tuition-reduction",
    titleFR: "Réduction des frais de scolarité universitaires",
    titleHE: "הנחה על לימודים אוניברסיטאיים",
    description:
      "Les étudiants olim reçoivent une réduction significative des frais d'inscription et de scolarité dans les universités israéliennes (généralement 30-50% de réduction).",
    amount: "30-50% de réduction",
    duration: "Durée des études",
    deadline: "À l'inscription",
    eligibility: "Olim étudiants dans universités israéliennes reconnues",
    howToClaim:
      "1. Contacter le bureau des étudiants olim de l'université. 2. Présenter le visa d'olé et preuve d'enregistrement. 3. Remplir formulaire de demande de réduction. 4. Les frais réduits sont appliqués automatiquement à l'inscription.",
    category: "education",
    priority: "medium",
    updatedYear: 2025,
  },
  {
    id: "employment-assistance",
    titleFR: "Assistance à l'emploi et centres d'orientation",
    titleHE: "סיוע להעסקה",
    description:
      "Les centres pour l'emploi (Misrad HaTa'asuka) offrent des services gratuits : aide à la rédaction CV, préparation entretien, placement professionnel, formation professionnelle.",
    amount: null,
    duration: "Services continus",
    deadline: "Dès l'enregistrement",
    eligibility: "Tous les olim cherchant emploi",
    howToClaim:
      "1. Visiter le centre pour l'emploi local (Misrad HaTa'asuka). 2. S'enregistrer en tant que demandeur d'emploi olé. 3. Bénéficier de conseils en orientation professionnelle. 4. Accéder à offres d'emploi et programmes de formation.",
    category: "employment",
    priority: "high",
    updatedYear: 2025,
  },
  {
    id: "keren-klita",
    titleFR: "Keren Klita - subventions d'absorption pour professions spécifiques",
    titleHE: "קרן קליטה",
    description:
      "Subventions et bourses additionnelles pour olim dans certaines professions prioritaires : enseignement, secteur hi-tech, santé, agriculture, startup. Montants variables selon profession.",
    amount: "Variable par profession",
    duration: "Variable",
    deadline: "À vérifier par profession",
    eligibility: "Olim dans professions désignées, avec qualifications",
    howToClaim:
      "1. Identifier si votre profession bénéficie du Keren Klita (consulter Misrad Haklita). 2. Rassembler certificats de qualification et diplômes étrangers. 3. Demander reconnaissance de diplômes si nécessaire. 4. Soumettre demande auprès de l'organisme gestionnaire du Keren Klita.",
    category: "financial",
    priority: "medium",
    updatedYear: 2025,
  },
  {
    id: "right-to-vote",
    titleFR: "Droit de vote et participation politique",
    titleHE: "זכות בחירה",
    description:
      "Les olim peuvent voter et se présenter aux élections une fois citoyens israéliens. Accès à la citoyenneté simplifiée via la Loi du Retour après 3 ans de résidence.",
    amount: null,
    duration: "Après 3 ans ou plus",
    deadline: "Après naturalisation",
    eligibility: "Olim devenant citoyens israéliens",
    howToClaim:
      "1. Résider en Israël pour la durée requise (généralement 3 ans minimum). 2. Demander la citoyenneté auprès du Ministère de l'Intérieur. 3. Recevoir le certificat de citoyenneté israélienne. 4. Vous pouvez alors voter et vous présenter aux élections.",
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
    nameHE: "תלוש שכר",
    nameFR: "Fiche de paie",
    description:
      "Document mensuel détaillant salaire brut, déductions, cotisations sociales et montant net. Utilisé pour vérifier revenus et calculs de paie.",
  },
  employmentContract: {
    nameHE: "חוזה עבודה",
    nameFR: "Contrat de travail",
    description:
      "Accord légal entre employeur et employé définissant termes d'emploi, salaire, heures, droits et obligations.",
  },
  terminationLetter: {
    nameHE: "מכתב פיטורין",
    nameFR: "Lettre de licenciement",
    description:
      "Document officiel notifiant la fin de contrat de travail. Inclut date effective, raison, et droits à indemnités de licenciement.",
  },
  taxAssessment: {
    nameHE: "שומת מס",
    nameFR: "Avis d'imposition",
    description:
      "Document du Misrad Hareset (administration fiscale) détaillant revenus imposables, impôts dus, et crédits d'impôt appliqués.",
  },
  officialLetter: {
    nameHE: "מכתב רשמי",
    nameFR: "Lettre officielle",
    description:
      "Correspondance officielle de gouvernement israélien, municipalité, ou institution. Peut concerner impôts, allocations, enregistrement, etc.",
  },
  lease: {
    nameHE: "חוזה שכירות",
    nameFR: "Contrat de location",
    description:
      "Accord de location pour résidence ou propriété. Définit loyer, conditions, durée bail, et droits/obligations propriétaire et locataire.",
  },
  bituachLeumiLetter: {
    nameHE: "מכתב ביטוח לאומי",
    nameFR: "Courrier Bituach Leumi",
    description:
      "Correspondance du Bituach Leumi (Sécurité Sociale israélienne) concernant cotisations, droits aux allocations, statut d'assuré.",
  },
};

/**
 * French-Hebrew Glossary
 * 50+ administrative and labor law terms in French and Hebrew
 */
export const FRENCH_HEBREW_GLOSSARY: GlossaryEntry[] = [
  {
    hebrew: "שכר",
    french: "Salaire",
    category: "salaire",
    explanation:
      "Rémunération versée par l'employeur à l'employé pour travail effectué.",
  },
  {
    hebrew: "שכר מינימום",
    french: "Salaire minimum",
    category: "salaire",
    explanation: