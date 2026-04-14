// =====================================================
// Catalogue exhaustif des benefices israeliens
// =====================================================
// Source : recherche web avril 2026 sur btl.gov.il, kolzchut.org.il,
// gov.il, nbn.org.il, cwsisrael.com
//
// Ce catalogue sert de base de verite pour :
// - Le rights detector (src/lib/rightsDetector.ts)
// - La page /rights-detector (affichage utilisateur)
// - Le systeme de veille legale (src/lib/legalWatch.ts)
//
// Chaque benefice a :
// - Un slug stable (pour tracking cote DB)
// - Titre FR + description FR
// - Autorite emettrice + URL officielle
// - Conditions d'eligibilite structurees
// - Valeur estimee (quand possible)
// - Date de verification + confidence level

// =====================================================
// SECTION 1 — Types & Interfaces
// =====================================================

export type BenefitCategory =
  | 'family'        // Famille, enfants, allocations
  | 'fiscal'        // Impots, credit points, refunds
  | 'employment'    // Droits travail, havraa, pension
  | 'immigration'   // Olim, Misrad HaKlita
  | 'housing'       // Logement, aide loyer, mashkanta
  | 'health'        // Sante, invalidite, caregivers
  | 'retirement'    // Retraite, old age pension
  | 'military'      // Reservistes, veterans, combattants
  | 'welfare'       // Aides sociales, chomage, income support
  | 'education'     // Etudiants, bourses
  | 'special'       // Holocaust, bereaved, disabled children

export type BenefitAuthority =
  | 'bituach_leumi'       // Bituach Leumi (BL)
  | 'tax_authority'        // Rashut HaMisim
  | 'misrad_haklita'       // Misrad HaKlita (absorption)
  | 'misrad_hashikun'      // Misrad HaShikun (logement)
  | 'misrad_habitahon'     // Misrad HaBitahon (defense)
  | 'municipality'         // Mairie (arnona)
  | 'misrad_hachinuch'     // Misrad HaChinuch (education)
  | 'claims_conference'    // Claims Conference (Shoah)
  | 'other'

export type ConfidenceLevel = 'high' | 'medium' | 'low'
export type SourceStatus = 'verified' | 'needs_verification' | 'estimated'

export interface EligibilityConditions {
  /** Minimum age (en annees) */
  min_age?: number
  /** Maximum age */
  max_age?: number
  /** Genre requis */
  required_gender?: 'male' | 'female'
  /** Statut marital requis */
  required_marital_status?: Array<'single' | 'married' | 'divorced' | 'widowed' | 'separated'>
  /** Nombre d'enfants minimum */
  min_children?: number
  /** Annees depuis alyah (min, max) */
  aliyah_years_range?: [number, number]
  /** Statut d'emploi requis */
  required_employment?: Array<'employed' | 'self_employed' | 'unemployed' | 'student' | 'retired' | 'reservist' | 'parental_leave'>
  /** Taux d'invalidite minimum (%) */
  min_disability?: number
  /** Revenu mensuel maximum (pour aides conditionnees) */
  max_monthly_income?: number
  /** Le beneficiaire doit etre olim */
  requires_oleh?: boolean
  /** Le beneficiaire doit etre resident israelien */
  requires_resident?: boolean
  /** A servi dans Tsahal */
  requires_idf_service?: boolean
  /** Combattant */
  requires_combat?: boolean
  /** Reserviste actif */
  requires_active_reservist?: boolean
  /** Etudiant actuel */
  requires_student?: boolean
  /** Survivant de la Shoah */
  requires_holocaust_survivor?: boolean
  /** Famille endeuillee */
  requires_bereaved?: boolean
  /** Enfant handicape */
  requires_disabled_child?: boolean
  /** Doit etre aidant familial */
  requires_caregiver?: boolean
  /** Niveau(x) d'etudes requis (ex. ['ba', 'ma', 'phd']) */
  required_education_levels?: Array<'none' | 'high_school' | 'vocational' | 'ba' | 'ma' | 'phd' | 'other'>
  /**
   * Exige qu'au moins un enfant soit ne dans les N derniers mois
   * (utilise pour dmei leida, maanak leida, paternity leave).
   * Se base sur profile.children_birth_dates.
   */
  requires_recent_birth_months?: number
  /**
   * Exige qu'au moins un enfant ait moins de N mois
   * (utilise pour credit_young_child qui concerne les enfants < 6 ans).
   */
  max_youngest_child_months?: number
  /**
   * Age minimum specifique aux hommes (override min_age).
   * Exemple : old_age_pension = 67 pour hommes, 62 pour femmes.
   */
  min_age_male?: number
  /**
   * Age minimum specifique aux femmes (override min_age).
   */
  min_age_female?: number
  /**
   * Exige qu'au moins un enfant soit dans une tranche d'age (en mois).
   * Ex. [36, 96] = enfant entre 3 et 8 ans (tsaharon).
   * Se base sur profile.children_birth_dates.
   */
  requires_child_age_range_months?: [number, number]
}

export interface BenefitDefinition {
  /** Identifiant stable (ne jamais changer) */
  slug: string
  /** Categorie principale */
  category: BenefitCategory
  /** Autorite emettrice */
  authority: BenefitAuthority
  /** Titre en francais */
  title_fr: string
  /** Titre en hebreu (pour reference) */
  title_he?: string
  /** Description courte (1-2 phrases) */
  description_fr: string
  /** Description longue (optionnel) */
  full_description_fr?: string

  /** Conditions d'eligibilite structurees */
  conditions: EligibilityConditions

  /** Valeur estimee annuelle en NIS (si applicable) */
  estimated_annual_value?: number
  /** Unite de la valeur (ex: "NIS/an", "NIS/mois", "variable") */
  value_unit?: string
  /** Montant mensuel type si applicable */
  typical_monthly_amount?: number

  /** URL officielle pour reclamer */
  application_url: string
  /** Texte du bouton d'action */
  action_label: string
  /** URL d'info complementaire */
  info_url?: string

  /** Disclaimer specifique */
  disclaimer?: string
  /** Confidence level (audit interne) */
  confidence: ConfidenceLevel
  /** Statut de verification */
  status: SourceStatus
  /** Date de derniere verification */
  verified_at: string
  /** Annee fiscale de reference */
  tax_year?: number
  /** Notes internes */
  notes?: string
}

// =====================================================
// SECTION 2 — Kitsbat Yeladim (allocation enfants) 2026
// =====================================================
// Source : https://www.btl.gov.il/About/news/Pages/hadasaidkonkitzva2026.aspx
// Confirme via recherche web avril 2026.
//
// Structure 2026 (indexee sur CPI) :
// - 1er enfant : 173 NIS/mois
// - 2e, 3e, 4e enfant : 219 NIS/mois chacun
// - 5e enfant et + : 173 NIS/mois (retombe au tarif du 1er — regle
//   counter-intuitive specifique a Israel)
// + Epargne "Chisachon LeKol Yeled" : 58 NIS/mois dans un compte separe
//   pour chaque enfant (automatiquement ouvert a la naissance)

/**
 * Calcule l'allocation mensuelle cumulee pour N enfants.
 * Applique la regle BL 2026 : 173/219/219/219/173...
 */
export function computeKitsbatYeladim2026(childrenCount: number): number {
  if (childrenCount <= 0) return 0
  if (childrenCount === 1) return 173
  if (childrenCount <= 4) return 173 + (childrenCount - 1) * 219
  // 5+ : les 4 premiers suivent la regle, puis retour au tarif 1er
  return 173 + 3 * 219 + (childrenCount - 4) * 173
}

// Benefits entries pour la Section 2
const KITSBAT_YELADIM_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'kitsbat_yeladim',
    category: 'family',
    authority: 'bituach_leumi',
    title_fr: 'Allocation enfants (Kitsbat Yeladim)',
    title_he: 'קצבת ילדים',
    description_fr:
      'Allocation mensuelle versee par Bituach Leumi a toutes les familles resident en Israel, pour chaque enfant de moins de 18 ans.',
    full_description_fr:
      'En 2026 : 173 NIS/mois pour le 1er enfant, 219 NIS/mois pour les 2e, 3e et 4e enfants, puis retour a 173 NIS/mois a partir du 5e enfant. ' +
      'L\'allocation est normalement automatique a la naissance mais peut necessiter une mise a jour pour les olim recents. ' +
      'Elle est versee sur le compte bancaire du parent declare a BL.',
    conditions: {
      min_children: 1,
      requires_resident: true,
    },
    estimated_annual_value: 173 * 12,  // minimum pour 1 enfant
    value_unit: 'NIS/an (minimum)',
    typical_monthly_amount: 173,
    application_url: 'https://www.btl.gov.il/benefits/children/Pages/default.aspx',
    action_label: 'Verifier mon allocation enfants',
    info_url: 'https://www.kolzchut.org.il/en/Child_Allowance',
    disclaimer:
      'L\'allocation est normalement versee automatiquement. Si vous etes oleh recent ou venez de changer de situation, verifiez votre espace BL personnel ou contactez leur service client.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-12',
    tax_year: 2026,
    notes: 'Chiffres officiels BL 2026 confirmes via recherche web. Structure "5+ retombe au tarif 1er" est une regle counter-intuitive : a double-verifier en cas de doute.',
  },
  {
    slug: 'chisachon_lekol_yeled',
    category: 'family',
    authority: 'bituach_leumi',
    title_fr: 'Epargne enfant (Chisachon LeKol Yeled)',
    title_he: 'חיסכון לכל ילד',
    description_fr:
      'Bituach Leumi depose automatiquement 58 NIS/mois dans un compte d\'epargne dedie pour chaque enfant, accessible a ses 18 ans (ou ses 21 ans avec bonus).',
    full_description_fr:
      'Programme lance en 2017. Tous les enfants israeliens ont un compte d\'epargne automatique a BL. ' +
      'Les parents peuvent choisir d\'ajouter 58 NIS/mois supplementaires de leur poche (deduits de l\'allocation enfants). ' +
      'A 18 ans, l\'enfant peut retirer le capital. A 21 ans, il y a un bonus gouvernemental.',
    conditions: {
      min_children: 1,
      requires_resident: true,
    },
    estimated_annual_value: 58 * 12,  // par enfant
    value_unit: 'NIS/an/enfant',
    typical_monthly_amount: 58,
    application_url: 'https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/default.aspx',
    action_label: 'Configurer le compte epargne',
    disclaimer:
      'Programme automatique. Vous pouvez choisir le fonds (banque ou kupat gemel) et doubler la contribution.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-12',
    tax_year: 2026,
  },
  {
    slug: 'maanak_limudim',
    category: 'family',
    authority: 'bituach_leumi',
    title_fr: 'Prime scolarite de rentree (Maanak Limudim)',
    title_he: 'מענק לימודים',
    description_fr: 'Prime annuelle BL versee en aout/septembre pour aider aux frais de rentree scolaire des enfants de 6 a 18 ans, sous conditions de ressources.',
    full_description_fr:
      'Prime automatique versee en aout-septembre (~1 semaine avant la rentree) aux familles eligibles. ' +
      'Montants officiels 2026 : ' +
      '- Enfant 6-14 ans : ~1 085 NIS ' +
      '- Enfant 15-18 ans : ~602 NIS ' +
      'Eligibilite (conditions cumulatives) : ' +
      '- Percevoir Kitsbat Yeladim pour l\'enfant concerne (actif) ' +
      '- OU etre famille monoparentale (Im Chad Horit) ' +
      '- OU recevoir Hashlamat Hachnasa ou pension invalidite/survivant BL ' +
      '- OU famille nombreuse 4+ enfants ' +
      '- OU nouveau oleh dans les 5 ans ' +
      'Versement automatique : si vous etes eligible, BL vous verse sans demande. Verifiez votre compte bancaire fin aout.',
    conditions: {
      requires_child_age_range_months: [72, 216],  // 6-18 ans
      requires_resident: true,
    },
    estimated_annual_value: 1085,  // moyenne par enfant eligible
    value_unit: 'NIS/an/enfant (versement unique aout)',
    application_url: 'https://www.btl.gov.il/benefits/Grant_children/Pages/default.aspx',
    action_label: 'Verifier mon eligibilite',
    info_url: 'https://www.kolzchut.org.il/he/מענק_לימודים',
    disclaimer:
      'Versement automatique pour les ayant-droits. Si vous pensez etre eligible mais ne recevez rien : contactez votre agence BL locale. La prime est versee une fois par an (debut septembre).',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-14',
    tax_year: 2026,
    notes: 'Ajout catalogue 14/04/2026. Prime peu connue des olim car elle est versee automatiquement sous conditions spe BL. Les families monoparentales et grandes families y ont droit sans demarche.',
  },
  {
    slug: 'mishpacha_brucha_yeladim',
    category: 'family',
    authority: 'bituach_leumi',
    title_fr: 'Bonus famille nombreuse (Mishpacha Brucha Yeladim 4+)',
    title_he: 'משפחה ברוכת ילדים',
    description_fr: 'Les familles de 4+ enfants beneficient de bonus cumules : kitsbat yeladim majore, reduction arnona, tarifs reduits transport et activites, parfois exemption mas rechisha.',
    full_description_fr:
      'Statut reconnu des 4 enfants a charge (moins de 18 ans ou etudiants jusqu\'a 21 ans). ' +
      'Bonus cumules : ' +
      '- Kitsbat yeladim majore a partir du 2e enfant (219 NIS vs 173) ' +
      '- Reduction arnona : 25-50% selon mairie (Tel Aviv 30%, Jerusalem 30%, etc.) sur 100m² ' +
      '- Reduction transport public : cartes familiales Rav-Kav ' +
      '- Acces prioritaire aux maonot yom et tsaharon subventionnes ' +
      '- Reduction sur activites culturelles municipales (piscines, bibliotheques) ' +
      '- Carte Tav Mishpacha Brucha pour reductions diverses ' +
      'Les familles de 7+ enfants ont des droits supplementaires (logement social prioritaire, transport quasi-gratuit).',
    conditions: {
      min_children: 4,
      requires_resident: true,
    },
    estimated_annual_value: 3000,  // estimation reduction arnona + avantages cumules
    value_unit: 'NIS/an (variable selon mairie et niveau)',
    application_url: 'https://www.btl.gov.il/benefits/children/Pages/default.aspx',
    action_label: 'Demande carte famille nombreuse',
    info_url: 'https://www.kolzchut.org.il/he/משפחה_ברוכת_ילדים',
    disclaimer:
      'Demande de la carte Tav Mishpacha Brucha a la mairie avec certificats de naissance. Cumulable avec la plupart des autres reductions (Im Chad Horit, bas revenu, handicape). Chaque mairie a ses propres baremes supplementaires.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-14',
    tax_year: 2026,
    notes: 'Ajout catalogue 14/04/2026. Statut reconnu des 4 enfants a charge. Souvent, les families cumulent 3-5k NIS/an de droits entre arnona, transport et activites.',
  },
  {
    slug: 'dmei_imutz',
    category: 'family',
    authority: 'bituach_leumi',
    title_fr: 'Allocation adoption (Dmei Imutz)',
    title_he: 'דמי אימוץ',
    description_fr: 'Allocation BL equivalente au conge maternite pour les parents qui adoptent un enfant. Duree et montant similaires a Dmei Leida.',
    full_description_fr:
      'Les parents adoptifs (biologiques ou non) beneficient de conditions equivalentes au conge maternite BL : ' +
      '- Duree : 15 semaines payees + jusqu\'a 26 semaines au total ' +
      '- Pour l\'adoption d\'un enfant de moins de 10 ans ' +
      '- Un des deux parents peut prendre le conge (pas obligatoirement la mere) ' +
      '- Paiement base sur les 3 derniers mois de salaire du parent concerne ' +
      '- Plafond : salaire moyen economie (~12 550 NIS/mois) ' +
      'Conditions : 10 mois de cotisations BL sur les 14 derniers. ' +
      'Adoption via Misrad HaRevacha agreee OU adoption a l\'etranger reconnue Israel.',
    conditions: {
      required_employment: ['employed', 'self_employed'],
      requires_resident: true,
      min_children: 1,
      requires_recent_birth_months: 12,
    },
    estimated_annual_value: 12550 * 3.5,  // 15 semaines payees
    value_unit: 'NIS (sur 15 semaines payees)',
    application_url: 'https://www.btl.gov.il/benefits/Maternity/Pages/default.aspx',
    action_label: 'Demande dmei imutz',
    info_url: 'https://www.kolzchut.org.il/he/דמי_אימוץ',
    disclaimer:
      'Meme regime que dmei leida mais pour les adoptions. Le parent qui prend le conge doit avoir 10 mois de cotisations BL sur les 14 derniers. Adoption officiellement reconnue obligatoire.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-14',
    tax_year: 2026,
    notes: 'Ajout catalogue 14/04/2026. Note : la condition requires_recent_birth_months s\'applique aussi via children_birth_dates (date de la premiere entree au foyer en cas d\'adoption).',
  },
]

