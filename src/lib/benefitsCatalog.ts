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
// + Epargne "Chisachon LeKol Yeled" : 57 NIS/mois dans un compte separe
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
      'Bituach Leumi depose automatiquement 57 NIS/mois dans un compte d\'epargne dedie pour chaque enfant, accessible a ses 18 ans (ou ses 21 ans avec bonus).',
    full_description_fr:
      'Programme lance en 2017. Tous les enfants israeliens ont un compte d\'epargne automatique a BL. ' +
      'Les parents peuvent choisir d\'ajouter 57 NIS/mois supplementaires de leur poche (deduits de l\'allocation enfants). ' +
      'A 18 ans, l\'enfant peut retirer le capital. A 21 ans, il y a un bonus gouvernemental.',
    conditions: {
      min_children: 1,
      requires_resident: true,
    },
    estimated_annual_value: 57 * 12,  // par enfant
    value_unit: 'NIS/an/enfant',
    typical_monthly_amount: 57,
    application_url: 'https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/default.aspx',
    action_label: 'Configurer le compte epargne',
    disclaimer:
      'Programme automatique. Vous pouvez choisir le fonds (banque ou kupat gemel) et doubler la contribution.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-12',
    tax_year: 2026,
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
// Montants 2026 (approximatifs, indexes sur CPI) :
// - Individu : ~1 879 NIS/mois
// - Couple : ~2 824 NIS/mois (si 2 pensions)
// - Supplement anciennete : ~2% par annee au-dela de 10 ans d'anciennete
// - Supplement si age > 80 : ~50 NIS/mois
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
      'Pension mensuelle versee par Bituach Leumi aux residents israeliens ayant atteint l\'age de la retraite (67 ans H, 62-65 F).',
    full_description_fr:
      'Pension de base : environ 1 879 NIS/mois pour un individu, 2 824 NIS/mois pour un couple en 2026. ' +
      'Supplements possibles : anciennete (2%/an au-dela de 10 ans), age > 80 ans (+50 NIS/mois). ' +
      'Entre 67 et 70 ans, un test de revenu est applique (les revenus du travail peuvent reduire la pension). ' +
      'A partir de 70 ans, la pension est versee sans condition de revenu. ' +
      'Il faut faire la demande dans les 12 mois suivant l\'age d\'eligibilite pour ne pas perdre de droits retroactifs.',
    conditions: {
      min_age: 62,  // age minimum femme
      requires_resident: true,
    },
    estimated_annual_value: 1879 * 12,
    value_unit: 'NIS/an (individu de base)',
    typical_monthly_amount: 1879,
    application_url: 'https://www.btl.gov.il/benefits/Old_age/Pages/default.aspx',
    action_label: 'Faire ma demande de pension',
    info_url: 'https://www.kolzchut.org.il/he/קצבת_זקנה',
    disclaimer:
      'Les montants peuvent varier selon votre situation (anciennete, conjoint, age). Entre 67 et 70 ans, vos revenus du travail peuvent reduire la pension. A 70 ans, elle devient automatique sans test de revenu.',
    confidence: 'medium',
    status: 'needs_verification',
    verified_at: '2026-04-12',
    tax_year: 2026,
    notes: 'Montants 2026 approximatifs — a verifier sur la page BL officielle pour avoir les chiffres exacts indexes sur CPI 2026.',
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
      'Pour un individu : environ 3 500 NIS/mois total, pour un couple environ 5 500 NIS/mois. ' +
      'Ce complement est soumis a des conditions de ressources et de patrimoine (epargne, proprietes, etc.).',
    conditions: {
      min_age: 67,
      requires_resident: true,
      max_monthly_income: 3500,
    },
    estimated_annual_value: (3500 - 1879) * 12,  // ecart a combler maximum
    value_unit: 'NIS/an (variable selon revenu)',
    application_url: 'https://www.btl.gov.il/benefits/Old_age/IncomeSupplement/Pages/default.aspx',
    action_label: 'Demande complement de revenu',
    info_url: 'https://www.kolzchut.org.il/he/השלמת_הכנסה_לקצבת_זקנה',
    disclaimer:
      'Soumis a des conditions strictes de ressources et de patrimoine. Les epargnes, proprietes et autres revenus comptent dans le calcul.',
    confidence: 'medium',
    status: 'needs_verification',
    verified_at: '2026-04-12',
    tax_year: 2026,
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
      'Montant 2026 : environ 1 879 NIS/mois pour un conjoint sans enfant, 2 350 NIS/mois avec enfant(s). ' +
      'Supplements possibles : +2%/an d\'anciennete au-dela de 10 ans, +30% pour une veuve enceinte ou en conge maternite. ' +
      'Il faut faire la demande dans les 12 mois suivant le deces pour ne pas perdre de droits retroactifs.',
    conditions: {
      required_marital_status: ['widowed'],
      requires_resident: true,
    },
    estimated_annual_value: 1879 * 12,
    value_unit: 'NIS/an (base)',
    typical_monthly_amount: 1879,
    application_url: 'https://www.btl.gov.il/benefits/Survivors/Pages/default.aspx',
    action_label: 'Faire ma demande de pension survivant',
    info_url: 'https://www.kolzchut.org.il/he/קצבת_שאירים',
    disclaimer:
      'Les montants varient selon l\'age, le nombre d\'enfants, et l\'anciennete d\'assurance du defunt. Consultez BL ou un conseiller pour votre situation exacte.',
    confidence: 'medium',
    status: 'needs_verification',
    verified_at: '2026-04-12',
    tax_year: 2026,
    notes: 'Montants 2026 approximatifs — a verifier sur la page BL officielle.',
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
      'Montant 2026 : environ 1 400 NIS/mois par enfant. ' +
      'Cumulable avec la pension du conjoint survivant si les deux conditions sont remplies.',
    conditions: {
      min_children: 1,
      requires_resident: true,
    },
    estimated_annual_value: 1400 * 12,
    value_unit: 'NIS/an/enfant',
    typical_monthly_amount: 1400,
    application_url: 'https://www.btl.gov.il/benefits/Survivors/Pages/default.aspx',
    action_label: 'Demande pension orphelins',
    info_url: 'https://www.kolzchut.org.il/he/קצבת_שאירים',
    disclaimer:
      'Versement automatique apres declaration du deces, mais verifiez que BL a bien enregistre les enfants.',
    confidence: 'medium',
    status: 'needs_verification',
    verified_at: '2026-04-12',
    tax_year: 2026,
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
// Montants 2026 (indexes sur salaire moyen apres reforme 2021) :
// - Nekhout klalit pleine (100%) : ~4 480 NIS/mois
// - Nekhout klalit partielle : proportionnelle au taux (75%, 60%, 50%)
// - Attendance allowance (sheirutei cheirut) : 50% / 112% / 188% taux de base
// - Minimum taux d'invalidite pour eligibilite : 40% (nekhout),
//   100% avec besoin d'assistance (sheirutei cheirut)

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
      'Montants 2026 : environ 4 480 NIS/mois pour une invalidite pleine (100%), proportionnel pour les taux partiels. ' +
      'Supplements possibles : conjoint (+20%), enfants (+10% par enfant jusqu\'a 4), aide au logement. ' +
      'La demande necessite un dossier medical complet et passe par une commission medicale BL. ' +
      'Les delais d\'instruction peuvent etre longs (3-6 mois).',
    conditions: {
      min_disability: 50,
      min_age: 18,
      max_age: 67,  // apres 67, c'est la pension vieillesse qui prend le relais
      requires_resident: true,
    },
    estimated_annual_value: 4480 * 12,
    value_unit: 'NIS/an (pour 100% invalidite)',
    typical_monthly_amount: 4480,
    application_url: 'https://www.btl.gov.il/benefits/Disability/Pages/default.aspx',
    action_label: 'Faire ma demande d\'invalidite',
    info_url: 'https://www.kolzchut.org.il/he/נכות_כללית',
    disclaimer:
      'La demande necessite un dossier medical complet et une commission medicale BL. Un avocat specialise ou un travailleur social peut vous aider a constituer le dossier.',
    confidence: 'medium',
    status: 'needs_verification',
    verified_at: '2026-04-12',
    tax_year: 2026,
    notes: 'Montants 2026 approximatifs — a verifier exactement apres publication des taux BL 2026 bases sur le salaire moyen.',
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
      'Trois niveaux en 2026 : ' +
      '50% (~2 240 NIS/mois) — aide importante, ' +
      '112% (~5 017 NIS/mois) — aide majoritaire, ' +
      '188% (~8 422 NIS/mois) — aide permanente. ' +
      'L\'evaluation est faite par un travailleur social BL a votre domicile.',
    conditions: {
      min_disability: 100,
      requires_resident: true,
    },
    estimated_annual_value: 2240 * 12,  // niveau de base
    value_unit: 'NIS/an (50% base)',
    typical_monthly_amount: 2240,
    application_url: 'https://www.btl.gov.il/benefits/Disability/attendance_allowance/Pages/default.aspx',
    action_label: 'Demande allocation tierce personne',
    info_url: 'https://www.kolzchut.org.il/he/קצבת_שירותים_מיוחדים',
    disclaimer:
      'Necessite une reconnaissance d\'invalidite 100% prealable et une evaluation par un travailleur social BL a domicile.',
    confidence: 'medium',
    status: 'needs_verification',
    verified_at: '2026-04-12',
    tax_year: 2026,
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
      'Avantages : aide a l\'achat de vehicule adapte (jusqu\'a 92 000 NIS de pret a taux zero), ' +
      'exemption partielle ou totale de la taxe sur le vehicule, ' +
      'allocation mensuelle variable selon le niveau (~1 500-4 000 NIS/mois), ' +
      'carte de stationnement reserve. ' +
      'La demande necessite un dossier medical et une evaluation d\'orthopediste BL.',
    conditions: {
      min_disability: 40,
      requires_resident: true,
    },
    estimated_annual_value: 1500 * 12,
    value_unit: 'NIS/an (variable)',
    typical_monthly_amount: 1500,
    application_url: 'https://www.btl.gov.il/benefits/Mobility/Pages/default.aspx',
    action_label: 'Demande allocation mobilite',
    info_url: 'https://www.kolzchut.org.il/he/קצבת_ניידות',
    disclaimer:
      'Demande complexe necessitant un dossier medical et une commission orthopedique BL. Delais 3-6 mois.',
    confidence: 'low',
    status: 'needs_verification',
    verified_at: '2026-04-12',
    tax_year: 2026,
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
      'Conditions specifiques aux olim. Consultez un conseiller Nefesh B\'Nefesh ou Misrad HaKlita pour votre situation.',
    confidence: 'medium',
    status: 'needs_verification',
    verified_at: '2026-04-12',
    tax_year: 2026,
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
      'Conditions strictes de ressources. Les epargnes, proprietes, voitures et autres biens comptent dans le calcul. Un travailleur social BL peut vous accompagner dans la demande.',
    confidence: 'medium',
    status: 'needs_verification',
    verified_at: '2026-04-12',
    tax_year: 2026,
    notes: 'Montants 2026 approximatifs — depend du statut familial exact et des ressources. A verifier avec BL directement.',
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
// Droit a un conge de maternite paye par Bituach Leumi pour toute
// femme salariee ou independante ayant cotise.
//
// Duree du conge en 2026 :
// - 26 semaines si anciennete >= 12 mois chez le meme employeur
// - 15 semaines si anciennete < 12 mois
// - Jusqu'a 7 semaines peuvent etre prises AVANT l'accouchement
//
// Montant :
// - Calcul base sur le salaire moyen des 3 derniers mois
// - Plafond : le salaire moyen economie (~12 550 NIS/mois en 2026)
// - Minimum : calcul prorata du salaire minimum
//
// Paternite (nouveaute post-2017) :
// - Le pere peut prendre jusqu'a 20 semaines si la mere a droit a 26
// - Duree minimum : 21 jours consecutifs, a partir de la 7e semaine apres l'accouchement

