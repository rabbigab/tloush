export type RightCategory = "financial" | "tax" | "housing" | "health" | "employment" | "education" | "immigration";
export type UrgencyLevel = "immediate" | "3months" | "noturgent";
/**
 * Periodicite d'un montant:
 * - 'one-time'  : somme forfaitaire versee une seule fois (panier
 *                 d'absorption, reduction douane vehicule, etc.)
 * - 'monthly'   : montant recurrent mensuel
 * - 'yearly'    : montant recurrent annuel
 * Utilisee pour eviter d'additionner des aides de frequences
 * differentes dans le totalValue affiche a l'utilisateur.
 */
export type AmountPeriodicity = "one-time" | "monthly" | "yearly";

export interface OlimRight {
  id: string;
  title: string;
  description: string;
  category: RightCategory;
  icon: string;
  amount?: number;
  currency?: "ILS" | "USD";
  /** Defaut: 'one-time'. Voir AmountPeriodicity. */
  periodicity?: AmountPeriodicity;
  duration?: string;
  urgency: UrgencyLevel;
  howTo: string;
  conditions: string[];
  eligibleAfterDays?: number;
  /** URL de la source officielle (ministere, BL, etc.) */
  sourceUrl?: string;
  /** Label court de la source affichable en UI */
  sourceLabel?: string;
  /** Date de la derniere verification du montant / des conditions */
  verifiedAt?: string;
}

/**
 * Date globale de derniere verification des baremes olim-rights.
 * Affichee sur /droits/olim pour transparence (audit #23).
 */
export const OLIM_RIGHTS_VERIFIED_AT = '2026-04-01';

/**
 * Ressources officielles pour les olim. Rendues en bas de
 * /droits/olim pour que l'utilisateur puisse verifier les montants
 * et completer sa demarche (audit #23).
 */
export const OFFICIAL_OLIM_RESOURCES: Array<{
  label: string;
  url: string;
  description: string;
}> = [
  {
    label: 'Misrad HaKlita (Ministère de l\'Intégration des Olim)',
    url: 'https://www.gov.il/he/departments/ministry_of_aliyah_and_integration',
    description: 'Panier d\'absorption, aide au logement, cours d\'hébreu.',
  },
  {
    label: 'Bituah Leumi (Sécurité sociale)',
    url: 'https://www.btl.gov.il',
    description: 'Allocations famille, sante, maternite, chomage.',
  },
  {
    label: 'Misrad HaShikun (Ministère du Logement)',
    url: 'https://www.gov.il/he/departments/ministry_of_housing',
    description: 'Mashkanta assistee, subventions au logement.',
  },
  {
    label: 'Rashut HaMisim (Rashut HaMisim)',
    url: 'https://www.taxes.gov.il',
    description: 'Exonerations fiscales olim (10 ans), points de credit bonus.',
  },
  {
    label: 'Nefesh B\'Nefesh',
    url: 'https://www.nbn.org.il',
    description: 'Aide olim d\'Amérique du Nord (jusqu\'à 3 000 USD + accompagnement).',
  },
  {
    label: 'Agence Juive (Jewish Agency)',
    url: 'https://www.jewishagency.org/fr/',
    description: 'Aide alya depuis la France et la diaspora francophone.',
  },
];

export const CATEGORY_LABELS: Record<RightCategory, string> = {
  financial: "Aides financières",
  tax: "Impôts",
  housing: "Logement",
  health: "Santé",
  employment: "Emploi",
  education: "Éducation",
  immigration: "Immigration",
};

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  immediate: "À faire immédiatement",
  "3months": "Dans les 3 mois",
  noturgent: "Pas urgent",
};

export const CATEGORY_COLORS: Record<RightCategory, { bg: string; text: string }> = {
  financial: { bg: "bg-success/10", text: "text-success" },
  tax: { bg: "bg-brand-100", text: "text-brand-700" },
  housing: { bg: "bg-blue-100", text: "text-blue-700" },
  health: { bg: "bg-red-100", text: "text-red-700" },
  employment: { bg: "bg-purple-100", text: "text-purple-700" },
  education: { bg: "bg-orange-100", text: "text-orange-700" },
  immigration: { bg: "bg-cyan-100", text: "text-cyan-700" },
};