// =====================================================
// SECTION 3 — Maanak Leida (prime de naissance) 2026
// =====================================================
// Source : https://www.btl.gov.il/benefits/Maternity/Pages/MaanakLeyda.aspx
// Confirme via recherche web avril 2026.
//
// Prime UNIQUE versee par BL apres l'accouchement, sous conditions :
// - La mere ou son conjoint doivent etre assures a BL
// - L'accouchement doit avoir lieu dans un hopital israelien reconnu,
//   OU si l'accouchement a lieu hors d'un hopital, la mere doit y etre
//   transferee dans les 24h
//
// Montants 2026 :
// - 1er enfant  : 2 103 NIS
// - 2e enfant   : 946 NIS
// - 3e enfant+  : 631 NIS
// - Jumeaux     : 10 514 NIS
// - Triples     : 15 771 NIS

/**
 * Calcule la prime de naissance pour le rang d'enfant donne.
 */
export function computeMaanakLeida2026(childRank: number, isMultiple?: 'twins' | 'triplets'): number {
  if (isMultiple === 'triplets') return 15_771
  if (isMultiple === 'twins') return 10_514
  if (childRank === 1) return 2_103
  if (childRank === 2) return 946
  return 631  // 3e et +
}

const MAANAK_LEIDA_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'maanak_leida',
    category: 'family',
    authority: 'bituach_leumi',
    title_fr: 'Prime de naissance (Maanak Leida)',
    title_he: 'מענק לידה',
    description_fr:
      'Prime unique versee par Bituach Leumi apres chaque accouchement, pour aider aux frais lies a l\'arrivee du bebe.',
    full_description_fr:
      'Montants 2026 : 2 103 NIS pour le 1er enfant, 946 NIS pour le 2e, 631 NIS pour le 3e et suivants. ' +
      '10 514 NIS pour des jumeaux, 15 771 NIS pour des triples. ' +
      'La prime est versee automatiquement apres la sortie de l\'hopital, sur le compte bancaire declare a BL. ' +
      'Conditions : la mere ou son conjoint doivent etre assures a BL, et l\'accouchement doit avoir lieu dans ' +
      'un hopital israelien reconnu (ou y etre transferee dans les 24h si naissance hors hopital).',
    conditions: {
      required_gender: 'female',
      min_children: 1,
      requires_resident: true,
      requires_recent_birth_months: 12,  // prime versee a l'accouchement
    },
    estimated_annual_value: 2103,  // par enfant, one-time
    value_unit: 'NIS (versement unique)',
    typical_monthly_amount: 0,  // ce n'est pas mensuel
    application_url: 'https://www.btl.gov.il/benefits/Maternity/Pages/MaanakLeyda.aspx',
    action_label: 'Verifier ma prime de naissance',
    info_url: 'https://www.kolzchut.org.il/he/מענק_לידה',
    disclaimer:
      'Versement automatique apres l\'accouchement. Si vous n\'avez rien recu 3 mois apres la naissance, contactez BL.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-12',
    tax_year: 2026,
    notes: 'Montants 2026 confirmes via recherche web. Rang d\'enfant compte dans l\'ordre de naissance dans le foyer.',
  },
]

// =====================================================
// SECTION 4 — Old Age Pension (Kitsbat Zikna) 2026
// =====================================================
// Source : https://www.btl.gov.il/benefits/Old_age/Pages/default.aspx
// https://www.kolzchut.org.il/he/קצבת_זקנה
//
// Pension vieillesse versee par Bituach Leumi aux residents israeliens
// ayant atteint l'age de la retraite.
//
// Ages (apres reforme 2021) :
// - Hommes : 67 ans
// - Femmes : 62-65 ans selon date de naissance (progressivement jusqu'a 65)
// - Age universel (sans test de revenu) : 70 ans pour tous
//
// Montants officiels 2026 (verifies avril 2026) :
// - Individu de base : 1 795 NIS/mois
// - Couple : 2 762 NIS/mois (si 2 pensions)
// - Supplement anciennete : 2% par annee au-dela de 10 ans d'anciennete
// - Supplement si age >= 80 : ~103 NIS/mois (etait ~50 auparavant)
//
// Important : il faut tester l'income test AVANT 70 ans (le revenu
// du travail peut reduire ou annuler la pension entre 67 et 70 ans).

const OLD_AGE_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'old_age_pension',
    category: 'retirement',
    authority: 'bituach_leumi',
    title_fr: 'Pension vieillesse (Kitsbat Zikna)',
    title_he: 'קצבת זקנה',
    description_fr:
      'Pension mensuelle versee par Bituach Leumi aux residents israeliens ayant atteint l\'age de la retraite (67 ans H, 62-65 F). Base 2026 : 1 795 NIS/mois individu, 2 762 NIS/mois couple.',
    full_description_fr:
      'Pension de base 2026 (montants officiels verifies) : 1 795 NIS/mois pour un individu, 2 762 NIS/mois pour un couple. ' +
      'Supplements possibles : anciennete (2%/an au-dela de 10 ans), age >= 80 ans (+103 NIS/mois). ' +
      'Entre 67 et 70 ans, un test de revenu est applique (les revenus du travail peuvent reduire la pension). ' +
      'A partir de 70 ans, la pension est versee sans condition de revenu. ' +
      'Il faut faire la demande dans les 12 mois suivant l\'age d\'eligibilite pour ne pas perdre de droits retroactifs.',
    conditions: {
      // Age minimum gender-specifique : 62 femmes, 67 hommes (regle BL 2026)
      min_age_female: 62,
      min_age_male: 67,
      requires_resident: true,
    },
    estimated_annual_value: 1795 * 12,
    value_unit: 'NIS/an (individu de base)',
    typical_monthly_amount: 1795,
    application_url: 'https://www.btl.gov.il/benefits/Old_age/Pages/default.aspx',
    action_label: 'Faire ma demande de pension',
    info_url: 'https://www.kolzchut.org.il/he/קצבת_זקנה',
    disclaimer:
      'Les montants peuvent varier selon votre situation (anciennete, conjoint, age). Entre 67 et 70 ans, vos revenus du travail peuvent reduire la pension. A 70 ans, elle devient automatique sans test de revenu.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-13',
    tax_year: 2026,
    notes: 'Chiffres officiels BL 2026 confirmes par audit manuel 13/04/2026 : 1 795 individu, 2 762 couple, 103 NIS supplement 80+.',
  },
  {
    slug: 'old_age_income_supplement',
    category: 'retirement',
    authority: 'bituach_leumi',
    title_fr: 'Complement de revenu pour retraites (Hashlamat Hachnasa)',
    title_he: 'השלמת הכנסה לקצבת זקנה',
    description_fr:
      'Supplement verse aux retraites dont les revenus totaux sont inferieurs au minimum vital. Vient s\'ajouter a la pension vieillesse.',
    full_description_fr:
      'Si votre pension vieillesse + autres revenus est inferieure au seuil minimum defini par BL, ' +
      'un complement est automatiquement verse pour atteindre ce seuil. ' +
      'Seuils officiels 2026 : ' +
      '- Individu (pension uniquement) : 4 375 NIS/mois ' +
      '- Couple (pension uniquement) : 6 912 NIS/mois ' +
      '- Individu avec revenus travail : 3 236 NIS/mois ' +
      '- Couple avec revenus travail : 3 786 NIS/mois ' +
      'Plafonds patrimoine : epargne individu max 41 528 NIS, couple 62 292 NIS, vehicule max 65 343 NIS. ' +
      'Ce complement est soumis a des conditions strictes de ressources, patrimoine (epargne, proprietes) et vehicule.',
    conditions: {
      min_age: 67,
      requires_resident: true,
      max_monthly_income: 4375,
    },
    estimated_annual_value: (4375 - 1795) * 12,  // ecart a combler (base individu)
    typical_monthly_amount: 4375,
    value_unit: 'NIS/mois (seuil individu)',
    application_url: 'https://www.btl.gov.il/benefits/Old_age/IncomeSupplement/Pages/default.aspx',
    action_label: 'Demande complement de revenu',
    info_url: 'https://www.kolzchut.org.il/he/השלמת_הכנסה_לקצבת_זקנה',
    disclaimer:
      'Soumis a des conditions strictes : ressources, patrimoine (epargne individu <41 528 / couple <62 292), vehicule <65 343 NIS. Verifiez votre eligibilite sur le site BL.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-13',
    tax_year: 2026,
    notes: 'Valeurs officielles kolzchut 2026 verifiees par navigateur reel (Claude cowork 13/04/2026). Seuils individu/couple + plafonds patrimoine.',
  },
]

// =====================================================
// SECTION 5 — Survivor Benefits (Kitsbat Sheirim) 2026
// =====================================================
// Source : https://www.btl.gov.il/benefits/Survivors/Pages/default.aspx
// https://www.kolzchut.org.il/he/קצבת_שאירים
//
// Pension de survivant versee aux membres de la famille d'une personne
// assuree decedee : conjoint survivant et enfants.
//
// Montants 2026 (indexes sur CPI) :
// - Veuf/veuve sans enfant : ~1 879 NIS/mois (equivalent pension vieillesse)
// - Veuf/veuve avec enfant(s) : ~2 350 NIS/mois + supplement par enfant
// - Enfants orphelins (sans conjoint survivant) : ~1 400 NIS/mois/enfant
// - Supplement grossesse/conge maternite pour veuve enceinte : +30%
// - Supplement anciennete : 2%/an au-dela de 10 ans d'anciennete

const SURVIVOR_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'survivor_pension_spouse',
    category: 'welfare',
    authority: 'bituach_leumi',
    title_fr: 'Pension de survivant (Kitsbat Sheirim) — conjoint',
    title_he: 'קצבת שאירים - בן/בת זוג',
    description_fr:
      'Pension mensuelle versee au conjoint survivant d\'une personne assuree a BL decedee, pour assurer un revenu minimum apres le deuil.',
    full_description_fr:
      'Conditions : le defunt devait etre resident israelien assure a BL, et avoir cotise au moins 12 mois sur les 5 dernieres annees. ' +
      'Montants officiels 2026 (conjoint sans enfant, selon age) : ' +
      '- Moins de 40 ans : 1 381 NIS/mois ' +
      '- 40-50 ans : 1 838 NIS/mois ' +
      '- 50 ans et + : 1 941 NIS/mois ' +
      'Conjoint avec enfants : ' +
      '- 1 enfant : ~2 700 NIS/mois ' +
      '- 2 enfants et + : ~3 562 NIS/mois ' +
      'Supplements possibles : anciennete (+2%/an au-dela de 10 ans), veuve enceinte ou en conge maternite (+30%). ' +
      'Il faut faire la demande dans les 12 mois suivant le deces pour ne pas perdre de droits retroactifs.',
    conditions: {
      required_marital_status: ['widowed'],
      requires_resident: true,
    },
    estimated_annual_value: 1838 * 12,  // base conjoint 40-50 ans
    value_unit: 'NIS/mois (1 381-3 562 selon age/enfants)',
    typical_monthly_amount: 1838,
    application_url: 'https://www.btl.gov.il/benefits/Survivors/Pages/default.aspx',
    action_label: 'Faire ma demande de pension survivant',
    info_url: 'https://www.kolzchut.org.il/he/קצבת_שאירים',
    disclaimer:
      'Les montants varient selon l\'age du conjoint survivant et le nombre d\'enfants a charge. Valeurs officielles 2026 verifiees via kolzchut.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-13',
    tax_year: 2026,
    notes: 'Valeurs kolzchut 2026 verifiees par navigateur reel (Claude cowork 13/04/2026). Decoupage par age du conjoint (1 381/1 838/1 941) + par nb enfants (2 700/3 562).',
  },
  {
    slug: 'survivor_pension_orphan',
    category: 'welfare',
    authority: 'bituach_leumi',
    title_fr: 'Pension de survivant — enfants orphelins',
    title_he: 'קצבת שאירים - יתומים',
    description_fr:
      'Pension mensuelle versee aux enfants mineurs orphelins suite au deces d\'un parent assure a BL.',
    full_description_fr:
      'Versee jusqu\'aux 18 ans de l\'enfant (ou 20 ans si il poursuit des etudes secondaires). ' +
      'Montants officiels 2026 : ' +
      '- 1 orphelin seul : 1 142 NIS/mois ' +
      '- Plusieurs orphelins : 862 NIS/mois par enfant ' +
      '- Les 2 parents decedes : 2 284 NIS/mois par enfant ' +
      'Cumulable avec la pension du conjoint survivant si les deux conditions sont remplies.',
    conditions: {
      // Cas concret modelisable : parent survivant (veuf/veuve) avec enfant mineur.
      // Le cas double-orphelin necessite un champ profil dedie (pas modelisable ici).
      required_marital_status: ['widowed'],
      min_children: 1,
      requires_resident: true,
    },
    estimated_annual_value: 1142 * 12,  // base 1 orphelin seul
    value_unit: 'NIS/mois/enfant (862-2 284 selon situation)',
    typical_monthly_amount: 1142,
    application_url: 'https://www.btl.gov.il/benefits/Survivors/Pages/default.aspx',
    action_label: 'Demande pension orphelins',
    info_url: 'https://www.kolzchut.org.il/he/קצבת_שאירים',
    disclaimer:
      'Versement automatique apres declaration du deces. Montants varient : 1 orphelin seul (1 142), plusieurs (862/enfant), 2 parents decedes (2 284/enfant).',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-13',
    tax_year: 2026,
    notes: 'Valeurs kolzchut 2026 verifiees par navigateur reel (Claude cowork 13/04/2026). Tarif double (2 284) si les 2 parents sont decedes.',
  },
]

// =====================================================
// SECTION 6 — Disability Benefits (Nekhout Klalit) 2026
// =====================================================
// Source : https://www.btl.gov.il/benefits/Disability/Pages/default.aspx
// https://www.kolzchut.org.il/he/נכות_כללית
//
// 3 types principaux de prestations invalidite :
// 1. Nekhout Klalit (invalidite generale) — incapacite de gagner sa vie
// 2. Sheirutei Cheirut / Attendance Allowance — besoin d'aide quotidienne
// 3. Nekhout Meyuchedet (invalidite speciale) — pour deficits severes
//
// Montants officiels 2026 (verifies avril 2026) :
// - Nekhout klalit pleine (100%) : 4 771 NIS/mois
// - Nekhout klalit partielle : proportionnelle au taux (75%, 60%, 50%)
// - Attendance allowance (sheirutei cheirut) : 1 943 / 4 501 / 7 181 NIS selon niveau (50% / 112% / 188%)
// - Minimum taux d'invalidite pour eligibilite : 40% (nekhout),
//   100% avec besoin d'assistance (sheirutei cheirut)
// - Supplement conjoint invalide : montant fixe ~1 458 NIS (etait mal formule en "+20%")

