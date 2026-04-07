/**
 * Bituach Leumi (National Insurance) Navigator
 *
 * Comprehensive guide to Israeli social security benefits.
 * Helps users understand what they're eligible for based on their situation.
 *
 * Sources: skills-il/government-services/israeli-bituach-leumi
 */

export interface BLBenefit {
  id: string
  name_he: string
  name_fr: string
  category: 'employment' | 'family' | 'disability' | 'retirement' | 'health' | 'reserve'
  description_fr: string
  eligibility_fr: string[]
  amounts_fr: string[]
  howToApply_fr: string[]
  documents_needed: string[]
  processing_time: string
  link?: string
}

export const BL_BENEFITS: BLBenefit[] = [
  // ─── Employment ───
  {
    id: 'unemployment',
    name_he: 'דמי אבטלה',
    name_fr: 'Allocations chomage',
    category: 'employment',
    description_fr: 'Allocations versees aux salaries licencies ou dont le contrat a expire, sous conditions d\'anciennete et d\'age.',
    eligibility_fr: [
      'Avoir travaille au moins 12 mois sur les 18 derniers mois (ou 6 mois sur 12 pour les demobilises)',
      'Etre inscrit au service de l\'emploi (Sherut HaTaasuka)',
      'Ne pas avoir demissionne volontairement (sauf cas reconnus)',
      'Avoir entre 20 et 67 ans (hommes) ou 20-62 ans (femmes)',
    ],
    amounts_fr: [
      'Environ 48% du salaire moyen des 6 derniers mois (plafonne)',
      'Duree : 50-175 jours selon age et situation familiale',
      'Moins de 25 ans : 50 jours | 25-28 ans : 67 jours',
      '28-35 ans : 100 jours | 35-45 ans : 138 jours | 45+ : 175 jours',
    ],
    howToApply_fr: [
      'S\'inscrire au Sherut HaTaasuka (agence pour l\'emploi)',
      'Deposer une demande en ligne sur le site du Bituach Leumi',
      'Joindre les documents requis',
    ],
    documents_needed: [
      'Lettre de licenciement ou certificat de fin de contrat',
      'Formulaire 106 du dernier employeur',
      'Teudat Zehut',
      'Releve bancaire (pour le virement)',
    ],
    processing_time: '2-4 semaines',
  },
  {
    id: 'work-injury',
    name_he: 'נפגעי עבודה',
    name_fr: 'Accident du travail',
    category: 'employment',
    description_fr: 'Indemnisation en cas d\'accident survenu pendant le travail ou sur le trajet domicile-travail.',
    eligibility_fr: [
      'Tout salarie assure au Bituach Leumi',
      'Accident pendant les heures de travail ou sur le trajet',
      'Declaration dans les 12 mois suivant l\'accident',
    ],
    amounts_fr: [
      'Dmei Pgia (indemnites journalieres) : 75% du salaire pendant max 91 jours',
      'Si invalidite permanente : allocation mensuelle selon pourcentage',
      'Prise en charge des frais medicaux lies a l\'accident',
    ],
    howToApply_fr: [
      'Se rendre aux urgences ou chez un medecin immediatement',
      'Demander le formulaire BL/250 a l\'employeur',
      'Deposer la demande au Bituach Leumi sous 12 mois',
    ],
    documents_needed: [
      'Formulaire BL/250 rempli par l\'employeur',
      'Certificat medical',
      'Rapport de police (si accident de trajet)',
    ],
    processing_time: '1-3 semaines',
  },
  // ─── Family ───
  {
    id: 'child-allowance',
    name_he: 'קצבת ילדים',
    name_fr: 'Allocations enfants',
    category: 'family',
    description_fr: 'Allocation mensuelle automatique pour chaque enfant jusqu\'a 18 ans.',
    eligibility_fr: [
      'Tout resident israelien avec des enfants de moins de 18 ans',
      'Versement automatique — pas besoin de demande specifique',
      'A partir du mois de naissance de l\'enfant',
    ],
    amounts_fr: [
      '1er enfant : ~152₪/mois',
      '2e enfant : ~192₪/mois',
      '3e enfant : ~192₪/mois',
      '4e enfant : ~192₪/mois',
      '5e+ enfant : ~152₪/mois',
      'Total 2 enfants : ~344₪/mois | 3 enfants : ~536₪/mois',
    ],
    howToApply_fr: [
      'Automatique a la naissance (si ne en Israel)',
      'Pour les olim : s\'inscrire au Bituach Leumi a l\'arrivee',
    ],
    documents_needed: [
      'Certificat de naissance (automatique si ne en Israel)',
      'Teudat Oleh (pour les nouveaux immigrants)',
    ],
    processing_time: 'Automatique',
  },
  {
    id: 'maternity-allowance',
    name_he: 'דמי לידה',
    name_fr: 'Allocation maternite',
    category: 'family',
    description_fr: 'Indemnites versees pendant le conge maternite (15 semaines payees sur 26 semaines de conge).',
    eligibility_fr: [
      'Avoir cotise au BL pendant au moins 10 mois sur les 14 derniers mois',
      'Ou 15 mois sur les 22 derniers mois',
      'Etre salariee ou independante',
    ],
    amounts_fr: [
      '100% du salaire moyen des 3 derniers mois (plafonne)',
      'Plafond : environ 1 510₪/jour',
      '15 semaines = 105 jours payes',
      'Pere : peut prendre jusqu\'a 6 semaines du conge de la mere',
    ],
    howToApply_fr: [
      'Deposer la demande en ligne apres l\'accouchement',
      'L\'employeur remplit sa partie du formulaire',
    ],
    documents_needed: [
      'Formulaire de demande',
      'Certificat de naissance ou d\'hospitalisation',
      'Fiches de paie des 3 derniers mois',
    ],
    processing_time: '2-3 semaines',
  },
  // ─── Disability ───
  {
    id: 'disability-general',
    name_he: 'קצבת נכות כללית',
    name_fr: 'Allocation invalidite generale',
    category: 'disability',
    description_fr: 'Allocation pour les personnes ayant une invalidite medicale qui limite leur capacite de travail.',
    eligibility_fr: [
      'Invalidite medicale d\'au moins 40%',
      'Capacite de travail reduite d\'au moins 50%',
      'Age 18-67 (hommes) ou 18-62 (femmes)',
      'Resident israelien',
    ],
    amounts_fr: [
      'Allocation de base : ~3 800₪/mois (invalidite 100%)',
      'Supplements pour conjoint et enfants',
      'Complement pour mobilite si necessaire',
      'Ajuste selon le pourcentage d\'invalidite',
    ],
    howToApply_fr: [
      'Deposer une demande au Bituach Leumi',
      'Passer une commission medicale',
      'Possible d\'etre accompagne par un avocat specialise',
    ],
    documents_needed: [
      'Formulaire de demande',
      'Tous les dossiers medicaux pertinents',
      'Teudat Zehut',
      'Avis medicaux',
    ],
    processing_time: '2-6 mois',
  },
  // ─── Retirement ───
  {
    id: 'old-age',
    name_he: 'קצבת זקנה',
    name_fr: 'Allocation vieillesse',
    category: 'retirement',
    description_fr: 'Allocation mensuelle a partir de l\'age de la retraite (67 hommes, ~63 femmes).',
    eligibility_fr: [
      'Avoir atteint l\'age de la retraite',
      'Avoir cotise pendant au moins 144 mois (12 ans)',
      'Ou 60 mois (5 ans) dont 12 mois dans les 3 ans precedant la retraite',
    ],
    amounts_fr: [
      'Individuel : ~1 620₪/mois (allocation de base)',
      'Couple : ~2 430₪/mois',
      'Supplement pour anciennete (+2% par annee au-dela de 10 ans de cotisation)',
      'Supplement sous condition de ressources possible',
    ],
    howToApply_fr: [
      'La demande peut etre faite 3 mois avant l\'age de la retraite',
      'En ligne sur le site du Bituach Leumi',
    ],
    documents_needed: [
      'Teudat Zehut',
      'Releve bancaire',
      'Formulaire de demande',
    ],
    processing_time: '1-2 mois',
  },
  // ─── Reserve Duty ───
  {
    id: 'miluim',
    name_he: 'דמי מילואים',
    name_fr: 'Indemnites reserve militaire (miluim)',
    category: 'reserve',
    description_fr: 'Compensation salariale pendant les periodes de service de reserve (miluim).',
    eligibility_fr: [
      'Tout reserviste effectuant un service de reserve',
      'Salarie ou independant',
    ],
    amounts_fr: [
      'Salaries : 100% du salaire (paye par l\'employeur, rembourse par le BL)',
      'Independants : base sur les revenus declares',
      'Minimum garanti si revenus insuffisants',
    ],
    howToApply_fr: [
      'L\'employeur remplit le formulaire apres le service',
      'Le BL rembourse l\'employeur directement',
      'Independants : demande directe au BL',
    ],
    documents_needed: [
      'Formulaire 3010 de Tsahal',
      'Fiche de paie du mois concerne',
    ],
    processing_time: '2-4 semaines',
  },
]

export function getBenefitsByCategory(category: string): BLBenefit[] {
  return BL_BENEFITS.filter(b => b.category === category)
}

export function getBenefitById(id: string): BLBenefit | undefined {
  return BL_BENEFITS.find(b => b.id === id)
}

export const BL_CATEGORIES = [
  { id: 'employment', label_fr: 'Emploi', icon: 'Briefcase' },
  { id: 'family', label_fr: 'Famille', icon: 'Heart' },
  { id: 'disability', label_fr: 'Invalidite', icon: 'Shield' },
  { id: 'retirement', label_fr: 'Retraite', icon: 'Clock' },
  { id: 'reserve', label_fr: 'Miluim', icon: 'Star' },
]