const MATERNITY_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'dmei_leida_full',
    category: 'family',
    authority: 'bituach_leumi',
    title_fr: 'Conge maternite paye 26 semaines (Dmei Leida)',
    title_he: 'דמי לידה מלאים',
    description_fr:
      'Conge maternite de 26 semaines entierement paye par Bituach Leumi pour les salariees ayant au moins 12 mois d\'anciennete chez le meme employeur.',
    full_description_fr:
      'Duree : 26 semaines, dont jusqu\'a 7 semaines peuvent etre prises avant l\'accouchement. ' +
      'Montant : base sur le salaire moyen des 3 derniers mois, plafonne au salaire moyen de l\'economie (~12 550 NIS/mois en 2026). ' +
      'Le paiement est fait directement par BL a la mere (pas par l\'employeur). ' +
      'La demande doit etre faite dans les 12 mois suivant la naissance. ' +
      'Les 14 premieres semaines sont obligatoires, les 12 semaines restantes sont optionnelles mais recommandees.',
    conditions: {
      required_gender: 'female',
      required_employment: ['employed'],
      requires_resident: true,
    },
    estimated_annual_value: 12550 * 6,  // ~6 mois
    value_unit: 'NIS (sur 26 semaines)',
    application_url: 'https://www.btl.gov.il/benefits/Maternity/Pages/default.aspx',
    action_label: 'Demande conge maternite',
    info_url: 'https://www.kolzchut.org.il/he/דמי_לידה',
    disclaimer:
      'Condition : anciennete >= 12 mois chez le meme employeur. Sinon duree reduite a 15 semaines.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-12',
    tax_year: 2026,
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
      'la mere doit aussi avoir droit a 26 semaines. ' +
      'Duree minimum : 21 jours consecutifs, a prendre a partir de la 7e semaine apres la naissance. ' +
      'Maximum : 20 semaines (la mere garde les 6 premieres semaines minimum). ' +
      'Le pere recoit Dmei Leida pendant sa portion de conge, calcule sur son propre salaire.',
    conditions: {
      required_gender: 'male',
      required_employment: ['employed'],
      requires_resident: true,
      min_children: 1,
    },
    estimated_annual_value: 12550 * 5,  // ~5 mois
    value_unit: 'NIS (variable selon duree choisie)',
    application_url: 'https://www.btl.gov.il/benefits/Maternity/Pages/default.aspx',
    action_label: 'Infos conge paternite',
    info_url: 'https://familylawisrael.com/en/paternity-leave-in-israel/',
    disclaimer:
      'Reforme relativement recente (post-2017). Beaucoup d\'employeurs ignorent encore ce droit. Verifiez avec votre RH et BL.',
    confidence: 'medium',
    status: 'needs_verification',
    verified_at: '2026-04-12',
    tax_year: 2026,
  },
]

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
]