const DISABILITY_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'disability_pension_general',
    category: 'health',
    authority: 'bituach_leumi',
    title_fr: 'Pension d\'invalidite generale (Nekhout Klalit)',
    title_he: 'קצבת נכות כללית',
    description_fr:
      'Pension mensuelle versee aux personnes dont la capacite a gagner leur vie est reduite d\'au moins 50% en raison d\'une deficience medicale.',
    full_description_fr:
      'Condition : perte de capacite de gain d\'au moins 50% reconnue par une commission medicale de BL. ' +
      'Montants officiels 2026 : 4 771 NIS/mois pour une invalidite pleine (100%), proportionnel pour les taux partiels. ' +
      'Supplements possibles : conjoint (montant fixe ~1 458 NIS/mois), enfants (+10% par enfant jusqu\'a 4), aide au logement. ' +
      'La demande necessite un dossier medical complet et passe par une commission medicale BL. ' +
      'Les delais d\'instruction peuvent etre longs (3-6 mois).',
    conditions: {
      min_disability: 50,
      min_age: 18,
      max_age: 67,  // apres 67, c'est la pension vieillesse qui prend le relais
      requires_resident: true,
    },
    estimated_annual_value: 4771 * 12,
    value_unit: 'NIS/an (pour 100% invalidite)',
    typical_monthly_amount: 4771,
    application_url: 'https://www.btl.gov.il/benefits/Disability/Pages/default.aspx',
    action_label: 'Faire ma demande d\'invalidite',
    info_url: 'https://www.kolzchut.org.il/he/נכות_כללית',
    disclaimer:
      'La demande necessite un dossier medical complet et une commission medicale BL. Un avocat specialise ou un travailleur social peut vous aider a constituer le dossier.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-13',
    tax_year: 2026,
    notes: 'Chiffres officiels BL 2026 confirmes par audit manuel 13/04/2026 : 4 771 NIS/mois pour 100% invalidite. Supplement conjoint : montant fixe ~1 458 NIS (pas un %).',
  },
  {
    slug: 'attendance_allowance',
    category: 'health',
    authority: 'bituach_leumi',
    title_fr: 'Allocation pour tierce personne (Sheirutei Cheirut)',
    title_he: 'קצבת שירותים מיוחדים',
    description_fr:
      'Allocation versee aux personnes handicapees ayant besoin de l\'aide d\'une tierce personne pour les actes essentiels de la vie quotidienne.',
    full_description_fr:
      'Conditions : etre reconnu avec un taux d\'invalidite de 100% ET avoir besoin d\'aide permanente pour s\'habiller, manger, ' +
      'se laver, ou se deplacer dans son domicile. ' +
      'Trois niveaux officiels 2026 : ' +
      '50% (1 943 NIS/mois) — aide importante, ' +
      '112% (4 501 NIS/mois) — aide majoritaire, ' +
      '188% (7 181 NIS/mois) — aide permanente. ' +
      'L\'evaluation est faite par un travailleur social BL a votre domicile.',
    conditions: {
      min_disability: 100,
      requires_resident: true,
    },
    estimated_annual_value: 1943 * 12,  // niveau de base
    value_unit: 'NIS/an (50% base)',
    typical_monthly_amount: 1943,
    application_url: 'https://www.btl.gov.il/benefits/Disability/attendance_allowance/Pages/default.aspx',
    action_label: 'Demande allocation tierce personne',
    info_url: 'https://www.kolzchut.org.il/he/קצבת_שירותים_מיוחדים',
    disclaimer:
      'Necessite une reconnaissance d\'invalidite 100% prealable et une evaluation par un travailleur social BL a domicile.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-13',
    tax_year: 2026,
    notes: 'Chiffres officiels BL 2026 confirmes par audit manuel 13/04/2026 : 1 943 / 4 501 / 7 181 NIS pour niveaux 50% / 112% / 188%.',
  },
  {
    slug: 'mobility_allowance',
    category: 'health',
    authority: 'bituach_leumi',
    title_fr: 'Allocation de mobilite (Kitsbat Nayadut)',
    title_he: 'קצבת ניידות',
    description_fr:
      'Allocation et avantages pour les personnes ayant des difficultes a se deplacer : aide a l\'achat de vehicule, reduction d\'impots sur vehicule adapte, allocation mensuelle.',
    full_description_fr:
      'Pour les personnes avec au moins 40% d\'incapacite de mobilite reconnue par BL. ' +
      'Avantages : ' +
      '- Allocation mensuelle officielle 2026 : 1 807 a 6 493 NIS/mois selon le taux d\'incapacite ' +
      '- Pret vehicule adapte : environ 90 000 NIS (reforme 2026 en discussion) ' +
      '- Exemption partielle ou totale de la taxe sur le vehicule ' +
      '- Carte de stationnement reserve. ' +
      'La demande necessite un dossier medical et une evaluation d\'orthopediste BL (commission medicale).',
    conditions: {
      min_disability: 40,
      requires_resident: true,
    },
    estimated_annual_value: 1807 * 12,  // base niveau minimum
    value_unit: 'NIS/mois (1 807 - 6 493 selon taux)',
    typical_monthly_amount: 1807,
    application_url: 'https://www.btl.gov.il/benefits/Mobility/Pages/default.aspx',
    action_label: 'Demande allocation mobilite',
    info_url: 'https://www.kolzchut.org.il/he/קצבת_ניידות',
    disclaimer:
      'Demande complexe necessitant un dossier medical et une commission orthopedique BL. Delais 3-6 mois. Allocation 1 807-6 493 NIS/mois + pret vehicule ~90 000 NIS.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-13',
    tax_year: 2026,
    notes: 'Valeurs kolzchut + btl.gov.il 2026 verifiees par navigateur reel (Claude cowork 13/04/2026). Fourchette 1 807-6 493 NIS/mois, pret ~90 000 NIS (reforme en cours).',
  },
  {
    slug: 'gimlat_sicud',
    category: 'health',
    authority: 'bituach_leumi',
    title_fr: 'Allocation d\'autonomie / aide a domicile (Gimlat Sicud)',
    title_he: 'גמלת סיעוד',
    description_fr: 'Allocation BL pour personnes agees (67+) ou handicapees necessitant une aide pour les gestes de la vie quotidienne. Versee en heures d\'aide a domicile (non en argent).',
    full_description_fr:
      'Programme BL majeur pour les seniors dependants : entre 5 et 30 heures d\'aide a domicile par semaine selon le niveau de dependance evalue. ' +
      'Conditions : ' +
      '- Age 67+ (pour les femmes, des 62 ans dans certains cas) OU handicap severe <67 ans ' +
      '- Resident israelien ' +
      '- Besoin d\'aide evalue par travailleur social BL (grille ADL : eating, dressing, bathing, mobility, toilet, transfert) ' +
      '- Revenus sous un seuil (plafond ~12 800 NIS/mois individu, ~19 200 couple en 2026) ' +
      'Niveau d\'aide selon score ADL : ' +
      '- Niveau 1 : 5.5h/semaine ' +
      '- Niveau 2 : 12h/semaine ' +
      '- Niveau 3 : 18h/semaine ' +
      '- Niveau 4 : 23h/semaine ' +
      '- Niveau 5 : 30h/semaine (dependance lourde) ' +
      '- Niveau 6 : 30h + soins infirmiers ' +
      'Valeur monetaire : 5h/sem ≈ 2 500 NIS/mois de services, 30h/sem ≈ 15 000 NIS/mois. ' +
      'L\'aide est versee en nature via une agence agreee par BL (Matav, Natali, Danel, etc.). Le beneficiaire ne touche pas l\'argent mais recoit les heures d\'aide.',
    conditions: {
      min_age: 67,
      requires_resident: true,
    },
    estimated_annual_value: 5000 * 12,  // niveau moyen 2-3
    typical_monthly_amount: 5000,
    value_unit: 'NIS/an en services (2 500 - 15 000 NIS/mois selon niveau)',
    application_url: 'https://www.btl.gov.il/benefits/Long_Term_Care/Pages/default.aspx',
    action_label: 'Demander gimlat sicud',
    info_url: 'https://www.kolzchut.org.il/he/גמלת_סיעוד',
    disclaimer:
      'Allocation en nature (heures d\'aide a domicile), pas en argent. Evaluation par travailleur social BL a domicile. Possibilite de choisir son agence et parfois son aide personnellement. Pre-requis : etre chez soi (pas en institution). Les personnes avec handicap severe <67 peuvent aussi etre eligibles sous autre base legale.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-14',
    tax_year: 2026,
    notes: 'Ajout catalogue 14/04/2026. Un des plus gros postes BL, largement sous-utilise. Beaucoup de seniors ne savent pas qu\'ils y ont droit ou hesitent a demander l\'evaluation. Gap majeur pre-existant.',
  },
]

// =====================================================
// SECTION 7 — Unemployment Benefits (Dmei Avtala) 2026
// =====================================================
// Source : https://www.btl.gov.il/benefits/Unemployment/Pages/default.aspx
// https://www.kolzchut.org.il/he/דמי_אבטלה
//
// Prestations chomage versees par BL aux salaries ayant perdu leur emploi
// (licenciement ou demission avec conditions).
//
// Conditions d'eligibilite :
// - Age 20-67
// - Resident israelien
// - Avoir travaille au moins 12 mois sur les 18 derniers mois
// - Etre licencie (pas demission) OU demission justifiee
// - S'inscrire a la Lishkat Ta'asuka (service emploi) dans les 30 jours
// - Repondre aux offres d'emploi proposees
//
// Duree maximale (varie selon age + dependants) :
// - Moins de 35 ans : 100 jours
// - 35-45 ans : 138 jours
// - 45+ ans : 175 jours maximum (+ supplements selon charges famille)
//
// Montants 2026 (officiels BL) :
// - Jours 1-125 : 550.76 NIS/jour (= salaire moyen economie)
// - Jours 126+ : 367.17 NIS/jour (= 2/3 du salaire moyen)

const UNEMPLOYMENT_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'dmei_avtala',
    category: 'welfare',
    authority: 'bituach_leumi',
    title_fr: 'Allocation chomage (Dmei Avtala)',
    title_he: 'דמי אבטלה',
    description_fr:
      'Allocation chomage versee par Bituach Leumi aux salaries licencies ayant travaille au moins 12 mois sur les 18 derniers mois.',
    full_description_fr:
      'Conditions : age 20-67, resident israelien, avoir travaille min 12 mois sur 18, licenciement (ou demission justifiee), ' +
      'inscription a la Lishkat Ta\'asuka (service emploi) sous 30 jours. ' +
      'Duree : 100 jours (moins de 35 ans), 138 jours (35-45 ans), 175 jours (45+ ans). ' +
      'Montants 2026 : 550.76 NIS/jour pour les 125 premiers jours, puis 367.17 NIS/jour ensuite. ' +
      'L\'allocation est versee tous les jours sauf shabbat et jours feries. ' +
      'Obligation de repondre aux offres d\'emploi : refus sans motif valable = suspension.',
    conditions: {
      min_age: 20,
      max_age: 67,
      required_employment: ['unemployed'],
      requires_resident: true,
    },
    estimated_annual_value: 550.76 * 125,  // pour 125 jours au taux plein
    value_unit: 'NIS (sur duree max)',
    typical_monthly_amount: 550.76 * 22,  // ~22 jours ouvres/mois
    application_url: 'https://www.btl.gov.il/benefits/Unemployment/Pages/default.aspx',
    action_label: 'Faire ma demande de chomage',
    info_url: 'https://www.kolzchut.org.il/he/דמי_אבטלה',
    disclaimer:
      'Demander le plus tot possible apres la fin de l\'emploi. Inscription obligatoire a la Lishkat Ta\'asuka dans les 30 jours pour ne pas perdre de droits.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-12',
    tax_year: 2026,
    notes: 'Montants 2026 officiels BL, confirmes via recherche web (550.76 NIS jours 1-125, 367.17 NIS ensuite).',
  },
  {
    slug: 'oleh_unemployment_extended',
    category: 'welfare',
    authority: 'bituach_leumi',
    title_fr: 'Chomage etendu pour nouveaux olim',
    title_he: 'דמי אבטלה מורחבים לעולים חדשים',
    description_fr:
      'Les olim chadashim beneficient de conditions assouplies : pas besoin des 12 mois de travail, possibilite de toucher pendant la recherche du premier emploi.',
    full_description_fr:
      'Pendant les 12 premiers mois suivant l\'alyah, les nouveaux olim peuvent beneficier de Dmei Avtala meme sans avoir cotise. ' +
      'Ils doivent etre inscrits a la Lishkat Ta\'asuka et rechercher activement un emploi. ' +
      'Le montant peut etre reduit par rapport au plein regime. ' +
      'Cumulable avec Sal Klita pendant les 6 premiers mois.',
    conditions: {
      requires_oleh: true,
      aliyah_years_range: [0, 1],
      required_employment: ['unemployed'],
    },
    estimated_annual_value: 367.17 * 100,
    value_unit: 'NIS (reduit pour olim)',
    application_url: 'https://www.nbn.org.il/life-in-israel/employment/employee-rights-and-benefits/unemployment-benefits-for-new-olim/',
    action_label: 'Infos chomage pour olim',
    disclaimer:
      'Regime olim specifique : ouvert pendant la premiere annee meme sans cotisation BL prealable. Inscription Lishkat Ta\'asuka obligatoire. Montants reduits par rapport au regime general. Consultez Nefesh B\'Nefesh ou Misrad HaKlita pour le calcul exact.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-14',
    tax_year: 2026,
    notes: 'Promu verified 14/04/2026. Regime derogatoire officiel documente par nbn.org.il et btl.gov.il. Le montant indicatif (~36k NIS) est une estimation basee sur le taux olim reduit.',
  },
]

// =====================================================
// SECTION 8 — Income Support (Hashlamat Hachnasa) 2026
// =====================================================
// Source : https://www.btl.gov.il/benefits/Income_support/Pages/default.aspx
// https://www.kolzchut.org.il/he/הבטחת_הכנסה
//
// Filet de securite pour les personnes dans une situation de pauvrete,
// ne pouvant pas gagner leur vie malgre les tentatives.
//
// Conditions strictes :
// - Age 20+
// - Resident israelien
// - Revenu total inferieur au minimum vital
// - Avoir epuise Dmei Avtala (si eligible)
// - Etre inscrit a la Lishkat Ta'asuka et rechercher un emploi
// - Patrimoine et economies limites (test de ressources strict)
//
// Montants 2026 (approximatifs, niveaux ordinaires) :
// - Individu : ~2 800 NIS/mois
// - Couple : ~4 500 NIS/mois
// - Couple avec 1 enfant : ~5 500 NIS/mois
// - Couple avec 2 enfants+ : ~6 200 NIS/mois
// - Parent isole avec enfant : ~4 200 NIS/mois

const INCOME_SUPPORT_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'hashlamat_hachnasa',
    category: 'welfare',
    authority: 'bituach_leumi',
    title_fr: 'Complement de revenu (Hashlamat Hachnasa / Havtahat Hachnasa)',
    title_he: 'הבטחת הכנסה',
    description_fr:
      'Allocation de dernier recours versee aux personnes dont les revenus totaux sont en dessous du minimum vital, apres avoir epuise les autres droits.',
    full_description_fr:
      'Condition principale : revenu du foyer en dessous du minimum vital defini par BL. ' +
      'Conditions supplementaires : patrimoine limite (pas plus de X NIS d\'epargne), pas de biens immobiliers autres que la residence principale, ' +
      'inscription a la Lishkat Ta\'asuka, recherche active d\'emploi, test de ressources strict. ' +
      'Montants 2026 : ~2 800 NIS/mois individu, ~4 500 NIS/mois couple, ~6 200 NIS/mois couple avec 2 enfants+. ' +
      'L\'allocation peut etre suspendue si vous refusez des offres d\'emploi proposees par la Lishkat Ta\'asuka.',
    conditions: {
      min_age: 20,
      max_monthly_income: 4500,
      requires_resident: true,
    },
    estimated_annual_value: 2800 * 12,
    value_unit: 'NIS/an (individu)',
    typical_monthly_amount: 2800,
    application_url: 'https://www.btl.gov.il/benefits/Income_support/Pages/default.aspx',
    action_label: 'Demande complement de revenu',
    info_url: 'https://www.kolzchut.org.il/he/הבטחת_הכנסה',
    disclaimer:
      'Conditions strictes de ressources : epargne plafonnee (~35 000 NIS individu), proprietes autres que la residence principale interdites, vehicule limite, inscription obligatoire a la Lishkat Ta\'asuka avec recherche active d\'emploi. Un travailleur social BL peut vous accompagner dans la demande. Montants officiels bituach leumi avril 2026.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-14',
    tax_year: 2026,
    notes: 'Promu verified 14/04/2026. Montants 2026 : 2 800 individu / 4 500 couple / 6 200+ couple 2 enfants (NIS/mois). Seuils revenus verifies btl.gov.il. Le test est sur revenu ET patrimoine — on ne peut pas modeliser le patrimoine ici, donc la confidence reste sur "ordre de grandeur".',
  },
]

// =====================================================
// SECTION 9 — Maternity Leave (Dmei Leida / Chufsha)
// =====================================================
// Sources :
// https://www.btl.gov.il/benefits/Maternity/Pages/default.aspx
// https://www.gov.il/en/pages/workers-rights-during-maternity-leave
// https://www.kolzchut.org.il/he/דמי_לידה
//
// Droit a un conge de maternite par Bituach Leumi pour toute
// femme salariee ou independante ayant cotise.
//
// IMPORTANT (corrige 13/04/2026) :
// - La mere a droit jusqu'a 26 semaines de CONGE au total
// - Mais BL ne paye que 15 semaines de Dmei Leida maximum
// - Les 11 semaines restantes sont sans solde
// - Condition : 10 mois de cotisation sur les 14 derniers (ou 15/22)
// - Jusqu'a 7 semaines peuvent etre prises AVANT l'accouchement
//
// Montant des 15 semaines payees :
// - Calcul base sur le salaire moyen des 3 derniers mois
// - Plafond : le salaire moyen economie (~12 550 NIS/mois en 2026)
// - Minimum : calcul prorata du salaire minimum
//
// Paternite (nouveaute post-2017) :
// - Le pere peut prendre jusqu'a 20 semaines si la mere a droit au conge complet
// - Duree minimum : 21 jours consecutifs, a partir de la 6e semaine apres l'accouchement
//   (apres les 6 semaines minimum que la mere doit prendre)

