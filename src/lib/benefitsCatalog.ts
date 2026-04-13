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
// Baremes officiels BL 2026 (VERIFIES avril 2026) :
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
    notes: 'Chiffres 2026 officiels BL (1730.33 plafond, 328.76 plancher) verifies via recherche web avril 2026.',
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
    confidence: 'medium',
    status: 'needs_verification',
    verified_at: '2026-04-12',
    tax_year: 2026,
    notes: 'Nouveau credit specifique au combat. A valider avec un yoetz mas en 2026.',
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
      'Verifie via Misrad HaBitachon. Les conditions exactes 2026 doivent etre confirmees.',
    confidence: 'low',
    status: 'needs_verification',
    verified_at: '2026-04-12',
    tax_year: 2026,
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
      'La demande se fait aupres du Rashut HaMisim avec copie du diplome traduite en hebreu.',
    conditions: { requires_resident: true },
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
      'Table officielle (Section 66 du code des impots + reforme 2022) : ' +
      'Annee de naissance : mere +1.5 pts (+4 356 NIS/an), pere +1 pt. ' +
      'Ages 1-5 : mere +2.5 pts (+7 260 NIS/an), pere +1 pt. ' +
      'Ages 6-17 : chaque parent +1 pt (bonus temporaire 2022-2025 ajoutait +1 pt). ' +
      'Cumulable : si vous avez 2 enfants de 3 ans, vous avez 5 points d\'enfants (en plus de votre base).',
    conditions: { required_gender: 'female', min_children: 1 },
    estimated_annual_value: 2.5 * 2904,
    value_unit: 'NIS/an/enfant',
    application_url: 'https://www.gov.il/he/departments/israel_tax_authority',
    action_label: 'Declarer mes enfants sur tofes 101',
    confidence: 'medium',
    status: 'needs_verification',
    verified_at: '2026-04-12',
    notes: 'Tableau exact varie par parent (mere/pere). Version presentee = mere qui travaille. A verifier avec yoetz mas.',
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
      'IMPORTANT : applicable uniquement aux personnes qui deviennent olim chadashim OU residents qui reviennent (toshav chozer) a partir du 1er janvier 2026.',
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
      'Applicable uniquement aux olim arrivant a partir du 1er janvier 2026. Confirmez votre eligibilite avec un yoetz mas. Plafond 1M NIS/an.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-12',
    tax_year: 2026,
    notes: 'Loi adoptee fin 2025. Specifique aux olim 2026+.',
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
    confidence: 'medium',
    status: 'needs_verification',
    verified_at: '2026-04-12',
    tax_year: 2026,
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
      'Versement initial en cash a Ben Gurion, puis 6 mensualites virees sur le compte bancaire israelien. ' +
      'Montants varient selon l\'age, le statut familial et le nombre d\'enfants. ' +
      'Exemples typiques (2026) : celibataire 25-45 ans ~4 500 NIS/mois, couple ~6 500 NIS/mois, couple + 2 enfants ~8 500 NIS/mois. ' +
      'Versements mensuels entre le 1er et le 15 du mois. ' +
      'Cumulable avec Dmei Avtala reduits (regime olim).',
    conditions: {
      requires_oleh: true,
      aliyah_years_range: [0, 0],  // premiere annee uniquement
    },
    estimated_annual_value: 4500 * 6,
    value_unit: 'NIS (sur 6 mois)',
    typical_monthly_amount: 4500,
    application_url: 'https://www.gov.il/en/life-events/immigration-and-assimilation',
    action_label: 'Infos Sal Klita',
    info_url: 'https://www.nbn.org.il/aliyah-rights-and-benefits/',
    disclaimer:
      'Versement automatique pour les olim reconnus. Verifiez avec Misrad HaKlita ou votre conseiller Nefesh B\'Nefesh.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-12',
    tax_year: 2026,
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
      'Montant 2025-2026 : 1 000 a 3 000 NIS/mois selon ville, taille famille et niveau de besoin. ' +
      'Duree : jusqu\'a 4-5 ans (olim avant mars 2024) ou 30 mois (olim apres mars 2024). ' +
      'Conditions : etre oleh chadash, avoir un bail signe, ne pas etre proprietaire. ' +
      'La demande se fait aupres de Misrad HaShikun avec une copie du bail et du teudat oleh.',
    conditions: {
      requires_oleh: true,
      aliyah_years_range: [0, 4],
      required_marital_status: ['single', 'married', 'divorced', 'widowed', 'separated'],
    },
    estimated_annual_value: 2000 * 12,
    value_unit: 'NIS/an (moyenne)',
    typical_monthly_amount: 2000,
    application_url: 'https://www.gov.il/en/life-events/immigration-and-assimilation/housing-for-immigrants',
    action_label: 'Demande aide au loyer',
    info_url: 'https://www.nbn.org.il/life-in-israel/government-services/rights-and-benefits/rental-assistance/',
    disclaimer:
      'Depend de la ville (peripherie = plus d\'aide), de la taille famille, et de votre revenu. Consultez Misrad HaShikun pour le calcul exact.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-12',
    tax_year: 2026,
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
      'Avantages : taux d\'interet reduit vs marche, apport personnel 5-15% (vs 25-40% standard), ' +
      'pret specifique jusqu\'a ~300 000 NIS a taux preferentiel, approbation facilitee. ' +
      'Conditions plus avantageuses pendant les 15 premieres annees. ' +
      'Necessite un Teudat Zakaut delivre par Misrad HaShikun.',
    conditions: {
      requires_oleh: true,
      aliyah_years_range: [0, 14],
    },
    estimated_annual_value: 30000,  // economie estimee sur la duree
    value_unit: 'NIS (economie vs pret standard)',
    application_url: 'https://www.gov.il/en/life-events/immigration-and-assimilation/housing-for-immigrants',
    action_label: 'Obtenir le Teudat Zakaut',
    info_url: 'https://www.easyaliyah.com/aliyah-benefits-mortgage-discount',
    disclaimer:
      'Le Teudat Zakaut doit etre obtenu AVANT de chercher un pret bancaire. Consultez Misrad HaShikun et un conseiller en immobilier.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-12',
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
    value_unit: 'NIS (economie sur achat)',
    application_url: 'https://www.gov.il/he/departments/israel_tax_authority',
    action_label: 'Infos mas rechisha',
    disclaimer:
      'Valable une seule fois et uniquement dans les 7 ans suivant l\'alyah. Consultez un yoetz mas ou un avocat immobilier.',
    confidence: 'medium',
    status: 'needs_verification',
    verified_at: '2026-04-12',
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
    title_fr: 'Reduction Arnona olim (70-90%)',
    title_he: 'הנחה בארנונה לעולים חדשים',
    description_fr:
      'Les nouveaux olim beneficient de 70-90% de reduction d\'arnona pendant 12 mois (sur 100 m² maximum).',
    full_description_fr:
      'Applicable sur les 100 premiers m² du logement. ' +
      'Periode : un seul cycle de 12 mois consecutifs, a choisir dans les 24 premiers mois apres l\'alyah. ' +
      'Demande aupres de la mairie, avec copie du Teudat Oleh.',
    conditions: {
      requires_oleh: true,
      aliyah_years_range: [0, 1],
    },
    estimated_annual_value: 4000,
    value_unit: 'NIS/an (variable selon ville)',
    application_url: 'https://www.gov.il/en/service/arnona-discount',
    action_label: 'Demande arnona olim',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-12',
  },
  {
    slug: 'arnona_disability',
    category: 'housing',
    authority: 'municipality',
    title_fr: 'Reduction Arnona personnes handicapees',
    description_fr: 'Reduction d\'arnona pour les personnes avec taux d\'invalidite reconnu (varie 25-80% selon taux).',
    conditions: { min_disability: 50 },
    estimated_annual_value: 3000,
    value_unit: 'NIS/an (variable)',
    application_url: 'https://www.kolzchut.org.il/he/הנחה_בארנונה',
    action_label: 'Infos reduction handicap',
    confidence: 'medium',
    status: 'needs_verification',
    verified_at: '2026-04-12',
  },
  {
    slug: 'arnona_retiree',
    category: 'housing',
    authority: 'municipality',
    title_fr: 'Reduction Arnona retraites',
    description_fr: 'Reduction d\'arnona pour les retraites recevant la pension vieillesse (taux 25-100% selon revenu).',
    conditions: { min_age: 67 },
    estimated_annual_value: 2000,
    value_unit: 'NIS/an (variable)',
    application_url: 'https://www.kolzchut.org.il/he/הנחה_בארנונה',
    action_label: 'Demande reduction retraite',
    confidence: 'medium',
    status: 'needs_verification',
    verified_at: '2026-04-12',
  },
  {
    slug: 'arnona_single_parent',
    category: 'housing',
    authority: 'municipality',
    title_fr: 'Reduction Arnona parents isoles',
    description_fr: 'Reduction d\'arnona pour les parents isoles avec enfants (variable par mairie).',
    conditions: {
      required_marital_status: ['divorced', 'widowed', 'separated', 'single'],
      min_children: 1,
    },
    estimated_annual_value: 1500,
    value_unit: 'NIS/an (variable)',
    application_url: 'https://www.kolzchut.org.il/he/הנחה_בארנונה',
    action_label: 'Infos reduction parent isole',
    confidence: 'medium',
    status: 'needs_verification',
    verified_at: '2026-04-12',
  },
  {
    slug: 'arnona_student',
    category: 'housing',
    authority: 'municipality',
    title_fr: 'Reduction Arnona etudiants',
    description_fr: 'Reduction d\'arnona pour les etudiants (variable par ville, souvent 10-30%).',
    conditions: { requires_student: true },
    estimated_annual_value: 1000,
    value_unit: 'NIS/an (variable)',
    application_url: 'https://www.kolzchut.org.il/he/הנחה_בארנונה',
    action_label: 'Demande reduction etudiant',
    confidence: 'low',
    status: 'needs_verification',
    verified_at: '2026-04-12',
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
    authority: 'misrad_habitahon',  // Actually ministry of social equality, but closest
    title_fr: 'Allocation mensuelle survivants de la Shoah',
    title_he: 'קצבה חודשית לניצולי שואה',
    description_fr:
      'Allocation mensuelle versee aux survivants de la Shoah reconnus, versee par le Ministere de l\'Egalite Sociale ou via la Claims Conference.',
    full_description_fr:
      'Montants 2026 : entre ~2 800 et ~7 000 NIS/mois (~800-2 000 USD) selon le statut et les conditions de reconnaissance. ' +
      'Certains survivants recoivent aussi des paiements annuels de la Claims Conference. ' +
      'Eligibilite : naissance avant 1945, presence dans un pays occupe par les nazis ou sous regime antijuif entre 1933 et 1945. ' +
      'Couvre aussi certains enfants caches ou conjoints survivants.',
    conditions: {
      requires_holocaust_survivor: true,
      min_age: 79,
    },
    estimated_annual_value: 2800 * 12,
    value_unit: 'NIS/an (base)',
    typical_monthly_amount: 2800,
    application_url: 'https://www.claimscon.org/regions/israel/',
    action_label: 'Contacter Claims Conference',
    disclaimer:
      'Les allocations survivants sont complexes et varient selon le dossier. Plusieurs fondations et organisations peuvent aider (Foundation for the Benefit of Holocaust Victims, Claims Conference, etc.).',
    confidence: 'medium',
    status: 'needs_verification',
    verified_at: '2026-04-12',
  },
  {
    slug: 'holocaust_in_home_services',
    category: 'special',
    authority: 'other',
    title_fr: 'Services a domicile pour survivants (Foundation)',
    description_fr: 'La Foundation for the Benefit of Holocaust Victims offre des services a domicile gratuits (aide menagere, visites sociales, soins) aux survivants isoles.',
    conditions: { requires_holocaust_survivor: true, min_age: 79 },
    estimated_annual_value: 10000,
    value_unit: 'NIS (valeur services)',
    application_url: 'https://www.claimscon.org/regions/israel/',
    action_label: 'Contacter la Foundation',
    confidence: 'medium',
    status: 'needs_verification',
    verified_at: '2026-04-12',
  },
  {
    slug: 'holocaust_arnona_full_exemption',
    category: 'housing',
    authority: 'municipality',
    title_fr: 'Exemption totale Arnona survivants Shoah',
    description_fr: 'Les survivants de la Shoah beneficient d\'une exemption totale ou majoritaire d\'arnona dans la plupart des municipalites israeliennes.',
    conditions: { requires_holocaust_survivor: true },
    estimated_annual_value: 6000,
    value_unit: 'NIS/an (variable)',
    application_url: 'https://www.kolzchut.org.il/he/הנחה_בארנונה',
    action_label: 'Demande exemption arnona',
    confidence: 'medium',
    status: 'needs_verification',
    verified_at: '2026-04-12',
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
      'Programme de mentorat : bourse d\'etudes en echange de 4h/semaine de tutorat benevole aupres d\'enfants defavorises.',
    full_description_fr:
      'Tous les etudiants de l\'enseignement superieur peuvent candidater. ' +
      'En contrepartie de ~4h/semaine de mentorat (deux sessions de 2h), la bourse couvre une partie des frais de scolarite. ' +
      'Montant 2026 : environ 5 200 NIS/an. ' +
      'Compatible avec d\'autres bourses et aides.',
    conditions: { requires_student: true },
    estimated_annual_value: 5200,
    value_unit: 'NIS/an',
    application_url: 'https://perach.org.il/',
    action_label: 'Candidater au PERACH',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-12',
  },
  {
    slug: 'student_authority_olim',
    category: 'education',
    authority: 'misrad_haklita',
    title_fr: 'Etudes superieures gratuites pour olim (Student Authority)',
    title_he: 'מנהל הסטודנטים לעולים',
    description_fr:
      'Les olim chadashim peuvent beneficier d\'etudes superieures gratuites (licence ou master) grace au Minhal HaStudentim.',
    full_description_fr:
      'Couvre les frais de scolarite complets dans la plupart des universites et colleges israeliens. ' +
      'Inclut aussi : guidance pedagogique, programmes de preparation (Mechinat Olim, TAKA), bourses d\'aide. ' +
      'Condition : etre oleh chadash et s\'inscrire dans une institution academique reconnue. ' +
      'Duree : couvre les 10 annees suivant l\'alyah.',
    conditions: {
      requires_oleh: true,
      requires_student: true,
      aliyah_years_range: [0, 9],
    },
    estimated_annual_value: 15000,
    value_unit: 'NIS/an (frais scolarite)',
    application_url: 'https://www.nbn.org.il/life-in-israel/government-services/rights-and-benefits/student-authority-tuition-benefits/',
    action_label: 'Infos Student Authority',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-12',
  },
  {
    slug: 'student_scholarships_general',
    category: 'education',
    authority: 'other',
    title_fr: 'Bourses d\'etudes generales',
    description_fr: 'Bourses proposees par les universites, unions etudiantes et fondations (social, merite, situation financiere).',
    full_description_fr:
      'Chaque universite a son bureau des bourses (Dean of Students). ' +
      'Les unions etudiantes proposent des bourses basees sur l\'implication sociale. ' +
      'Fondations privees (JUF, Hillel, etc.) offrent aussi des bourses pour les etudiants internationaux.',
    conditions: { requires_student: true },
    estimated_annual_value: 3000,
    value_unit: 'NIS (variable)',
    application_url: 'https://che.org.il/en/scholarships-grants-students-faculty/student-scholarships/',
    action_label: 'Chercher des bourses',
    confidence: 'medium',
    status: 'needs_verification',
    verified_at: '2026-04-12',
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
  ...MILUIM_BENEFITS,
  ...TAX_CREDIT_BENEFITS,
  ...OLEH_2026_BENEFITS,
  ...KLITA_BENEFITS,
  ...HOUSING_OLIM_BENEFITS,
  ...ARNONA_BENEFITS,
  ...HOLOCAUST_BENEFITS,
  ...STUDENT_BENEFITS,
]