export const OLIM_RIGHTS: OlimRight[] = [
  {
    id: "absorption-basket",
    title: "Panier d'absorption (Sal Klita)",
    description: "Aide financière directe versée en plusieurs paiements. Montant variable selon la composition familiale (célibataire ~25 000₪, couple ~38 000₪, avec enfants plus).",
    category: "financial",
    icon: "💰",
    amount: 25000,
    currency: "ILS",
    duration: "6 mois (versé en 6-8 paiements mensuels)",
    urgency: "immediate",
    howTo: "Demander auprès du ministère de l'Intégration des Olim (Ministry of Aliyah). Formulaires disponibles online ou aux bureaux locaux.",
    conditions: [
      "Être un nouvel olim depuis moins d'1 an",
      "Avoir la nationalité israélienne",
      "Vivre en Israël",
    ],
    eligibleAfterDays: 0,
  },
  {
    id: "tax-exemption",
    title: "Exonération d'impôt sur les revenus étrangers",
    description: "10 ans d'exonération sur les revenus provenant de l'étranger",
    category: "tax",
    icon: "📊",
    duration: "10 ans",
    urgency: "immediate",
    howTo: "Déclarer lors de votre première déclaration fiscale en Israël. L'administration fiscale appliquera automatiquement si vous en informez.",
    conditions: [
      "Être un nouvel olim",
      "Avoir des revenus étrangers (travail, rentes, intérêts)",
      "Déclarer les revenus correctement",
    ],
    eligibleAfterDays: 0,
  },
  {
    id: "customs-exemption",
    title: "Exonération de douanes - Effets personnels",
    description: "Importer gratuitement vos biens personnels et meubles",
    category: "immigration",
    icon: "📦",
    duration: "Une fois",
    urgency: "immediate",
    howTo: "Présenter votre déclaration d'olim et liste des biens au bureau des douanes. La plupart des effets personnels sont exonérés.",
    conditions: [
      "Avoir le statut officiel d'olim",
      "Importer dans les 2 ans suivant l'arrivée",
      "Les biens doivent être des effets personnels",
    ],
    eligibleAfterDays: 0,
  },
  {
    id: "vehicle-import",
    title: "Importation de véhicule - Réduction douanes",
    description: "Réduction partielle sur les droits de douane pour un véhicule",
    category: "immigration",
    icon: "🚗",
    amount: 50000,
    currency: "ILS",
    duration: "Une fois",
    urgency: "3months",
    howTo: "Soumettre la demande au bureau des douanes avec certificat d'olim. Dépôt de garantie requis.",
    conditions: [
      "Avoir le statut d'olim depuis moins de 1 an",
      "Le véhicule doit être importé avant 3 mois après l'arrivée",
      "Droit d'usage pendant 5 ans minimum",
    ],
    eligibleAfterDays: 0,
  },
  {
    id: "bank-account",
    title: "Ouverture de compte bancaire facilité",
    description: "Accès simplifié aux services bancaires et crédit initial",
    category: "financial",
    icon: "🏦",
    urgency: "immediate",
    howTo: "Vous présenter à une banque avec votre passeport et certificat d'olim. Certaines banques offrent des conditions préférentielles aux nouveaux olim.",
    conditions: [
      "Avoir un passeport valide",
      "Avoir le statut d'olim",
      "Résider légalement en Israël",
    ],
    eligibleAfterDays: 0,
  },
  {
    id: "mortgage-benefits",
    title: "Avantages hypothécaires spéciaux",
    description: "Taux de crédit hypothécaire préférentiels pour l'achat immobilier",
    category: "housing",
    icon: "🏠",
    duration: "5-20 ans",
    urgency: "3months",
    howTo: "Contacter les banques pour connaître les programmes spéciaux olim. Le Gov.il offre aussi un site de ressources sur les prêts hypothécaires.",
    conditions: [
      "Avoir le statut d'olim",
      "Acheter un bien immobilier à titre d'habitation principale",
      "Satisfaire les critères d'emprunt bancaire standard",
    ],
    eligibleAfterDays: 0,
  },
  {
    id: "health-insurance",
    title: "Assurance maladie obligatoire",
    description: "Accès au système de santé public israélien et couverture de base",
    category: "health",
    icon: "⚕️",
    urgency: "immediate",
    howTo: "S'inscrire auprès d'une Kupat Holim (Caisse de maladie) : Clalit, Maccabi, Meuhedet, ou Leumit. Possible en ligne ou sur place.",
    conditions: [
      "Être résidant légal en Israël",
      "Enregistrement auprès du Ministère de l'Intérieur",
      "Cotisations déduites du salaire",
    ],
    eligibleAfterDays: 0,
  },
  {
    id: "language-course",
    title: "Cours d'hébreu subventionnés",
    description: "Cours d'hébreu intensif gratuit ou à tarif réduit",
    category: "education",
    icon: "🔤",
    duration: "3-6 mois",
    urgency: "immediate",
    howTo: "S'inscrire auprès de l'Agence Juive (Jewish Agency) ou du Ministère de l'Éducation. De nombreux ulpan offrent des places subventionnées.",
    conditions: [
      "Être un nouvel olim",
      "Être disponible à temps plein (généralement)",
      "Certains ulpans nécessitent un minimum d'engagement",
    ],
    eligibleAfterDays: 0,
  },
  {
    id: "employment-assistance",
    title: "Aide à la recherche d'emploi",
    description: "Services de placement et soutien pour la recherche d'emploi",
    category: "employment",
    icon: "💼",
    urgency: "immediate",
    howTo: "Contacter le Service Public de l'Emploi (Bitouach Leumi) ou des agences spécialisées pour olim. Des ressources existent aussi en français.",
    conditions: [
      "Être en âge de travailler",
      "Avoir droit de travailler en Israël",
      "Être disponible pour l'emploi",
    ],
    eligibleAfterDays: 0,
  },
  {
    id: "business-support",
    title: "Aide au démarrage d'activité indépendante",
    description: "Crédits, prêts et soutien pour créer une entreprise",
    category: "employment",
    icon: "🚀",
    amount: 100000,
    currency: "ILS",
    urgency: "3months",
    howTo: "Consulter l'Agence Juive, la Small Business Authority ou des associations pour olim entrepreneurs. Business plans et mentoring disponibles.",
    conditions: [
      "Avoir un plan d'affaires viable",
      "Être un nouvel olim",
      "Respecter les critères de la loi sur les PME",
    ],
    eligibleAfterDays: 30,
  },
  {
    id: "nefesh-benefits",
    title: "Nefesh B'Nefesh - Avantages supplémentaires",
    description: "Pour les olim d'Amérique du Nord : aide financière additionnelle",
    category: "financial",
    icon: "🌐",
    amount: 3000,
    currency: "USD",
    duration: "Une fois",
    urgency: "immediate",
    howTo: "Vous enregistrer auprès de Nefesh B'Nefesh (organisation partenaire). Processus d'enregistrement lors de l'alya.",
    conditions: [
      "Être originaire du Canada ou des USA",
      "Effectuer son alya via Nefesh B'Nefesh",
      "Satisfaire aux critères de l'organisation",
    ],
    eligibleAfterDays: 0,
  },
  {
    id: "pension-coordination",
    title: "Coordination pensions étrangères - Bitouach Leumi",
    description: "Reconnaissance des cotisations de pension étrangères",
    category: "tax",
    icon: "📈",
    duration: "Permanent",
    urgency: "3months",
    howTo: "Contacter Bitouach Leumi avec documents de retraite étrangère. Ils évalueront la possibilité de coordination.",
    conditions: [
      "Avoir cotisé à un système de retraite étranger",
      "Documents prouvant les cotisations",
      "Être résident fiscal d'Israël",
    ],
    eligibleAfterDays: 90,
  },
  {
    id: "education-grants",
    title: "Bourses d'études pour les enfants",
    description: "Aides financières pour l'éducation des enfants d'olim",
    category: "education",
    icon: "🎓",
    urgency: "3months",
    howTo: "Vérifier auprès du Ministère de l'Éducation, des municipalités et des organisations para-religieuses pour les bourses disponibles.",
    conditions: [
      "Avoir des enfants en âge scolaire",
      "Être résidant légal en Israël",
      "Satisfaire aux critères de revenus (selon le programme)",
    ],
    eligibleAfterDays: 90,
  },
  {
    id: "municipality-benefits",
    title: "Aides municipales spéciales",
    description: "Réductions sur impôts locaux, services et équipements pour olim",
    category: "financial",
    icon: "🏛️",
    urgency: "noturgent",
    howTo: "Contacter votre municipalité (Iriya ou Moatza Mekomit) pour connaître les programmes spéciaux. Certaines villes offrent des réductions substantielles.",
    conditions: [
      "Être résident de la municipalité",
      "Avoir le statut d'olim",
      "S'enregistrer auprès du bureau local",
    ],
    eligibleAfterDays: 30,
  },
];