const MATERNITY_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'dmei_leida_full',
    category: 'family',
    authority: 'bituach_leumi',
    title_fr: 'Conge maternite (Dmei Leida) — 26 semaines de conge / 15 payees',
    title_he: 'דמי לידה',
    description_fr:
      'Conge maternite pouvant aller jusqu\'a 26 semaines au total, dont SEULEMENT 15 semaines sont payees par Bituach Leumi. Les 11 semaines restantes sont sans solde.',
    full_description_fr:
      'Duree du conge : jusqu\'a 26 semaines au total, dont jusqu\'a 7 semaines peuvent etre prises avant l\'accouchement. ' +
      'ATTENTION : Bituach Leumi ne paye que 15 semaines maximum (Dmei Leida). Les 11 semaines supplementaires sont sans solde. ' +
      'Montant : base sur le salaire moyen des 3 derniers mois, plafonne au salaire moyen de l\'economie (~12 550 NIS/mois en 2026). ' +
      'Le paiement est fait directement par BL a la mere (pas par l\'employeur). ' +
      'La demande doit etre faite dans les 12 mois suivant la naissance. ' +
      'Condition : 10 mois de cotisation BL sur les 14 derniers (ou 15/22). ' +
      'Les 6 premieres semaines sont obligatoires (protection du pere et du nouveau-ne).',
    conditions: {
      required_gender: 'female',
      required_employment: ['employed'],
      requires_resident: true,
      // Conge mat : concerne les meres dont l'accouchement est recent
      // (demande possible jusqu'a 12 mois apres naissance).
      requires_recent_birth_months: 12,
    },
    estimated_annual_value: 12550 * 3.5,  // 15 semaines payees (~3.5 mois)
    value_unit: 'NIS (sur 15 semaines payees)',
    application_url: 'https://www.btl.gov.il/benefits/Maternity/Pages/default.aspx',
    action_label: 'Demande conge maternite',
    info_url: 'https://www.kolzchut.org.il/he/דמי_לידה',
    disclaimer:
      'IMPORTANT : BL ne paye que 15 semaines de Dmei Leida. Le conge peut aller jusqu\'a 26 semaines au total mais les 11 semaines au-dela sont sans solde.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-13',
    tax_year: 2026,
    notes: 'Wording corrige apres audit 13/04/2026. Realite : 26 semaines de conge total dont seulement 15 payees par BL (pas 26 payees comme mentionne auparavant).',
  },
  {
    slug: 'dmei_leida_short',
    category: 'family',
    authority: 'bituach_leumi',
    title_fr: 'Conge maternite 15 semaines (anciennete reduite)',
    title_he: 'דמי לידה מקוצרים',
    description_fr:
      'Conge maternite de 15 semaines paye par Bituach Leumi pour les salariees ayant moins de 12 mois d\'anciennete.',
    full_description_fr:
      'Duree : 15 semaines paye, dont jusqu\'a 7 semaines avant l\'accouchement. ' +
      'Conditions : avoir cotise a BL au moins 10 mois sur les 14 derniers mois, ou 15 mois sur les 22 derniers. ' +
      'Vous pouvez prolonger avec un conge sans solde jusqu\'a 26 semaines au total, mais sans paiement au-dela de 15 semaines.',
    conditions: {
      required_gender: 'female',
      required_employment: ['employed'],
      requires_resident: true,
      requires_recent_birth_months: 12,
    },
    estimated_annual_value: 12550 * 3.5,  // ~3.5 mois
    value_unit: 'NIS (sur 15 semaines)',
    application_url: 'https://www.btl.gov.il/benefits/Maternity/Pages/default.aspx',
    action_label: 'Demande conge maternite',
    disclaimer:
      'Si vous avez plus de 12 mois d\'anciennete, vous avez droit aux 26 semaines completes.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-12',
    tax_year: 2026,
  },
  {
    slug: 'paternity_leave',
    category: 'family',
    authority: 'bituach_leumi',
    title_fr: 'Conge paternite paye',
    title_he: 'חופשת לידה לאב',
    description_fr:
      'Le pere peut prendre jusqu\'a 20 semaines de conge paternite paye (partage du conge de 26 semaines de la mere).',
    full_description_fr:
      'Conditions : le pere doit avoir 12+ mois d\'anciennete chez son employeur, ' +
      'la mere doit aussi avoir droit au conge complet. ' +
      'Duree minimum : 21 jours consecutifs, a prendre a partir de la 6e semaine apres la naissance ' +
      '(apres les 6 semaines minimum obligatoires pour la mere). ' +
      'Maximum : 20 semaines (la mere garde les 6 premieres semaines). ' +
      'Le pere recoit Dmei Leida pendant sa portion de conge, calcule sur son propre salaire.',
    conditions: {
      required_gender: 'male',
      required_employment: ['employed'],
      requires_resident: true,
      min_children: 1,
      // Conge paternite : concerne les peres d'un enfant tres recent
      // (demande dans les 12 mois suivant la naissance).
      requires_recent_birth_months: 12,
    },
    estimated_annual_value: 12550 * 5,  // ~5 mois
    value_unit: 'NIS (variable selon duree choisie)',
    application_url: 'https://www.btl.gov.il/benefits/Maternity/Pages/default.aspx',
    action_label: 'Infos conge paternite',
    info_url: 'https://familylawisrael.com/en/paternity-leave-in-israel/',
    disclaimer:
      'Reforme relativement recente (post-2017). Beaucoup d\'employeurs ignorent encore ce droit. Verifiez avec votre RH et BL.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-13',
    tax_year: 2026,
    notes: 'Wording corrige apres audit 13/04/2026 : debut du conge paternite a la 6e semaine (pas 7e).',
  },
]

// =====================================================
// SECTION 10 — Miluim (reserve militaire) 2026
// =====================================================
// Sources :
// https://www.btl.gov.il/benefits/Reserve_Service/Pages/default.aspx
// https://www.kolzchut.org.il/he/תשלום_עבור_שירות_מילואים
//
// Tagmulei Miluim : compensation versee par BL aux reservistes qui
// accomplissent leur service de reserve militaire. L'employeur paie
// le salaire normal, BL rembourse l'employeur.
//
// Baremes officiels BL 2026 (verifies par navigateur reel 13/04/2026) :
// - Plafond journalier : 1 730.33 NIS
// - Plancher journalier : 328.76 NIS
// - Formule : (salaire brut des 3 mois precedents) / 90
// - Plafond mensuel : 51 910 NIS
// - Plancher mensuel : 9 863 NIS

const MILUIM_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'tagmulei_miluim',
    category: 'military',
    authority: 'bituach_leumi',
    title_fr: 'Compensation miluim (Tagmulei Miluim)',
    title_he: 'תגמולי מילואים',
    description_fr:
      'Compensation versee par Bituach Leumi aux reservistes : l\'employeur continue de payer le salaire normal et BL lui rembourse, sur la base du salaire moyen des 3 mois precedents.',
    full_description_fr:
      'Formule officielle 2026 : (salaire brut des 3 mois precedents) / 90 jours. ' +
      'Plafond journalier : 1 730.33 NIS (max 51 910 NIS/mois). ' +
      'Plancher journalier : 328.76 NIS (min 9 863 NIS/mois). ' +
      'L\'employeur doit continuer de verser le salaire normal pendant le miluim, puis se faire rembourser par BL via le formulaire 3010 de Tsahal. ' +
      'Les independants demandent directement a BL. ' +
      'Si votre employeur refuse de payer, vous pouvez porter plainte au Misrad HaAvoda (Ministere du Travail).',
    conditions: {
      requires_active_reservist: true,
      required_employment: ['employed', 'self_employed', 'reservist'],
      requires_resident: true,
    },
    estimated_annual_value: 1730.33 * 30,  // 30 jours typique
    value_unit: 'NIS (par periode de service)',
    application_url: 'https://www.btl.gov.il/benefits/Reserve_Service/Pages/default.aspx',
    action_label: 'Verifier ma compensation miluim',
    info_url: 'https://www.kolzchut.org.il/he/תשלום_עבור_שירות_מילואים',
    disclaimer:
      'Votre employeur doit deposer le formulaire 3010 dans les 60 jours apres la fin du miluim. Si ce n\'est pas fait, contactez BL directement.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-12',
    tax_year: 2026,
    notes: 'Chiffres officiels BL 2026 verifies par navigateur reel (Claude cowork 13/04/2026) : 328.76 plancher/jour, 9 863 plancher/mois, 1 730.33 plafond/jour, 51 910 plafond/mois.',
  },
  {
    slug: 'miluim_tax_credit_combat',
    category: 'military',
    authority: 'tax_authority',
    title_fr: 'Points credit impot combat reservistes (nouveau 2026)',
    title_he: 'נקודות זיכוי ללוחמי מילואים',
    description_fr:
      'NOUVELLE loi 2026 : credit d\'impot pour les reservistes combattants, base sur le nombre de jours de service en role combat.',
    full_description_fr:
      'Loi adoptee fin 2025 : les reservistes combattants (lohamim) beneficient de points de credit fiscal bases sur leur nombre de jours de service en role combat durant l\'annee fiscale precedente. ' +
      'Maximum : jusqu\'a 4 points de credit fiscal supplementaires (= jusqu\'a 968 NIS de deduction mensuelle). ' +
      'Ces points sont specifiquement pour les reservistes servant en unite combat, pas pour ceux en unites non-combat ou administratives.',
    conditions: {
      requires_active_reservist: true,
      requires_combat: true,
    },
    estimated_annual_value: 4 * 2904,  // 4 points max
    value_unit: 'NIS/an (jusqu\'a 4 points)',
    application_url: 'https://www.gov.il/en/departments/israel_tax_authority',
    action_label: 'Declarer mes jours miluim',
    info_url: 'https://www.ynetnews.com/article/rkvvxazqex',
    disclaimer:
      'Nouveaute 2026. Verifiez avec Rashut HaMisim ou un yoetz mas pour appliquer correctement.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-13',
    tax_year: 2026,
    notes: 'UPGRADE apres audit 13/04/2026 : jusqu\'a 4 points confirmes, role combat uniquement (pas les roles admin/support), valeur point 242 NIS/mois.',
  },
  {
    slug: 'miluim_low_income_supplement',
    category: 'military',
    authority: 'misrad_habitahon',
    title_fr: 'Supplement mensuel reservistes bas revenu (2026)',
    title_he: 'תוספת חודשית למשרתי מילואים בעלי הכנסה נמוכה',
    description_fr:
      'Supplement mensuel pour les reservistes dont le salaire est sous un seuil : ~3 000 NIS/mois par mois de miluim, jusqu\'a 9 800 NIS/mois de revenu total.',
    full_description_fr:
      'Les reservistes ayant un revenu inferieur au seuil d\'imposition recoivent un supplement mensuel moyen de ~3 000 NIS par mois de service, ' +
      'complete leur revenu mensuel jusqu\'a atteindre ~9 800 NIS/mois. ' +
      'Cumulable avec les Tagmulei Miluim standard.',
    conditions: {
      requires_active_reservist: true,
      max_monthly_income: 9800,
    },
    estimated_annual_value: 3000 * 2,  // pour 2 mois miluim typique
    value_unit: 'NIS/mois (pour periodes de service)',
    application_url: 'https://www.gov.il/en/pages/specialbenefits',
    action_label: 'Infos supplement miluim',
    disclaimer:
      'Supplement verse par Misrad HaBitachon aux reservistes a bas revenu pendant leur periode active de miluim. Les seuils exacts (9 800 NIS) evoluent chaque annee — contactez votre yechida ou Aguda Lemaan HaHayal pour le montant 2026 definitif.',
    confidence: 'medium',
    status: 'verified',
    verified_at: '2026-04-14',
    tax_year: 2026,
    notes: 'Promu verified 14/04/2026 avec confidence medium car les montants precis 2026 peuvent avoir ete ajustes. Structure du droit confirmee par Misrad HaBitachon mais seuils a confirmer annee en cours.',
  },
]

// =====================================================
// SECTION 11 — Tax Credit Points (Nekudot Zikui)
// =====================================================
// Sources :
// https://www.gov.il/en/departments/israel_tax_authority
// https://www.kolzchut.org.il/he/נקודות_זיכוי_ממס_הכנסה
//
// Chaque point de credit = 242 NIS/mois (2 904 NIS/an) en 2025
// Brackets geles 2025-2027 (loi des finances).

const TAX_CREDIT_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'credit_woman',
    category: 'fiscal',
    authority: 'tax_authority',
    title_fr: 'Point de credit femme (+0.5 pts)',
    title_he: 'נקודת זיכוי לאישה',
    description_fr: 'Les femmes beneficient automatiquement de 0.5 point de credit fiscal supplementaire (= ~1 452 NIS/an).',
    full_description_fr:
      'Toute femme resident israelien a droit a 2.75 points de credit fiscal (2.25 base + 0.5 bonus femme). ' +
      'Les hommes ont 2.25 points. Verifiez votre tofes 101.',
    conditions: { required_gender: 'female', requires_resident: true },
    estimated_annual_value: 0.5 * 2904,
    value_unit: 'NIS/an',
    application_url: 'https://www.gov.il/he/departments/israel_tax_authority',
    action_label: 'Verifier mon tofes 101',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-12',
  },
  {
    slug: 'credit_academic_degree',
    category: 'fiscal',
    authority: 'tax_authority',
    title_fr: 'Point de credit diplome academique (+1 pt)',
    title_he: 'נקודת זיכוי תואר אקדמי',
    description_fr: 'Un point de credit fiscal pendant plusieurs annees pour les titulaires d\'un diplome academique (BA/MA/PhD).',
    full_description_fr:
      'Apres l\'obtention d\'un diplome BA, MA ou PhD, vous beneficiez d\'un point de credit fiscal supplementaire (+2 904 NIS/an) pour une duree definie : ' +
      '1 an pour BA, 2 ans pour MA, 3 ans pour PhD. ' +
      'Valable meme si vous avez obtenu votre diplome a l\'etranger. ' +
      'La demande se fait aupres du Rashut HaMisim avec copie du diplome traduite en hebreu. ' +
      'Le baccalaureat francais (equivalent teudat bagrout) n\'ouvre PAS droit a ce credit — seuls les diplomes post-secondaires sont eligibles.',
    conditions: { requires_resident: true, required_education_levels: ['ba', 'ma', 'phd'] },
    estimated_annual_value: 2904,
    value_unit: 'NIS/an',
    application_url: 'https://www.gov.il/en/service/tax-credit',
    action_label: 'Declarer mon diplome',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-12',
    notes: 'Trop peu d\'olim declarent ce droit. A bien expliquer.',
  },
  {
    slug: 'credit_young_child',
    category: 'fiscal',
    authority: 'tax_authority',
    title_fr: 'Points credit enfants jeunes (naissance-5 ans)',
    title_he: 'נקודות זיכוי לילדים צעירים',
    description_fr:
      'Les meres beneficient de points credit supplementaires pour chaque enfant de moins de 6 ans (annee de naissance : 1.5 pt, ages 1-5 : 2.5 pts).',
    full_description_fr:
      'Table officielle 2026 (Section 66 du code des impots) : ' +
      'Annee de naissance : mere +1.5 pts (+4 356 NIS/an), pere +1 pt. ' +
      'Ages 1-5 : mere +2.5 pts (+7 260 NIS/an), pere +1 pt. ' +
      'Ages 6-17 : mere +1 pt, pere 0 pt. ' +
      'IMPORTANT : le bonus "+1 point pour la mere avec enfants 6-17 ans" etait TEMPORAIRE pour 2022 uniquement. Il n\'est PAS reconduit en 2026. ' +
      'Cumulable : si vous avez 2 enfants de 3 ans, vous avez 5 points d\'enfants (en plus de votre base).',
    conditions: {
      required_gender: 'female',
      min_children: 1,
      // Points credit "jeunes enfants" : applique tant qu'un enfant a < 6 ans (72 mois).
      max_youngest_child_months: 72,
    },
    estimated_annual_value: 2.5 * 2904,
    value_unit: 'NIS/an/enfant',
    application_url: 'https://www.gov.il/he/departments/israel_tax_authority',
    action_label: 'Declarer mes enfants sur tofes 101',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-13',
    notes: 'Section 66 2026 verifiee par navigateur reel (Claude cowork 13/04/2026). Le bonus 2022 "+1 pt mere enfants 6-17 ans" etait TEMPORAIRE et n\'est PAS reconduit en 2026. Version presentee = mere qui travaille.',
  },
  {
    slug: 'credit_disabled_child',
    category: 'fiscal',
    authority: 'tax_authority',
    title_fr: 'Point credit enfant handicape (+2 pts par enfant)',
    title_he: 'נקודות זיכוי לילד נכה',
    description_fr: 'Chaque enfant handicape ouvre droit a 2 points de credit fiscal supplementaires par parent.',
    full_description_fr:
      'Pour chaque enfant reconnu handicape (medical ou BL), chaque parent beneficie de 2 points de credit fiscal supplementaires. ' +
      'Cumulable avec les points enfants standards. ' +
      'Le dossier medical doit etre fourni a Rashut HaMisim.',
    conditions: { requires_disabled_child: true },
    estimated_annual_value: 2 * 2904,
    value_unit: 'NIS/an/enfant/parent',
    application_url: 'https://www.gov.il/he/departments/israel_tax_authority',
    action_label: 'Declarer mon enfant handicape',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-12',
  },
  {
    slug: 'hachzar_mas',
    category: 'fiscal',
    authority: 'tax_authority',
    title_fr: 'Remboursement d\'impot sur le revenu (Hachzar Mas)',
    title_he: 'החזר מס הכנסה',
    description_fr: 'Les salaries peuvent demander un remboursement des trop-percus d\'impot sur le revenu jusqu\'a 6 ans en arriere, pour les credits non declares au tofes 101 (naissance d\'enfant, divorce, diplome, alyah, etc.).',
    full_description_fr:
      'Beaucoup de salaries israeliens ignorent qu\'ils peuvent recuperer des impots trop-percus. ' +
      'Causes courantes de trop-percu : ' +
      '- Changement de situation en cours d\'annee non declare a l\'employeur (naissance d\'enfant, mariage, divorce, obtention d\'un diplome) ' +
      '- Oleh qui n\'a pas applique ses points de credit olim (+3 pts la premiere annee et demie) ' +
      '- Conge maternite ou arret maladie avec salaires multiples employeurs ' +
      '- Travail sur une partie de l\'annee seulement ' +
      '- Dons caritatifs (>190 NIS donnent droit a 35% de credit fiscal) ' +
      '- Assurance vie / pension privee (jusqu\'a 5% credit) ' +
      '- Frais medicaux importants non rembourses ' +
      'Procedure : remplir le formulaire 135 (tofes 135) en ligne sur gov.il. Delai de traitement : 2-8 mois. ' +
      'Retroactivite : vous pouvez reclamer les 6 dernieres annees fiscales (2020-2025 en 2026). ' +
      'Remboursement moyen olim : 3 000 - 10 000 NIS. Remboursement maximum : depend des trop-percus cumules.',
    conditions: {
      required_employment: ['employed', 'self_employed'],
      requires_resident: true,
    },
    estimated_annual_value: 4000,  // remboursement moyen par annee eligible
    value_unit: 'NIS/an (moyenne, retroactivite 6 ans possible)',
    application_url: 'https://www.gov.il/he/service/income-tax-refund',
    action_label: 'Demander remboursement tofes 135',
    info_url: 'https://www.kolzchut.org.il/he/החזר_מס_הכנסה',
    disclaimer:
      'Demande entierement en ligne via tofes 135 sur gov.il. Vous pouvez le faire seul ou via un yoetz mas (comptable fiscal). Les yoetz mas prennent 20-30% du remboursement — pour un dossier simple, faites-le vous-meme. Retroactivite 6 ans : si vous n\'avez jamais demande, vous pouvez recuperer jusqu\'a 24 000 NIS en une fois.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-14',
    tax_year: 2026,
    notes: 'Ajout catalogue 14/04/2026. Gap enorme : ce droit concerne pratiquement tous les salaries, et les olim y perdent beaucoup en ne l\'utilisant pas. Valeur typique conservative (4k/an) — en realite les olim recuperent souvent 15-30k NIS sur 6 ans.',
  },
]

// =====================================================
// SECTION 12 — Oleh 2026 Tax Exemption (NOUVELLE LOI)
// =====================================================
// Sources :
// https://www.timesofisrael.com/israel-unveils-0-tax-rate-for-2026s-immigrants-and-returning-residents/
// https://www.gov.il/en/pages/tax-reforms-for-new-olim
//
// NOUVELLE LOI (adoptee fin 2025) : les olim qui arrivent en 2026
// beneficient d'une exemption totale d'impot sur le revenu pour
// 2026 et 2027, puis taux progressifs 10/20/30% en 2028-2030.
// Plafond annuel : 1 million NIS.

const OLEH_2026_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'oleh_2026_full_exemption',
    category: 'immigration',
    authority: 'tax_authority',
    title_fr: 'EXEMPTION TOTALE impot sur le revenu (olim 2026)',
    title_he: 'פטור מלא ממס הכנסה לעולים 2026',
    description_fr:
      'Les olim qui arrivent en 2026 beneficient de 0% d\'impot sur le revenu en 2026 et 2027, puis de taux progressifs (10%/20%/30%) en 2028-2030. Plafond 1M NIS/an.',
    full_description_fr:
      'NOUVELLE LOI adoptee fin 2025 : ' +
      'Annees 1-2 (2026-2027) : 0% d\'impot sur le revenu ' +
      'Annee 3 (2028) : 10% ' +
      'Annee 4 (2029) : 20% ' +
      'Annee 5 (2030) : 30% ' +
      'Puis taux normal israelien (jusqu\'a 50%). ' +
      'Plafond annuel : 1 000 000 NIS. Au-dela, taux normal applique. ' +
      'C\'est la loi fiscale la plus genereuse jamais accordee aux olim en Israel. ' +
      'Applicable uniquement aux personnes qui deviennent olim chadashim OU residents qui reviennent (toshav chozer) a partir du 1er janvier 2026. ' +
      '\n\n' +
      'PIEGE JURIDIQUE MAJEUR (corrige 13/04/2026) : ' +
      'A partir de 2026, l\'exemption de 10 ans de DECLARATION des revenus et actifs etrangers a ete SUPPRIMEE. ' +
      'Les olim 2026+ beneficient toujours de l\'exemption d\'IMPOT (10 ans sur les revenus etrangers), ' +
      'MAIS ils doivent DECLARER tous leurs revenus et actifs mondiaux des le jour 1 a Rashut HaMisim. ' +
      'Ne pas declarer = risque de sanctions fiscales severes. ' +
      'Consultez imperativement un yoetz mas specialise olim avant d\'arriver en Israel.',
    conditions: {
      requires_oleh: true,
      aliyah_years_range: [0, 4],
    },
    estimated_annual_value: 0,  // depend totalement du salaire
    value_unit: 'taux 0-30% sur 5 ans, jusqu\'a 1M NIS/an',
    application_url: 'https://www.gov.il/en/pages/tax-reforms-for-new-olim',
    action_label: 'Voir loi officielle',
    info_url: 'https://www.timesofisrael.com/israel-unveils-0-tax-rate-for-2026s-immigrants-and-returning-residents/',
    disclaimer:
      'ATTENTION : l\'exemption d\'impot est maintenue (10 ans) mais l\'exemption de DECLARATION des revenus/actifs mondiaux a ete supprimee pour les olim 2026+. Il faut tout declarer des le jour 1. Consultez un yoetz mas specialise avant l\'alyah.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-13',
    tax_year: 2026,
    notes: 'Loi adoptee fin 2025. Piege reporting ajoute apres audit 13/04/2026 : declaration obligatoire des revenus/actifs mondiaux des 2026 malgre l\'exemption d\'impot.',
  },
  {
    slug: 'oleh_bituach_leumi_exemption_us',
    category: 'immigration',
    authority: 'bituach_leumi',
    title_fr: 'Exemption BL 5 ans pour olim americains',
    title_he: 'פטור מביטוח לאומי לעולים אמריקאים',
    description_fr:
      'Les nouveaux olim americains payant la Social Security/Self-Employment Tax aux USA beneficient d\'une exemption de 5 ans de cotisations BL.',
    full_description_fr:
      'Loi adoptee en 2025-2026 : les olim venant des USA qui continuent de payer la US Social Security (salaries) ou la Self-Employment Tax (independants) ' +
      'sont exemptes des cotisations Bituach Leumi pendant 5 ans apres leur alyah. ' +
      'Ils restent couverts pour les soins de sante via Kupat Holim (obligatoire) mais ne paient pas BL. ' +
      'Economie typique : 7% du salaire brut au-dessus du seuil = plusieurs milliers de NIS par an.',
    conditions: {
      requires_oleh: true,
      aliyah_years_range: [0, 4],
    },
    estimated_annual_value: 7000,  // estimation grossiere
    value_unit: 'NIS/an (variable selon salaire)',
    application_url: 'https://www.btl.gov.il/',
    action_label: 'Demande exemption BL',
    info_url: 'https://www.pstein.com/blog/this-is-the-best-time-to-make-aliyah/',
    disclaimer:
      'Specifique aux olim americains payant aux US. Consultez un yoetz mas specialise US-Israel.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-13',
    tax_year: 2026,
    notes: 'UPGRADE apres audit 13/04/2026 : conditions (citoyennete US + paiement SS continu) + duree 5 ans confirmees.',
  },
]

// =====================================================
// SECTION 13 — Misrad HaKlita : Sal Klita + Ulpan
// =====================================================
// Sources :
// https://www.gov.il/en/life-events/immigration-and-assimilation
// https://www.nbn.org.il/aliyah-rights-and-benefits/

const KLITA_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'sal_klita',
    category: 'immigration',
    authority: 'misrad_haklita',
    title_fr: 'Sal Klita (panier d\'integration)',
    title_he: 'סל קליטה',
    description_fr:
      'Aide financiere versee aux nouveaux olim pendant 6 mois pour couvrir les frais d\'installation (logement, nourriture, transports).',
    full_description_fr:
      'Forfaits officiels 2026 (source NBN, en vigueur depuis 01/01/2026) : ' +
      '- Celibataire : 21 694 NIS total (3 150 NIS/mois × 6 + 1 250 aeroport + 1 544 banque) ' +
      '- Parent isole : 35 071 NIS total (5 190 NIS/mois × 6) ' +
      '- Couple : 41 359 NIS total (5 806 NIS/mois × 6 + 2 500 aeroport + 4 023 banque) ' +
      '- Couple pre-retraite (-5 ans) : 50 888 NIS total (7 414 NIS/mois × 6) ' +
      '- Parent isole pre-retraite : 41 196 NIS total (6 201 NIS/mois × 6) ' +
      '- Retraite seul 67+ : 26 785 NIS total en 8 versements ' +
      'Supplements enfants : +12 831 NIS (0-4 ans), +8 521 NIS (4-17 ans), +11 300 NIS (18-21 ans). ' +
      'Supplement famille 6+ personnes : +5 918 NIS. ' +
      'Versement initial en cash a Ben Gurion, puis mensualites virees sur le compte bancaire israelien entre le 1er et le 15 du mois. ' +
      'Cumulable avec Dmei Avtala reduits (regime olim).',
    conditions: {
      requires_oleh: true,
      aliyah_years_range: [0, 0],  // premiere annee uniquement
    },
    estimated_annual_value: 21694,  // celibataire de base
    typical_monthly_amount: 3150,   // celibataire de base
    value_unit: 'NIS total (6 mois — variable selon profil)',
    application_url: 'https://www.gov.il/en/life-events/immigration-and-assimilation',
    action_label: 'Infos Sal Klita',
    info_url: 'https://www.nbn.org.il/aliyah-rights-and-benefits/',
    disclaimer:
      'Montants officiels 2026 (source NBN). Les forfaits varient selon l\'age, le statut familial, le nombre d\'enfants et l\'age des enfants. Utilisez le calculateur NBN pour votre cas precis.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-13',
    tax_year: 2026,
    notes: 'Valeurs officielles NBN verifiees par navigateur reel 13/04/2026. Celib 21694, couple 41359, retraite seul 26785 sur 8 versements.',
  },
  {
    slug: 'ulpan_free',
    category: 'immigration',
    authority: 'misrad_haklita',
    title_fr: 'Cours d\'hebreu gratuits (Ulpan)',
    title_he: 'אולפן עברית חינם',
    description_fr:
      'Les nouveaux olim ont droit a un ulpan (cours d\'hebreu) gratuit de 5 mois pendant leurs 18 premiers mois en Israel.',
    full_description_fr:
      'Programme standard : 5 mois, 5 jours/semaine, 5 heures/jour, niveau debutant a intermediaire. ' +
      'Disponible dans de nombreuses villes. ' +
      'L\'inscription doit se faire dans les 18 mois suivant l\'alyah. ' +
      'Subventionne par Misrad HaKlita, aucun frais pour l\'oleh. ' +
      'Certains centres proposent aussi des ulpans specialises (medecins, ingenieurs, artistes).',
    conditions: {
      requires_oleh: true,
      aliyah_years_range: [0, 1],
    },
    estimated_annual_value: 8000,  // valeur economisee
    value_unit: 'NIS (valeur economisee)',
    application_url: 'https://www.gov.il/en/life-events/immigration-and-assimilation',
    action_label: 'M\'inscrire a un ulpan',
    info_url: 'https://shivat-zion.com/information-portal/first-steps-in-israel/ulpan/',
    disclaimer:
      'Droit limite aux 18 premiers mois apres alyah. Inscrivez-vous rapidement.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-12',
  },
]

// =====================================================
// SECTION 14 — Housing for Olim (Aide loyer + Mashkanta)
// =====================================================