export function filterRightsByProfile(
  answers: {
    arrivalDate: Date | null;
    employmentStatus: string;
    familyStatus: string;
    officialAlya: boolean;
    foreignProperty: boolean;
  }
): OlimRight[] {
  const filtered = OLIM_RIGHTS.filter((right) => {
    // Filter based on employment status
    if (answers.employmentStatus === "Indépendant" && right.id === "business-support") {
      return true;
    }

    // Filter based on family status
    if (answers.familyStatus.includes("enfants") && right.id === "education-grants") {
      return true;
    }

    // All basic rights for all olim
    const basicRights = [
      "absorption-basket",
      "tax-exemption",
      "customs-exemption",
      "bank-account",
      "health-insurance",
      "language-course",
      "employment-assistance",
      "nefesh-benefits",
    ];

    if (basicRights.includes(right.id)) {
      return true;
    }

    // Housing-related rights (if foreign property or planning to buy)
    if (answers.foreignProperty && ["mortgage-benefits"].includes(right.id)) {
      return true;
    }

    // All other rights
    return [
      "vehicle-import",
      "pension-coordination",
      "municipality-benefits",
    ].includes(right.id);
  });

  return filtered.sort((a, b) => {
    const urgencyOrder = { immediate: 0, "3months": 1, noturgent: 2 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });
}