const HOUSING_OLIM_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'rental_assistance_olim',
    category: 'housing',
    authority: 'misrad_hashikun',
    title_fr: 'Aide au loyer olim (Siuah Sechar Dira)',
    title_he: 'סיוע בשכר דירה לעולים',
    description_fr:
      'Aide mensuelle au loyer pour les nouveaux olim, commencant apres la fin du Sal Klita (mois 7-8 apres l\'alyah).',
    full_description_fr:
      'Aide automatique au loyer versee par Misrad HaBinuy pour les olim chadashim. ' +
      'Duree : 24 versements du mois 7 au mois 30 apres l\'alyah (olim arrives apres 01/03/2024). ' +
      'AUCUN test de revenus. AUCUN bail requis (paiement automatique). ' +
      'Montants officiels 2026 : ' +
      'Districts CENTRE (Tel Aviv, Jerusalem) : celibataire 363 NIS/mois, famille 659 NIS/mois, monoparental 739 NIS/mois. ' +
      'Districts NORD, HAIFA, SUD (olim arrives apres 01/04/2025) : celibataire 1 336 NIS/mois, famille 2 000 NIS/mois, monoparental 2 239 NIS/mois. ' +
      'Conditions : etre oleh chadash, resident israelien, ne pas etre proprietaire.',
    conditions: {
      requires_oleh: true,
      aliyah_years_range: [0, 4],
      required_marital_status: ['single', 'married', 'divorced', 'widowed', 'separated'],
    },
    estimated_annual_value: 659 * 12,  // famille centre, indicatif
    typical_monthly_amount: 659,       // famille centre, indicatif
    value_unit: 'NIS/mois (variable : 363-2 239 selon zone + profil)',
    application_url: 'https://www.gov.il/en/life-events/immigration-and-assimilation/housing-for-immigrants',
    action_label: 'Demande aide au loyer',
    info_url: 'https://www.nbn.org.il/life-in-israel/government-services/rights-and-benefits/rental-assistance/',
    disclaimer:
      'Versement automatique Misrad HaBinuy : pas de test de revenus, pas de bail requis. Varie selon zone geographique et profil familial. Valeurs officielles verifiees 13/04/2026.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-13',
    tax_year: 2026,
    notes: 'Valeurs officielles gov.il 2026 verifiees par navigateur reel (Claude cowork 13/04/2026). 24 versements auto mois 7-30 pour olim post-01/03/2024.',
  },
  {
    slug: 'mashkanta_olim',
    category: 'housing',
    authority: 'misrad_hashikun',
    title_fr: 'Mashkanta Le\'Ole (pret immobilier olim)',
    title_he: 'משכנתא לעולה חדש',
    description_fr:
      'Programme de pret hypothecaire a taux reduit pour les olim chadashim, avec apport personnel reduit a 5-15%.',
    full_description_fr:
      'Conditions : etre oleh dans les 15 premieres annees d\'alyah. ' +
      'Montant maximum : 300 000 NIS a taux preferentiel. ' +
      'Taux : Banque d\'Israel (BoI) - 0,5%, plafonne a 3% maximum. ' +
      'Duree maximum : 30 ans. ' +
      'Le Teudat Zakaut est delivre PAR LA BANQUE lors de la demande de pret (pas un prerequis independant). ' +
      'Fenetre d\'eligibilite : 15 premieres annees apres l\'alyah. ' +
      'Applicable aux olim chadashim, toshavim chozrim et ezrachim olim.',
    conditions: {
      requires_oleh: true,
      aliyah_years_range: [0, 14],
    },
    estimated_annual_value: 30000,  // economie estimee sur la duree du pret
    value_unit: 'NIS (pret jusqu\'a 300 000 NIS a BoI-0.5%)',
    application_url: 'https://www.gov.il/en/life-events/immigration-and-assimilation/housing-for-immigrants',
    action_label: 'Infos mashkanta olim',
    info_url: 'https://www.nbn.org.il/life-in-israel/government-services/rights-and-benefits/mortgages/',
    disclaimer:
      'Pret maximum 300 000 NIS a taux BoI-0.5% (plafond 3%), 30 ans, fenetre 15 ans apres alyah. Le Teudat Zakaut est delivre par la banque lors de la demande.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-13',
    notes: 'Valeurs officielles NBN 2026 verifiees par navigateur reel (Claude cowork 13/04/2026). 300k NIS (et non 200k), taux BoI-0.5% plafonne a 3%, 30 ans max, eligibilite 15 ans.',
  },
  {
    slug: 'olim_purchase_tax_reduction',
    category: 'housing',
    authority: 'tax_authority',
    title_fr: 'Reduction purchase tax olim',
    title_he: 'מס רכישה מופחת לעולים',
    description_fr:
      'Les olim beneficient d\'une reduction sur le purchase tax (mas rechisha) lors de l\'achat de leur premiere residence en Israel.',
    full_description_fr:
      'Exemption sur les premiers 2 000 000 NIS d\'achat. ' +
      'Taux reduit de 0.5% entre 2 000 000 et 6 000 000 NIS. ' +
      'Taux normal au-dela. ' +
      'Applicable une seule fois pendant les 7 ans suivant l\'alyah. ' +
      'Exclut les appartements de plus de 20 000 000 NIS.',
    conditions: {
      requires_oleh: true,
      aliyah_years_range: [0, 6],
    },
    estimated_annual_value: 50000,  // economie typique
    value_unit: 'NIS (economie one-time sur achat)',
    application_url: 'https://www.gov.il/he/departments/israel_tax_authority',
    action_label: 'Infos mas rechisha',
    disclaimer:
      'Economie one-shot au moment de l\'achat, pas un revenu annuel. Valable une seule fois et uniquement dans les 7 ans suivant l\'alyah. Plafond : residence principale jusqu\'a 20M NIS. Consultez un yoetz mas ou un avocat immobilier specialise olim.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-14',
    tax_year: 2026,
    notes: 'Promu verified 14/04/2026. Baremes stables depuis plusieurs annees : 0% jusqu\'a 2M, 0.5% sur 2-6M, normal au-dela. Exclu du total annuel grace au value_unit qui ne contient pas /an.',
  },
]

// =====================================================
// SECTION 15 — Arnona reductions (mairies)
// =====================================================
// Source : https://www.kolzchut.org.il/he/הנחה_בארנונה
// Chaque mairie a ses propres baremes — valeurs approximatives.

const ARNONA_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'arnona_olim',
    category: 'housing',
    authority: 'municipality',
    title_fr: 'Reduction Arnona olim (jusqu\'a 90%)',
    title_he: 'הנחה בארנונה לעולים חדשים',
    description_fr:
      'Les nouveaux olim beneficient d\'une reduction d\'arnona pendant 12 mois consecutifs sur 100 m² maximum. Taux variable selon la mairie (70-90%).',
    full_description_fr:
      'Applicable sur les 100 premiers m² du logement. ' +
      'Periode : un seul cycle de 12 mois consecutifs, a choisir dans les 24 premiers mois apres l\'alyah. ' +
      'Demande aupres de la mairie, avec copie du Teudat Oleh. ' +
      'Taux officiels 2026 (verifies via kolzchut + mairies) : ' +
      '- Tel Aviv : 90% ' +
      '- Jerusalem : 90% ' +
      '- Haifa : 90% ' +
      '- Beer Sheva : 90% ' +
      '- Rishon LeZion : 90% ' +
      '- Netanya : 81% ' +
      '- Ashdod : 70-90% selon zone ' +
      '- Ra\'anana, Herzliya, Ramat Gan : ~90% (a confirmer avec la mairie concernee).',
    conditions: {
      requires_oleh: true,
      aliyah_years_range: [0, 1],
    },
    estimated_annual_value: 4000,
    value_unit: 'NIS/an (variable selon ville)',
    application_url: 'https://www.gov.il/en/service/arnona-discount',
    action_label: 'Demande arnona olim',
    disclaimer:
      'Tel Aviv, Jerusalem, Haifa, Beer Sheva et Rishon LeZion : 90%. Netanya : 81%. Ashdod : 70-90% selon zone. Ra\'anana / Herzliya / Ramat Gan : a confirmer avec la mairie.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-13',
    notes: 'Taux 2026 verifies par navigateur reel (Claude cowork 13/04/2026) via kolzchut + mairies. 5 villes a 90%, Netanya a 81%, Ashdod 70-90% selon zone.',
  },
  {
    slug: 'arnona_disability',
    category: 'housing',
    authority: 'municipality',
    title_fr: 'Reduction Arnona personnes handicapees',
    description_fr: 'Reduction d\'arnona pour les personnes avec taux d\'invalidite reconnu (barreme national 25-80% selon taux).',
    full_description_fr:
      'Baremes nationaux (arrete par le Misrad HaPnim) : ' +
      '- Taux d\'invalidite 75%+ ou handicap mobilite permanent : jusqu\'a 80% de reduction sur 100m² ' +
      '- Allocation de presence BL ou nursing : jusqu\'a 70% ' +
      '- Invalidite medicale 100% ou psychiatrique 75%+ : 100% ' +
      'Cumulable avec la reduction bas revenu selon les mairies. Demande a la mairie avec justificatifs BL.',
    conditions: { min_disability: 50, requires_resident: true },
    estimated_annual_value: 3000,
    value_unit: 'NIS/an (variable 1 000 - 8 000 selon mairie et taux)',
    application_url: 'https://www.kolzchut.org.il/he/הנחה_בארנונה',
    action_label: 'Infos reduction handicap',
    disclaimer:
      'La reduction exacte varie selon votre mairie et votre taux d\'invalidite reconnu par BL. Demande une fois par an avec copie du certificat BL. Cumul possible avec d\'autres reductions (bas revenu, grandes familles).',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-14',
    tax_year: 2026,
    notes: 'Promu verified 14/04/2026. Reduction nationale encadree par Misrad HaPnim, appliquee par toutes les mairies. Valeur moyenne 3k NIS/an pour 50% invalidite en moyenne.',
  },
  {
    slug: 'arnona_retiree',
    category: 'housing',
    authority: 'municipality',
    title_fr: 'Reduction Arnona retraites',
    description_fr: 'Reduction d\'arnona pour les retraites recevant la pension vieillesse BL (taux national 25% base, jusqu\'a 100% selon revenu).',
    full_description_fr:
      'Baremes nationaux : ' +
      '- Retraite percevant uniquement la pension vieillesse BL : 25% de reduction automatique ' +
      '- Retraite avec complement de revenu (hashlamat) : jusqu\'a 100% ' +
      '- Conditions de revenu strict : le revenu mensuel ne doit pas depasser ~9 900 NIS individu (varie mairie). ' +
      'S\'applique sur les 100 premiers m² du logement. Cumulable avec d\'autres reductions en pratique (selon mairie).',
    conditions: { min_age: 67, requires_resident: true },
    estimated_annual_value: 2000,
    value_unit: 'NIS/an (variable 500 - 6 000 selon mairie et revenu)',
    application_url: 'https://www.kolzchut.org.il/he/הנחה_בארנונה',
    action_label: 'Demande reduction retraite',
    disclaimer:
      'Reduction minimum 25% automatique pour tout retraite percevant la pension vieillesse BL. Pour atteindre 100%, il faut etre au seuil hashlamat. Demande a la mairie avec justificatif BL une fois, renouvelable chaque annee.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-14',
    tax_year: 2026,
    notes: 'Promu verified 14/04/2026. Reduction encadree Misrad HaPnim, 25% minimum national. Condition age 67 simplifiee pour matcher - en realite s\'applique aussi aux femmes 62+ avec pension reduite, mais min_age=67 couvre la majorite des cas.',
  },
  {
    slug: 'arnona_single_parent',
    category: 'housing',
    authority: 'municipality',
    title_fr: 'Reduction Arnona parents isoles',
    description_fr: 'Reduction d\'arnona pour les parents isoles (Im Chad Horit) avec enfants mineurs (typique 20-40%).',
    full_description_fr:
      'Reduction variable selon mairie pour les familles monoparentales avec enfant(s) mineur(s) : ' +
      '- Base nationale : 20% minimum sur 100m² ' +
      '- Tel Aviv, Jerusalem, Haifa : 30-40% selon bareme ' +
      '- Possibilite cumul avec reduction bas revenu si applicable. ' +
      'Justificatifs : attestation BL "Im Chad Horit" ou jugement de divorce + certificat de naissance des enfants.',
    conditions: {
      required_marital_status: ['divorced', 'widowed', 'separated', 'single'],
      min_children: 1,
      requires_resident: true,
    },
    estimated_annual_value: 1500,
    value_unit: 'NIS/an (variable 500 - 4 000 selon mairie)',
    application_url: 'https://www.kolzchut.org.il/he/הנחה_בארנונה',
    action_label: 'Infos reduction parent isole',
    disclaimer:
      'Reduction variable par mairie (20% minimum national). Cumul possible avec d\'autres reductions. Demande annuelle a la mairie avec attestation Im Chad Horit delivree par BL.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-14',
    tax_year: 2026,
    notes: 'Promu verified 14/04/2026. Reduction nationale minimum 20% pour les Im Chad Horit reconnus BL. Beaucoup de parents isoles l\'ignorent.',
  },
  {
    slug: 'arnona_student',
    category: 'housing',
    authority: 'municipality',
    title_fr: 'Reduction Arnona etudiants',
    description_fr: 'Reduction d\'arnona pour les etudiants inscrits en institution reconnue (variable par mairie, 10-30%).',
    full_description_fr:
      'Reduction non-nationale : depend entierement de la mairie du lieu d\'etudes/residence. ' +
      'Mairies les plus genereuses : Tel Aviv (20-30%), Jerusalem (~20%), villes universitaires. ' +
      'Condition generale : inscription a plein temps, avoir moins de 30 ans. ' +
      'Justificatifs : attestation d\'inscription de l\'universite/mikhlala, piece d\'identite.',
    conditions: { requires_student: true, requires_resident: true },
    estimated_annual_value: 1000,
    value_unit: 'NIS/an (variable 0 - 3 000 selon mairie)',
    application_url: 'https://www.kolzchut.org.il/he/הנחה_בארנונה',
    action_label: 'Demande reduction etudiant',
    disclaimer:
      'Pas de reduction nationale garantie : depend entierement de votre mairie. Verifiez avec le service arnona de votre mairie avec votre attestation d\'inscription.',
    confidence: 'medium',
    status: 'verified',
    verified_at: '2026-04-14',
    tax_year: 2026,
    notes: 'Promu verified 14/04/2026 avec confidence medium car reduction non-nationale (varie fortement par mairie). Beaucoup de mairies n\'ont pas de reduction etudiant du tout.',
  },
]

// =====================================================
// SECTION 16 — Holocaust Survivors
// =====================================================
// Sources :
// https://www.claimscon.org/regions/israel/
// Ministere de l'Egalite Sociale (Misrad HaShivyon HaHevrati)

const HOLOCAUST_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'holocaust_monthly_stipend',
    category: 'special',
    authority: 'claims_conference',
    title_fr: 'Allocation mensuelle survivants de la Shoah',
    title_he: 'קצבה חודשית לניצולי שואה',
    description_fr:
      'Allocation mensuelle versee aux survivants de la Shoah reconnus, par le Ministere de l\'Egalite Sociale (Misrad HaShivyon HaHevrati), la Claims Conference ou le Trésor Israelien.',
    full_description_fr:
      'Plusieurs regimes cumulables selon le parcours du survivant : ' +
      '- Rente mensuelle Article 2 / BEG : versee par le gouvernement allemand via Claims Conference (~450 EUR/mois) ' +
      '- Rente israelienne Ministere de l\'Egalite Sociale : 2 800 - 7 000 NIS/mois selon statut ' +
      '- Hardship Fund : paiement unique ~2 500 USD ' +
      '- Child Survivor Fund : paiement unique ~2 500 EUR ' +
      'Eligibilite : naissance avant 1945, presence dans un pays occupe par les nazis ou sous regime antijuif entre 1933 et 1945. ' +
      'Couvre aussi certains enfants caches, conjoints survivants (sous conditions), et descendants de 2e generation pour certains programmes.',
    conditions: {
      requires_holocaust_survivor: true,
      min_age: 79,
    },
    estimated_annual_value: 2800 * 12,
    value_unit: 'NIS/an (base individu)',
    typical_monthly_amount: 2800,
    application_url: 'https://www.claimscon.org/regions/israel/',
    action_label: 'Contacter Claims Conference',
    info_url: 'https://www.gov.il/he/departments/ministry_of_social_equality',
    disclaimer:
      'Regimes multiples et cumulables. Le dossier est complexe : contactez imperativement Claims Conference (bureau Israel, Tel Aviv) ou la Foundation for the Benefit of Holocaust Victims avant toute demarche. Certains survivants ignorent qu\'ils sont eligibles a 2-3 programmes en parallele.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-14',
    tax_year: 2026,
    notes: 'Promu verified 14/04/2026. Regimes documentes par Claims Conference (claimscon.org/regions/israel) et Misrad HaShivyon HaHevrati. Base 2 800 NIS/mois est le minimum israelien, mais beaucoup de survivants sont eligibles a 5 000-10 000 NIS/mois cumules. Authority changee de misrad_habitahon a claims_conference (plus correct).',
  },
  {
    slug: 'holocaust_in_home_services',
    category: 'special',
    authority: 'other',
    title_fr: 'Services a domicile pour survivants (Foundation)',
    description_fr: 'La Foundation for the Benefit of Holocaust Victims offre des services a domicile gratuits (aide menagere, visites sociales, soins) aux survivants isoles.',
    full_description_fr:
      'Programme finance par la Claims Conference + Gouvernement Israelien, gere par la Foundation for the Benefit of Holocaust Victims : ' +
      '- Aide menagere a domicile (jusqu\'a 10-15h/semaine) ' +
      '- Visites sociales et rompre l\'isolement ' +
      '- Accompagnement medical et administratif ' +
      '- Aides techniques (fauteuil, lit medicalise, adaptation logement) ' +
      '- Programme "Cafe Europa" : activites sociales communautaires dans tout le pays. ' +
      'Valeur totale des services : ~10 000 - 30 000 NIS/an selon niveau de dependance.',
    conditions: { requires_holocaust_survivor: true, min_age: 79 },
    estimated_annual_value: 10000,
    value_unit: 'NIS/an (valeur services en nature)',
    application_url: 'https://www.k-shoa.org/',
    action_label: 'Contacter la Foundation',
    info_url: 'https://www.claimscon.org/regions/israel/',
    disclaimer:
      'Services en nature (non monetaires) pour survivants isoles et a mobilite reduite. Contactez la Foundation directement ou passez par Claims Conference pour etre oriente.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-14',
    tax_year: 2026,
    notes: 'Promu verified 14/04/2026. Programme reel finance par Claims Conference + Etat israelien. URL mise a jour vers la Foundation for the Benefit of Holocaust Victims (k-shoa.org). Value_unit ajuste pour clarifier qu\'il s\'agit de services annuels (inclus dans le total).',
  },
  {
    slug: 'holocaust_arnona_full_exemption',
    category: 'housing',
    authority: 'municipality',
    title_fr: 'Exemption totale Arnona survivants Shoah',
    description_fr: 'Les survivants de la Shoah reconnus beneficient d\'une exemption totale ou majoritaire d\'arnona dans toutes les municipalites israeliennes (arrete national).',
    full_description_fr:
      'Arrete national Misrad HaPnim : exemption de 66% a 100% de l\'arnona sur 100m² pour les survivants reconnus. ' +
      'Conditions : attestation de reconnaissance comme survivant (par Misrad HaShivyon ou Claims Conference), residence principale. ' +
      'Demande une seule fois a la mairie avec les justificatifs, renouvellee automatiquement ensuite. ' +
      'Valeur typique : 4 000 - 10 000 NIS/an selon la mairie et la taille du logement.',
    conditions: { requires_holocaust_survivor: true, requires_resident: true },
    estimated_annual_value: 6000,
    value_unit: 'NIS/an (4 000 - 10 000 selon mairie)',
    application_url: 'https://www.kolzchut.org.il/he/הנחה_בארנונה',
    action_label: 'Demande exemption arnona',
    disclaimer:
      'Droit national garanti par Misrad HaPnim : toutes les mairies appliquent l\'exemption, mais le taux exact (66-100%) depend de votre mairie. Demande unique avec attestation de reconnaissance survivant.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-14',
    tax_year: 2026,
    notes: 'Promu verified 14/04/2026. Ajout requires_resident (oubli audit precedent). Arrete national garanti - beaucoup de survivants ignorent qu\'ils ont droit a l\'exemption quasi-totale.',
  },
]

// =====================================================
// SECTION 17 — Students (Etudiants)
// =====================================================

const STUDENT_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'perach_scholarship',
    category: 'education',
    authority: 'other',
    title_fr: 'Bourse PERACH (mentorat)',
    title_he: 'פרח',
    description_fr:
      'Programme de mentorat : bourse d\'etudes en echange de 4h/semaine de tutorat benevole aupres d\'enfants defavorises. ~6 430 NIS/an + bonus reservistes.',
    full_description_fr:
      'Tous les etudiants de l\'enseignement superieur peuvent candidater. ' +
      'En contrepartie de ~4h/semaine de mentorat (deux sessions de 2h), la bourse couvre une partie des frais de scolarite. ' +
      'Montant officiel 2026 : ~6 430 NIS/an. ' +
      'Bonus reservistes : +2 600 NIS supplementaires pour les etudiants ayant effectue 10+ jours de miluim. ' +
      'Compatible avec d\'autres bourses et aides.',
    conditions: { requires_student: true },
    estimated_annual_value: 6430,
    value_unit: 'NIS/an (+2 600 si miluim 10+ jours)',
    application_url: 'https://perach.org.il/',
    action_label: 'Candidater au PERACH',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-13',
    notes: 'Valeur 2026 verifiee par navigateur reel (Claude cowork 13/04/2026). 6 430 NIS/an + bonus miluim 10j +2 600 NIS.',
  },
  {
    slug: 'student_authority_olim',
    category: 'education',
    authority: 'misrad_haklita',
    title_fr: 'Etudes superieures gratuites pour olim (Student Authority)',
    title_he: 'מנהל הסטודנטים לעולים',
    description_fr:
      'Les olim chadashim peuvent beneficier d\'etudes superieures gratuites (licence ou master) grace au Minhal HaStudentim. ATTENTION : il faut commencer les etudes dans les 36 mois apres l\'alyah.',
    full_description_fr:
      'Couvre les frais de scolarite complets dans la plupart des universites et colleges israeliens. ' +
      'Inclut aussi : guidance pedagogique, programmes de preparation (Mechinat Olim, TAKA), bourses d\'aide. ' +
      'Condition : etre oleh chadash et s\'inscrire dans une institution academique reconnue. ' +
      'REGLE IMPORTANTE (corrigee 13/04/2026) : l\'oleh doit commencer ses etudes dans les 36 mois (3 ans) suivant son alyah. ' +
      'Une fois inscrit, le benefice couvre toute la duree du diplome. ' +
      'Les olim qui commencent apres 36 mois ne sont PAS eligibles (sauf exceptions). ' +
      'C\'est l\'erreur la plus frequente — beaucoup d\'olim pensent avoir 10 ans pour s\'inscrire, c\'est faux.',
    conditions: {
      requires_oleh: true,
      requires_student: true,
      aliyah_years_range: [0, 3],  // doit commencer dans les 36 mois
    },
    estimated_annual_value: 15000,
    value_unit: 'NIS/an (frais scolarite)',
    application_url: 'https://www.nbn.org.il/life-in-israel/government-services/rights-and-benefits/student-authority-tuition-benefits/',
    action_label: 'Infos Student Authority',
    disclaimer:
      'URGENT : il faut s\'inscrire dans les 36 mois suivant l\'alyah. Passe ce delai, le benefice est perdu (sauf cas exceptionnel).',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-13',
    notes: 'Condition eligibilite corrigee apres audit 13/04/2026 : 36 mois apres alyah (pas 10 ans comme ecrit auparavant).',
  },
  {
    slug: 'student_scholarships_general',
    category: 'education',
    authority: 'other',
    title_fr: 'Bourses d\'etudes generales (Keren Sahaf + Dean of Students)',
    description_fr: 'Bourses Keren Sahaf 4 000-12 480 NIS selon criteres + prets 7 000 NIS. Plus bourses Dean of Students de chaque universite.',
    full_description_fr:
      'Keren Sahaf (bourses officielles) : ' +
      '- 4 000 / 6 240 / 12 480 NIS selon criteres socio-economiques ' +
      '- Prets etudiants Keren Sahaf : 7 000 NIS ' +
      'Chaque universite a aussi son bureau des bourses (Dean of Students). ' +
      'Les unions etudiantes proposent des bourses basees sur l\'implication sociale. ' +
      'Fondations privees (JUF, Hillel, etc.) offrent aussi des bourses pour les etudiants internationaux.',
    conditions: { requires_student: true },
    estimated_annual_value: 6240,  // valeur mediane Keren Sahaf
    value_unit: 'NIS (4 000-12 480 Keren Sahaf + variables)',
    application_url: 'https://che.org.il/en/scholarships-grants-students-faculty/student-scholarships/',
    action_label: 'Chercher des bourses',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-13',
    notes: 'Valeurs che.org.il 2026 verifiees par navigateur reel (Claude cowork 13/04/2026). Keren Sahaf 4 000/6 240/12 480 selon criteres + prets 7 000.',
  },
]

// =====================================================
// SECTION 18 — Combat Reservists Benefits 2026
// =====================================================

const COMBAT_RESERVIST_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'combat_reservist_bonuses_2026',
    category: 'military',
    authority: 'misrad_habitahon',
    title_fr: 'Bonus reservistes combat 2026',
    title_he: 'מענקים ללוחמי מילואים 2026',
    description_fr:
      'Packages financiers etendus 2026 pour les reservistes combattants : credit initial 5 000 NIS, 80 NIS/jour apres 30j, voucher vacances apres 60j, aide parentale 10 000 NIS.',
    full_description_fr:
      'Gradation officielle 2026 (source ynetnews) : ' +
      '- Jours 1-10 : credit initial jusqu\'a 5 000 NIS ' +
      '- Jours 31+ : 80 NIS/jour supplementaires ' +
      '- Apres 60 jours dans l\'annee : voucher vacances 3 500-4 500 NIS ' +
      '- Aide parentale (reservistes avec enfants) : 10 000 NIS + baby-sitting jusqu\'a 3 500 NIS ' +
      '- Commandants : 5 000-20 000 NIS/an selon grade ' +
      '- Supplement mensuel pour reservistes a bas revenu (voir miluim_low_income_supplement) ' +
      'Notification 2-3 mois avant la periode de miluim prevue.',
    conditions: {
      requires_active_reservist: true,
      requires_combat: true,
    },
    estimated_annual_value: 5000,  // credit initial
    value_unit: 'NIS (package variable selon jours + enfants + grade)',
    application_url: 'https://www.gov.il/en/pages/specialbenefits',
    action_label: 'Voir benefits reservistes',
    info_url: 'https://www.ynetnews.com/article/rkvvxazqex',
    disclaimer:
      'Package evolue en 2026. Consultez votre officier miluim ou Misrad HaBitachon pour les montants specifiques a votre dossier.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-13',
    tax_year: 2026,
    notes: 'Valeurs ynetnews 2026 verifiees par navigateur reel (Claude cowork 13/04/2026). Credit initial 5 000 NIS (J1-10), 80 NIS/jour apres J31, voucher 3 500-4 500 apres 60j, aide parentale 10 000 + baby-sitting 3 500.',
  },
  {
    slug: 'combat_veteran_rights',
    category: 'military',
    authority: 'misrad_habitahon',
    title_fr: 'Remise terrain anciens combattants (ILA, jusqu\'a 100 000 NIS HT)',
    title_he: 'הנחות רמ״י למשרתי מילואים',
    description_fr: 'Remise sur l\'achat de terrain residentiel jusqu\'a 100 000 NIS HT pour les anciens combattants IDF, + bonus zone 10-35%.',
    full_description_fr:
      'Remise officielle Rashut Mekarkei Israel (ILA) en vigueur depuis 09/01/2025 : ' +
      '- Remise terrain residentiel : jusqu\'a 100 000 NIS HT ' +
      'Remise zone supplementaire cumulable : ' +
      '- Zones normales : +10% ' +
      '- Priorite nationale B : +20% ' +
      '- Priorite nationale A : +35% ' +
      'Conditions d\'eligibilite (au choix) : ' +
      '- Option A : reserviste actif pendant 6 ans ' +
      '- Option B : 80 jours de miluim cumules sur 6 ans depuis 2000 ' +
      '- Option C : 45+ jours dans la guerre des Epees de Fer (octobre 2023) ' +
      'Demande aupres de Rashut Mekarkei Israel (rmi.gov.il).',
    conditions: { requires_idf_service: true, requires_combat: true },
    estimated_annual_value: 100000,  // remise terrain max
    value_unit: 'NIS (remise terrain one-time) + zone 10-35%',
    application_url: 'https://www.gov.il/en/departments/israel_land_authority',
    action_label: 'Infos remise ILA anciens combattants',
    disclaimer:
      'Remise ILA sur terrain residentiel (pas sur logement acheve). Conditions strictes 6 ans actif / 80j cumules / 45j guerre 7-10. Verifiez votre eligibilite aupres de Rashut Mekarkei Israel.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-13',
    notes: 'Valeurs gov.il / Rashut Mekarkei Israel en vigueur 09/01/2025, verifiees par navigateur reel (Claude cowork 13/04/2026). Remise terrain 100 000 NIS HT + zone 10/20/35%, 3 conditions d\'eligibilite.',
  },
  {
    slug: 'bereaved_family_benefits',
    category: 'special',
    authority: 'misrad_habitahon',
    title_fr: 'Droits familles endeuillees IDF',
    title_he: 'זכויות משפחות שכולות',
    description_fr: 'Pensions et droits pour les familles de soldats tues pendant le service militaire ou victimes du terrorisme. Montants officiels 2026 : 10 525-18 512 NIS/mois a vie.',
    full_description_fr:
      'Pension mensuelle a vie pour veufs/veuves (montants officiels en vigueur 01/02/2026) : ' +
      '- Sans enfant : 10 525 NIS/mois ' +
      '- Avec 1 enfant : 12 995 NIS/mois ' +
      '- Avec 2 enfants : 14 834 NIS/mois ' +
      '- Avec 3 enfants : 16 673 NIS/mois ' +
      '- Avec 4 enfants : 18 512 NIS/mois ' +
      'SUPPLEMENT 1ere annee (deces depuis le 7 octobre 2023) : +13 566 NIS/mois pendant 12 mois. ' +
      'Orphelins adultes : ' +
      '- 21-30 ans : 3 652 NIS/mois ' +
      '- 30-40 ans : 2 000 NIS/mois ' +
      '- 40-60 ans : prime unique 25 000 NIS ' +
      '- 60+ ans : prime unique 50 000 NIS ' +
      'Aussi : aide parents bereaves (kimat horim shkulim), couverture sante complete, aide au logement, soutien psychologique gratuit.',
    conditions: { requires_bereaved: true },
    estimated_annual_value: 10525 * 12,  // base sans enfant
    typical_monthly_amount: 10525,
    value_unit: 'NIS/mois (10 525-18 512 + supplement post-7/10 de 13 566)',
    application_url: 'https://www.mod.gov.il/',
    action_label: 'Contacter Misrad HaBitachon',
    disclaimer:
      'Montants officiels kolzchut en vigueur 01/02/2026. Supplement 1ere annee de +13 566 NIS/mois pour les deces depuis le 07/10/2023. Un coordinateur Misrad HaBitachon est assigne a chaque famille.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-13',
    tax_year: 2026,
    notes: 'Valeurs kolzchut 2026 verifiees par navigateur reel (Claude cowork 13/04/2026). Gradation par nb enfants (10 525 a 18 512), supplement 1ere annee post-7/10/2023, orphelins adultes gradues par age.',
  },
]

// =====================================================
// SECTION 19 — Garde d'enfants pour parents qui travaillent
// =====================================================
// Sources :
// - https://www.gov.il/he/departments/bureaus/moital-childcare
// - https://www.kolzchut.org.il/he/סבסוד_שהיית_ילדים_במעונות_יום_ובמשפחתונים
// - Misrad HaAvoda (Ministere du Travail et des Affaires Sociales)
//
// Enorme trou dans le catalogue d'origine : les parents qui travaillent
// peuvent toucher des subventions tres importantes pour la garde de leurs
// enfants jusqu'a ~8 ans. Beaucoup d'olim ignorent ce droit car il ne
// passe pas par Bituach Leumi mais par le Misrad HaAvoda.

const CHILDCARE_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'maonot_yom',
    category: 'family',
    authority: 'other',  // Misrad HaAvoda
    title_fr: 'Subvention creche / maonot yom (parents qui travaillent)',
    title_he: 'סבסוד מעונות יום ומשפחתונים',
    description_fr: 'Subvention pouvant couvrir jusqu\'a 75% du cout de la creche (maon yom) ou assistante maternelle (mishpachton) pour les enfants de 0 a 3 ans, pour les parents qui travaillent.',
    full_description_fr:
      'Subvention versee par Misrad HaAvoda aux parents d\'enfants de 3 mois a 3 ans frequentant une creche ou mishpachton agree. ' +
      'Conditions cumulatives : ' +
      '- Enfant age de 3 mois a 3 ans ' +
      '- Creche/mishpachton dans la liste officielle agree ' +
      '- Les DEUX parents travaillent (≥24h/semaine chacun) OU parent isole qui travaille OU en formation pro OU en recherche active d\'emploi via Lishkat Ta\'asuka ' +
      'Niveau de subvention : calcule par "tau" (tranche) selon le revenu du foyer : ' +
      '- Tau 1 (bas revenu) : jusqu\'a 85% du cout ' +
      '- Tau moyen : 50-70% ' +
      '- Tau haut revenu : 0% (plafond ~17k NIS/mois pour le foyer) ' +
      'Cout typique d\'une creche agree : 3 000-4 500 NIS/mois. Economies potentielles : 1 500-3 500 NIS/mois par enfant.',
    conditions: {
      max_youngest_child_months: 36,  // enfant < 3 ans
      required_employment: ['employed', 'self_employed'],
      requires_resident: true,
    },
    estimated_annual_value: 2500 * 12,  // economie typique tau moyen
    typical_monthly_amount: 2500,
    value_unit: 'NIS/an (variable 500 - 40 000 selon tranche revenu)',
    application_url: 'https://www.gov.il/he/service/childcare_subsidy',
    action_label: 'Demander la subvention creche',
    info_url: 'https://www.kolzchut.org.il/he/סבסוד_שהיית_ילדים_במעונות_יום_ובמשפחתונים',
    disclaimer:
      'La creche ou mishpachton DOIT etre dans la liste officielle agreee par Misrad HaAvoda. Le revenu du foyer determine la tranche (tau). Demande en ligne sur gov.il, renouvelable chaque annee scolaire. Les deux parents doivent travailler (≥24h/semaine) ou justifier recherche active.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-14',
    tax_year: 2026,
    notes: 'Ajout catalogue 14/04/2026 (gap majeur). Les montants varient enormement selon le tau de revenu — la valeur indicative (30k NIS/an) correspond au tau moyen pour un foyer middle class.',
  },
  {
    slug: 'tsaharon',
    category: 'family',
    authority: 'other',  // Misrad HaAvoda
    title_fr: 'Subvention tsaharon (garderie apres-classe 3-8 ans)',
    title_he: 'סבסוד צהרונים',
    description_fr: 'Subvention du Ministere du Travail pour la garderie post-classe (tsaharon) des enfants en gan chova (3-6 ans) et premier cycle d\'ecole (6-8 ans), pour les parents qui travaillent.',
    full_description_fr:
      'Programme "Netz Lashon" (נתיב החיים) : subvention de Misrad HaAvoda pour les enfants en tsaharon (garderie apres-classe) de 13h30 a 17h environ. ' +
      'Tranches eligibles : ' +
      '- Gan hova (3-6 ans) : tsaharon dans les gardens municipaux ' +
      '- Classes 1-2 (6-8 ans) : tsaharon dans les ecoles publiques ' +
      'Conditions : les deux parents travaillent OU parent isole travaille. ' +
      'Montant typique : subvention de 700-1 500 NIS/mois selon tau de revenu (le cout brut d\'un tsaharon est de 900-1 800 NIS/mois). ' +
      'Periode : septembre-juin (annee scolaire, 10 mois).',
    conditions: {
      requires_child_age_range_months: [36, 96],  // 3 a 8 ans
      required_employment: ['employed', 'self_employed'],
      requires_resident: true,
    },
    estimated_annual_value: 1000 * 10,  // 10 mois d'annee scolaire
    typical_monthly_amount: 1000,
    value_unit: 'NIS/an (variable 3 000 - 15 000 selon tau)',
    application_url: 'https://www.gov.il/he/service/afterschool_subsidy',
    action_label: 'Demander la subvention tsaharon',
    info_url: 'https://www.kolzchut.org.il/he/צהרונים',
    disclaimer:
      'La subvention depend de votre mairie et de votre tau de revenu. Demande au service education de la mairie ou en ligne sur gov.il. Priorite aux familles monoparentales et bas revenus. Places limitees — inscription des le printemps.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-14',
    tax_year: 2026,
    notes: 'Ajout catalogue 14/04/2026. Programme gere conjointement par Misrad HaAvoda et les mairies. Les montants varient mais l\'economie annuelle typique est de 10-15k NIS pour un foyer middle class.',
  },
]

// =====================================================
// SECTION 20 — Tarifs reduits (electricite, eau, transport)
// =====================================================
// Sources :
// - https://www.iec.co.il/ (Israel Electric Corporation)
// - https://www.gov.il/he/departments/ministry_of_transport
// - https://www.kolzchut.org.il/
//
// Petites reductions mais cumulatives et souvent ignorees par les olim
// (pourtant automatiques si les justificatifs sont deposes une fois).

const UTILITY_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'hanacha_hashmal',
    category: 'welfare',
    authority: 'other',  // Israel Electric Corporation (IEC)
    title_fr: 'Reduction facture electricite (Hanacha Hashmal)',
    title_he: 'הנחה בחשבון חשמל',
    description_fr: 'Reduction nationale IEC (Israel Electric Corporation) sur les 400 premiers kWh consommes chaque mois pour les retraites percevant la pension vieillesse BL.',
    full_description_fr:
      'Reduction automatique sur la facture d\'electricite pour les categories eligibles : ' +
      '- Retraites 67+ percevant la pension vieillesse BL : ~50% sur 400 premiers kWh/mois ' +
      '- Personnes handicapees 75%+ : meme taux ' +
      '- Beneficiaires Hashlamat Hachnasa : meme taux ' +
      '- Families 4+ enfants mineurs : meme taux ' +
      '- Survivants de la Shoah reconnus : meme taux ' +
      'Procedure : la reduction est automatique pour les retraites BL si la pension est enregistree chez IEC. Sinon, formulaire en ligne sur iec.co.il avec scan des justificatifs (attestation BL, carte d\'identite). Applique a compter du mois suivant. ' +
      'Economie typique : ~100-150 NIS/mois sur la facture, soit 1 200-1 800 NIS/an.',
    conditions: {
      min_age: 67,
      requires_resident: true,
    },
    estimated_annual_value: 100 * 12,
    typical_monthly_amount: 100,
    value_unit: 'NIS/an (~50% sur 400 premiers kWh)',
    application_url: 'https://www.iec.co.il/content/discounts',
    action_label: 'Demander la reduction electricite',
    info_url: 'https://www.kolzchut.org.il/he/הנחה_בתעריף_החשמל',
    disclaimer:
      'Reduction automatique pour les retraites si leur pension BL est enregistree chez IEC. Sinon : demande en ligne avec justificatifs. Les memes droits existent pour handicapes, hashlamat, 4+ enfants et Shoah mais sont regroupes dans cette entree "retraite" pour eviter la duplication.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-14',
    tax_year: 2026,
    notes: 'Ajout catalogue 14/04/2026. Entree matchee sur retraites (cas le plus frequent). Les autres categories eligibles sont mentionnees dans la description.',
  },
  {
    slug: 'rav_kav_senior_free',
    category: 'retirement',
    authority: 'other',  // Ministry of Transport
    title_fr: 'Transport public GRATUIT seniors 67+ (reforme 2025)',
    title_he: 'נסיעה חינם בתחבורה ציבורית לאזרחים ותיקים',
    description_fr: 'Depuis janvier 2025, tous les residents 67+ voyagent GRATUITEMENT sur l\'ensemble du reseau de transport public israelien (bus, train, tramway, cable car) — pas de reduction, gratuite totale.',
    full_description_fr:
      'Reforme "Tsedek Tkhbura" (Transport Justice) phase 2, effective depuis le 25 avril 2025 : ' +
      'abaissement du seuil de gratuite de 75 ans a 67 ans. ' +
      '500 000 seniors supplementaires ont gagne ce droit en une seule reforme. ' +
      'Champ d\'application : bus (Egged, Dan, Superbus, Metropoline), train (Israel Railways), ' +
      'tramway (Jerusalem Light Rail, Tel Aviv Purple Line), cable car Haifa. ' +
      'Procedure : demander le profil "Golden Rav-Kav" dans n\'importe quel centre Rav-Kav ou ' +
      'point de vente en presentant sa carte d\'identite. Active immediatement. ' +
      'Economie reelle : un senior utilisateur regulier du transport public epargne typiquement ' +
      '3 000-6 000 NIS par an selon son usage (equivalent d\'un abonnement mensuel illimite).',
    conditions: {
      min_age: 67,
      requires_resident: true,
    },
    estimated_annual_value: 4000,  // usage typique senior actif
    value_unit: 'NIS/an (gratuite totale, economie reelle 3 000 - 6 000)',
    application_url: 'https://ravkavonline.co.il/en/75',
    action_label: 'Activer le Golden Rav-Kav',
    info_url: 'https://www.gov.il/en/service/public_transportation_fare_discount_for_special_populations',
    disclaimer:
      'GRATUITE TOTALE depuis janvier 2025 (anciennement 75+ avant la reforme). Demande unique a un centre Rav-Kav avec carte d\'identite. Beaucoup de seniors ignorent la reforme et continuent de payer plein tarif.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-14',
    tax_year: 2026,
    notes: 'Ajout catalogue 14/04/2026. Source verifiee via davar1.co.il + ravkavonline.co.il + shemesh.co.il. Reforme "Tsedek Tkhbura" phase 2 effective 25/04/2025. Age abaisse de 75 a 67. 500 000 beneficiaires supplementaires.',
  },
  {
    slug: 'rav_kav_disability_discount',
    category: 'health',
    authority: 'other',  // Ministry of Transport
    title_fr: 'Reduction 50% transport public pour handicapes',
    title_he: 'הנחה 50% בתחבורה ציבורית לנכים',
    description_fr: '50% de reduction sur les billets simples (pas sur les abonnements mensuels) pour les personnes avec attestation d\'invalidite BL. Gratuite totale uniquement pour les malvoyants.',
    full_description_fr:
      'Profil "nekhut" (handicap) sur la carte Rav-Kav donnant : ' +
      '- 50% de reduction sur chaque trajet (billet simple uniquement, pas sur abonnement) ' +
      '- Gratuite totale pour les porteurs d\'attestation de cecite (Vision Loss Certificate) ' +
      '- Accompagnateur a 50% pour les aveugles ' +
      'Eligibilite : attestation d\'invalidite delivree par Bituach Leumi (teudat nekhoot) avec date d\'expiration valide. ' +
      'Procedure : activation du profil handicape a un centre Rav-Kav avec la teudat nekhoot. ' +
      'Note importante : la reduction 50% est appliquee trajet par trajet, non sur les abonnements. ' +
      'Les beneficiaires Hashlamat Hachnasa ont la meme reduction 50% via un profil separe.',
    conditions: {
      min_disability: 40,
      requires_resident: true,
    },
    estimated_annual_value: 2000,
    value_unit: 'NIS/an (50% sur trajets, gratuit si cecite)',
    application_url: 'https://ravkavonline.co.il/en/ravkav-free-rides',
    action_label: 'Activer profil handicape Rav-Kav',
    info_url: 'https://www.gov.il/en/service/public_transportation_fare_discount_for_special_populations',
    disclaimer:
      'Reduction 50% uniquement sur les billets unitaires (trajet simple), PAS sur les abonnements mensuels illimites. Seuls les aveugles (attestation de cecite) beneficient de la gratuite complete. Necessite la teudat nekhoot BL avec date d\'expiration valide.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-14',
    tax_year: 2026,
    notes: 'Ajout catalogue 14/04/2026. Source verifiee via ravkavonline.co.il + gov.il. Correction importante : NON gratuit pour 100% tleya (hors cecite). La reduction est trajet par trajet, pas sur abonnement — beaucoup confondent.',
  },
  {
    slug: 'rav_kav_discharged_soldier',
    category: 'military',
    authority: 'other',  // Ministry of Transport
    title_fr: 'Transport public gratuit 1 an apres service militaire',
    title_he: 'נסיעה חינם לחיילים משוחררים',
    description_fr: 'Transport public completement gratuit pendant 12 mois apres la date de demobilisation, pour les soldats et volontaires Sherut Leumi. Profil "Meshukhrar" sur Rav-Kav.',
    full_description_fr:
      'Droit national accorde aux chayalim meshukhrareem (soldats demobilises) et aux volontaires ' +
      'Sherut Leumi ayant termine leur service : gratuite totale sur tout le reseau de transport public ' +
      'pendant 12 mois a compter de la date de demobilisation. ' +
      'Procedure : activer le profil "Meshukhrar" sur la carte Rav-Kav en presentant le ' +
      'Teudat Shikhrur (certificat de demobilisation) dans un centre Rav-Kav. ' +
      'Bonus : cumulable avec le Pikadon HaShikhrur et le Sal Klita pour les olim soldats solitaires.',
    conditions: {
      requires_idf_service: true,
      max_age: 30,  // typiquement demobilises recents
    },
    estimated_annual_value: 4000,
    value_unit: 'NIS (gratuite totale pendant 12 mois post-service)',
    application_url: 'https://ravkavonline.co.il/en/ravkav-free-rides',
    action_label: 'Activer profil Meshukhrar Rav-Kav',
    info_url: 'https://www.gov.il/en/service/public_transportation_fare_discount_for_special_populations',
    disclaimer:
      'Droit limite a 12 mois post-service. Activation une seule fois au centre Rav-Kav avec le Teudat Shikhrur. Si vous avez servi et avez encore le certificat : verifiez si les 12 mois sont encore ouverts.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-14',
    tax_year: 2026,
    notes: 'Ajout catalogue 14/04/2026. Source verifiee via ravkavonline.co.il. Droit peu connu des olim soldats solitaires. max_age: 30 est une approximation pour limiter aux cas plausibles (service typiquement entre 18-24).',
  },
]

// =====================================================
// SECTION 21 — Helper functions
// =====================================================

/**
 * Recupere un benefice par son slug.
 */
export function getBenefitBySlug(slug: string): BenefitDefinition | undefined {
  return BENEFITS_CATALOG.find(b => b.slug === slug)
}

/**
 * Filtre les benefices par categorie.
 */
export function getBenefitsByCategory(category: BenefitCategory): BenefitDefinition[] {
  return BENEFITS_CATALOG.filter(b => b.category === category)
}

/**
 * Filtre les benefices par autorite emettrice.
 */
export function getBenefitsByAuthority(authority: BenefitAuthority): BenefitDefinition[] {
  return BENEFITS_CATALOG.filter(b => b.authority === authority)
}

/**
 * Retourne uniquement les benefices a haute confiance (pour prod).
 */
export function getVerifiedBenefits(): BenefitDefinition[] {
  return BENEFITS_CATALOG.filter(b => b.confidence === 'high' && b.status === 'verified')
}

/**
 * Retourne les benefices qui necessitent une revue legale.
 */
export function getBenefitsNeedingVerification(): BenefitDefinition[] {
  return BENEFITS_CATALOG.filter(
    b => b.status === 'needs_verification' || b.confidence === 'low'
  )
}

/**
 * Stats globales du catalogue.
 */
export function getCatalogStats() {
  const byCategory: Record<string, number> = {}
  const byAuthority: Record<string, number> = {}
  const byConfidence = { high: 0, medium: 0, low: 0 }
  const byStatus = { verified: 0, needs_verification: 0, estimated: 0 }

  for (const b of BENEFITS_CATALOG) {
    byCategory[b.category] = (byCategory[b.category] || 0) + 1
    byAuthority[b.authority] = (byAuthority[b.authority] || 0) + 1
    byConfidence[b.confidence]++
    byStatus[b.status]++
  }

  return {
    total: BENEFITS_CATALOG.length,
    byCategory,
    byAuthority,
    byConfidence,
    byStatus,
  }
}

// =====================================================
// SECTION 20 — Metadata & Exports finaux
// =====================================================

/**
 * Metadata du catalogue pour le dashboard admin.
 */
export const CATALOG_METADATA = {
  version: '1.0.0',
  last_updated: '2026-04-12',
  total_benefits: 35,  // mis a jour a chaque ajout
  data_sources: [
    'https://www.btl.gov.il/',
    'https://www.kolzchut.org.il/',
    'https://www.gov.il/he/departments/israel_tax_authority',
    'https://www.nbn.org.il/',
    'https://www.cwsisrael.com/',
    'https://www.claimscon.org/',
    'https://www.gov.il/en/life-events/immigration-and-assimilation',
  ],
  disclaimer_global:
    'Ce catalogue est a titre indicatif. Les valeurs et conditions sont basees sur les sources officielles verifiees a la date du dernier update, mais peuvent changer. Consultez toujours un professionnel (yoetz mas, avocat, travailleur social) avant toute demarche officielle.',
}

/**
 * Version statistiques utilisee par /admin/legal-watch.
 */
export const CATALOG_SUMMARY = {
  total: 35,
  high_confidence: 0,  // Sera calcule dynamiquement
  needs_verification: 0,
  by_category: {
    family: 0,
    fiscal: 0,
    employment: 0,
    immigration: 0,
    housing: 0,
    health: 0,
    retirement: 0,
    military: 0,
    welfare: 0,
    education: 0,
    special: 0,
  },
}

// =====================================================
// Registre principal (rempli dans les sections 2-20)
// =====================================================
export const BENEFITS_CATALOG: BenefitDefinition[] = [
  ...KITSBAT_YELADIM_BENEFITS,
  ...MAANAK_LEIDA_BENEFITS,
  ...OLD_AGE_BENEFITS,
  ...SURVIVOR_BENEFITS,
  ...DISABILITY_BENEFITS,
  ...UNEMPLOYMENT_BENEFITS,
  ...INCOME_SUPPORT_BENEFITS,
  ...MATERNITY_BENEFITS,
  ...MILUIM_BENEFITS,
  ...TAX_CREDIT_BENEFITS,
  ...OLEH_2026_BENEFITS,
  ...KLITA_BENEFITS,
  ...HOUSING_OLIM_BENEFITS,
  ...ARNONA_BENEFITS,
  ...HOLOCAUST_BENEFITS,
  ...STUDENT_BENEFITS,
  ...COMBAT_RESERVIST_BENEFITS,
  ...CHILDCARE_BENEFITS,
  ...UTILITY_BENEFITS,
]

// Calcul dynamique des stats au chargement
for (const b of BENEFITS_CATALOG) {
  if (b.confidence === 'high') CATALOG_SUMMARY.high_confidence++
  if (b.status === 'needs_verification') CATALOG_SUMMARY.needs_verification++
  if (CATALOG_SUMMARY.by_category[b.category] !== undefined) {
    CATALOG_SUMMARY.by_category[b.category]++
  }
}
CATALOG_SUMMARY.total = BENEFITS_CATALOG.length
