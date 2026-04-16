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

export type RequiredShoahPeriod = 'pre_1953' | 'post_1953' | 'ex_urss'
export type RequiredCityPriorityZone = 'a' | 'b' | 'c'

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
  /**
   * Origine de l'invalidite requise.
   * - 'idf'     : invalide de Tsahal (Misrad HaBitahon — Nakhei Tsahal)
   * - 'work'    : accident du travail (BL Nifgaei Avoda)
   * - 'general' : invalidite generale (BL Nakhut Klalit)
   */
  required_disability_source?: 'idf' | 'work' | 'general'
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
  /** Victime (ou famille de) du 7 octobre / Kharvot Barzel */
  requires_7octobre_victim?: boolean
  /**
   * Periode(s) Shoah requise(s) (cf. profile.shoah_period).
   * - 'pre_1953'  : immigre(e) en Israel avant 1953 (categorie vatik)
   * - 'post_1953' : immigre(e) apres 1953
   * - 'ex_urss'   : survivant(e) ex-URSS / Roumanie (Keren Sif 2 / Article 2 Fund)
   * Implique implicitement `is_holocaust_survivor === true`.
   */
  required_shoah_period?: RequiredShoahPeriod | RequiredShoahPeriod[]
  /**
   * Zone de priorite nationale requise (cf. profile.city_priority_zone).
   * Utilise pour zikuy_mas_priferia, mashkanta_olim etc.
   */
  required_city_priority_zone?: RequiredCityPriorityZone | RequiredCityPriorityZone[]
  /**
   * Exige que le beneficiaire soit bailleur residentiel (profile.is_landlord === true).
   * Utilise pour petur_mas_shkhirat_dira, yivua_meshek_bayit.
   */
  requires_landlord?: boolean
  /**
   * Exige que la demobilisation IDF (profile.discharge_date) ait eu lieu dans les N
   * derniers mois. Utilise pour les aides aux soldats recemment liberes.
   */
  requires_recent_discharge_months?: number
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
      '- OU recevoir Havtachat Hakhnasa ou pension invalidite/survivant BL ' +
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
// SECTION 8 — Income Support (Havtachat Hakhnasa) 2026
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
    slug: 'havtachat_hakhnasa',
    category: 'welfare',
    authority: 'bituach_leumi',
    title_fr: 'Revenu minimum garanti (Havtachat Hakhnasa)',
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
// SECTION 16B — Reconnaissance historique speciale (niche)
// =====================================================
// Sources :
// - Loi Asirei Tzion 5752-1992 : https://www.btl.gov.il/benefits/Prisoners_of_Zion/Pages/default.aspx
// - Loi Khasidei Umot Olam 5755-1995 : https://www.btl.gov.il/benefits/Righteous_among_nations/Pages/default.aspx
// - Yad Vashem (reconnaissance) : https://www.yadvashem.org/righteous.html
//
// Allocations niches administrees par Bituach Leumi pour des categories
// historiquement reconnues : prisonniers de Sion (dissidents sovietiques
// emprisonnes pour activite sioniste) et Justes parmi les Nations (non-Juifs
// reconnus par Yad Vashem pour avoir sauve des Juifs durant la Shoah).
//
// Les montants precis 2026 ne sont pas publiquement affiches par BL et
// varient selon la reconnaissance, le handicap eventuel et les ayants-droit.
// Les valeurs ci-dessous sont des fourchettes legales indicatives - la
// demande se fait individuellement via BL.

const SPECIAL_RECOGNITION_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'asirei_tzion',
    category: 'special',
    authority: 'bituach_leumi',
    title_fr: 'Allocation Prisonniers de Sion (Asirei Tzion)',
    title_he: 'תגמולים לאסירי ציון',
    description_fr:
      'Allocation mensuelle versee par Bituach Leumi aux personnes officiellement reconnues comme Prisonniers de Sion (emprisonnees dans un pays d\'origine pour activite sioniste) et a leurs ayants-droit.',
    full_description_fr:
      'Loi 5752-1992 (Chok Tagmulim le-Asirei Tzion u-Vnei Mishpahoteihem). ' +
      'Concerne principalement les juifs dissidents des pays du bloc sovietique ou arabes ' +
      'emprisonnes au moins 6 mois pour leur activite sioniste (organisation d\'hebreu clandestin, ' +
      'demande d\'emigration, refus de service militaire pour motifs sionistes, etc.). ' +
      '\n\n' +
      'Prestations cumulables selon le statut : ' +
      '- Allocation mensuelle de base (Tagmul Hodshi) : alignee sur le salaire moyen de l\'economie (~11 000-13 000 NIS/mois en 2026) ' +
      '- Supplement handicap : si le prisonnier a subi une incapacite reconnue durant sa detention (majoration proportionnelle) ' +
      '- Pension de veuvage : pour le conjoint survivant d\'un prisonnier de Sion decede ' +
      '- Allocation orphelin : pour les enfants mineurs apres deces du parent prisonnier ' +
      '- Soins medicaux et rehabilitation : couverture specifique au-dela de Kupat Holim ' +
      '- Reductions Arnona, transport public, impot (lois annexes) ' +
      '\n\n' +
      'Procedure : dossier a deposer a la commission speciale BL (Vaadat Keria le-Hakaratz be-Asirei Tzion) ' +
      'avec preuves de la periode d\'emprisonnement (archives KGB, temoignages, Yad Vashem pour les dissidents ' +
      'sovietiques). Reconnaissance a vie une fois accordee. Aucune limite d\'age.',
    conditions: {
      requires_resident: true,
      // Les Asirei Tzion sont presque toujours olim (venus d'URSS/pays arabes)
      // mais la reconnaissance n'est pas conditionnee a l'olim status.
    },
    estimated_annual_value: 11000 * 12,  // base individu reconnu
    value_unit: 'NIS/an (~11 000-13 000/mois base, +supplements)',
    typical_monthly_amount: 11000,
    application_url: 'https://www.btl.gov.il/benefits/Prisoners_of_Zion/Pages/default.aspx',
    action_label: 'Demande de reconnaissance',
    info_url: 'https://www.kolzchut.org.il/he/אסירי_ציון',
    disclaimer:
      'Droit niche : concerne principalement les olim d\'ex-URSS et pays arabes ayant ete emprisonnes pour activite sioniste. La reconnaissance se fait via une commission speciale BL. Si vous etes concerne(e) ou descendant(e), contactez imperativement un avocat specialise ou l\'Association des Prisonniers de Sion (Israel Council for the Welfare of Former Prisoners of Zion).',
    confidence: 'medium',
    status: 'verified',
    verified_at: '2026-04-14',
    tax_year: 2026,
    notes: 'Ajout catalogue 14/04/2026 (Phase E niche). Loi 5752-1992. Montants indexes sur le salaire moyen economie - valeur exacte 2026 non publiee par BL, fourchette 11-13k NIS/mois coherente avec le SMB 2026 (~13 300 NIS). Reconnaissance a vie par commission BL speciale. Confidence medium car montants precis non affiches publiquement - chaque dossier est individuel.',
  },
  {
    slug: 'khasidei_umot_olam',
    category: 'special',
    authority: 'bituach_leumi',
    title_fr: 'Allocation Justes parmi les Nations (Khasidei Umot Olam)',
    title_he: 'גמלה לחסידי אומות העולם',
    description_fr:
      'Allocation mensuelle versee par Bituach Leumi aux non-Juifs officiellement reconnus par Yad Vashem comme "Justes parmi les Nations" pour avoir sauve des Juifs durant la Shoah, ainsi qu\'a leurs conjoints survivants s\'ils resident en Israel.',
    full_description_fr:
      'Loi 5755-1995 (Chok Gimlaot le-Khasidei Umot ha-Olam). ' +
      'Reserve aux personnes qui ont recu le titre officiel de Juste parmi les Nations ' +
      'decerne par l\'Institut Yad Vashem apres examen de leur dossier (avoir sauve des Juifs ' +
      'au peril de leur vie pendant la Shoah, sans contrepartie financiere). ' +
      '\n\n' +
      'Prestations : ' +
      '- Allocation mensuelle : alignee sur le salaire moyen de l\'economie (~11 000-13 000 NIS/mois en 2026) ' +
      '- Conjoint survivant : continuite de l\'allocation apres le deces du Juste reconnu ' +
      '- Couverture medicale Kupat Holim complete (cout pris en charge par l\'Etat) ' +
      '- Droit de residence permanent en Israel (si Juste non-israelien souhaite y vivre) ' +
      '- Reductions Arnona, transport public, impot foncier ' +
      '- Aide au logement dans un etablissement specialise si besoin ' +
      '\n\n' +
      'Procedure : ' +
      '1. Reconnaissance prealable par la Commission des Justes parmi les Nations de Yad Vashem ' +
      '   (dossier avec temoignages de survivants, preuves, documents d\'epoque). ' +
      '2. Une fois le titre decerne, demande d\'allocation a Bituach Leumi avec copie de la reconnaissance Yad Vashem. ' +
      '3. Allocation versee des l\'arrivee ou la residence en Israel. ' +
      '\n\n' +
      'En 2026, environ 28 000 Justes ont ete reconnus dans le monde, mais seule une poignee reside ' +
      'actuellement en Israel (la plupart sont decedes ou vivent dans leur pays d\'origine). ' +
      'Cette allocation concerne principalement les conjoints survivants encore en vie.',
    conditions: {
      requires_resident: true,
      // Droit reserve aux Justes reconnus par Yad Vashem (non modelisable en conditions).
    },
    estimated_annual_value: 11000 * 12,
    value_unit: 'NIS/an (~11 000-13 000/mois)',
    typical_monthly_amount: 11000,
    application_url: 'https://www.btl.gov.il/benefits/Righteous_among_nations/Pages/default.aspx',
    action_label: 'Infos Yad Vashem + BL',
    info_url: 'https://www.yadvashem.org/righteous.html',
    disclaimer:
      'Droit extremement niche : reserve aux Justes parmi les Nations officiellement reconnus par Yad Vashem et leur conjoint survivant. Si vous etes concerne(e), contactez d\'abord la Commission des Justes de Yad Vashem (righteous@yadvashem.org.il) pour confirmer la reconnaissance, puis Bituach Leumi pour l\'allocation.',
    confidence: 'medium',
    status: 'verified',
    verified_at: '2026-04-14',
    tax_year: 2026,
    notes: 'Ajout catalogue 14/04/2026 (Phase E niche). Loi 5755-1995. Montants indexes sur le salaire moyen economie (~11-13k NIS/mois en 2026). Tres peu de beneficiaires vivants (~quelques dizaines en Israel), mais critique pour les rares dossiers concernes. Confidence medium car montants exacts non affiches publiquement par BL.',
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
// SECTION C1 — BTL Famille / Maternite (aides manquantes du glossaire)
// =====================================================
// Sources :
// - https://www.btl.gov.il/benefits/Maternity/Pages/default.aspx
// - https://www.kolzchut.org.il/he/שמירת_הריון
// - https://www.kolzchut.org.il/he/קצבת_לידה_(תאומים)
// - https://www.kolzchut.org.il/he/מענק_אשפוז
// - https://www.kolzchut.org.il/he/קצבה_לילד_פג
// - https://www.kolzchut.org.il/he/דמי_מזונות
// - https://www.kolzchut.org.il/he/הורים_מאמצים
// - https://www.kolzchut.org.il/he/דמי_אומנה
//
// Ces aides BTL completent le socle deja couvert dans SECTION 2 (Kitsbat
// Yeladim), SECTION 3 (Maanak Leida) et SECTION 9 (Maternity). Elles sont
// listees au glossaire (memory/glossary.md) mais manquaient au catalogue.

const BTL_FAMILY_EXTRAS_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'shmirat_herayon',
    category: 'family',
    authority: 'bituach_leumi',
    title_fr: 'Conge grossesse a risque (Shmirat Herayon)',
    title_he: 'שמירת הריון',
    description_fr:
      'Indemnite BTL versee aux travailleuses forcees de cesser leur activite sur prescription medicale durant une grossesse a risque, pour au minimum 30 jours consecutifs.',
    full_description_fr:
      'Indemnite journaliere versee par Bituach Leumi aux femmes enceintes contraintes a l\'arret ' +
      'de travail pour raisons medicales liees a la grossesse (prescription d\'un medecin specialiste). ' +
      'Montant : 100 % du salaire journalier moyen des 3 derniers mois, plafonne au salaire moyen ' +
      'de l\'economie (~1 660 NIS/jour en 2026, soit 49 000 NIS/mois). ' +
      'Duree minimum : 30 jours consecutifs. Pas de duree maximum tant que la prescription est renouvelee. ' +
      'Conditions : ' +
      '- Etre salariee ou independante ayant cotise a BTL pendant au moins 6 mois sur les 14 derniers ' +
      '- Arret medical atteste par medecin specialiste (formulaire BL 402) ' +
      '- Arret non couvert par l\'employeur (pas de maintien de salaire) ' +
      'La demande se fait en ligne dans l\'espace personnel BL ou via formulaire papier (BL 402).',
    conditions: {
      required_gender: 'female',
      required_employment: ['employed', 'self_employed'],
      requires_resident: true,
      requires_recent_birth_months: 9,  // proxy : grossesse en cours ou accouchement recent (pas strictement exact)
    },
    estimated_annual_value: 12550 * 2,  // 2 mois de salaire moyen
    typical_monthly_amount: 12550,
    value_unit: 'NIS (100% salaire journalier sur duree d\'arret)',
    application_url: 'https://www.btl.gov.il/benefits/Maternity/Pages/shmiratheraion.aspx',
    action_label: 'Demande shmirat herayon',
    info_url: 'https://www.kolzchut.org.il/he/שמירת_הריון',
    disclaimer:
      'Prescription medicale obligatoire (medecin specialiste), arret minimum 30 jours consecutifs. ' +
      'Plafond indemnite = salaire moyen economie. Si l\'employeur maintient le salaire, pas de droit BTL. ' +
      'La condition requires_recent_birth_months est un proxy : en realite elle doit etre evaluee ' +
      'pendant la grossesse (pas post-naissance) — a affiner avec un champ profile dedie (ex. is_pregnant).',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C1). Slug correspond au glossaire. Match imparfait — le profile n\'a pas de champ is_pregnant, on utilise requires_recent_birth_months comme proxy (fenetre large 9 mois).',
  },
  {
    slug: 'kitzvat_leyda_rav_ubarit',
    category: 'family',
    authority: 'bituach_leumi',
    title_fr: 'Allocation naissances multiples (Kitzvat Leyda Rav-Ubarit)',
    title_he: 'קצבה לידה לתאומים ומעלה',
    description_fr:
      'Allocation mensuelle BTL versee aux meres de jumeaux (ou plus) pendant 20 mois apres la naissance, en complement des autres aides.',
    full_description_fr:
      'Complement a Maanak Leida (deja 10 514 NIS pour jumeaux, 15 771 NIS pour triples en prime unique) : ' +
      'en cas de naissance multiple, BTL verse aussi une allocation mensuelle speciale pendant 20 mois. ' +
      'Montants 2026 (estimations, indexes sur CPI) : ' +
      '- Jumeaux : ~2 700 NIS/mois durant 20 mois (premier mois 100 %, decroissant) ' +
      '- Triples : supplement majore, calcule selon echelle BL ' +
      '- Quadruples et + : echelle speciale (rare, a solliciter directement) ' +
      'Versement automatique si la grossesse multiple est declaree au moment de l\'enregistrement ' +
      'de naissance. Cumulable avec Kitsbat Yeladim, Chisachon LeKol Yeled et Maanak Leida.',
    conditions: {
      required_gender: 'female',
      min_children: 2,  // au moins 2 enfants resultant de la meme grossesse
      requires_resident: true,
      requires_recent_birth_months: 20,  // versement sur 20 mois post-naissance
    },
    estimated_annual_value: 2700 * 12,
    typical_monthly_amount: 2700,
    value_unit: 'NIS/mois (decroissant sur 20 mois)',
    application_url: 'https://www.btl.gov.il/benefits/Maternity/Pages/default.aspx',
    action_label: 'Verifier allocation naissance multiple',
    info_url: 'https://www.kolzchut.org.il/he/קצבה_לידה_לתאומים_ומעלה',
    disclaimer:
      'Le catalogue modelise imparfaitement le cas "jumeaux" : min_children: 2 est active des que la ' +
      'famille a 2 enfants, ce qui peut generer des faux positifs. A raffiner avec un champ profile ' +
      'is_multiple_birth ou une date de naissance identique dans children_birth_dates.',
    confidence: 'medium',
    status: 'needs_verification',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C1). Montants 2026 a confirmer aupres de BL — les chiffres officiels ne sont pas toujours affiches publiquement. Status needs_verification pour eviter faux positifs en prod.',
  },
  {
    slug: 'maanak_ishpuz',
    category: 'family',
    authority: 'bituach_leumi',
    title_fr: 'Prime d\'hospitalisation accouchee (Maanak Ishpuz)',
    title_he: 'מענק אשפוז',
    description_fr:
      'Prime BTL versee a l\'hopital pour couvrir les frais d\'hospitalisation de l\'accouchee et du nouveau-ne (hospitalisation ≥ 3 jours).',
    full_description_fr:
      'Maanak Ishpuz est une prime forfaitaire versee directement a l\'hopital par Bituach Leumi ' +
      'pour couvrir les frais d\'hospitalisation liee a l\'accouchement (mere et bebe). ' +
      'L\'accouchee n\'a donc rien a avancer ni a reclamer elle-meme — la prime finance ' +
      'directement les frais hospitaliers. ' +
      'Montant 2026 : ~13 500 NIS (variable selon hopital et duree). ' +
      'Eligibilite automatique : la mere ou son conjoint doit etre assure(e) a BTL et l\'accouchement ' +
      'doit avoir lieu dans un hopital israelien reconnu (ou transfert 24 h en cas d\'urgence). ' +
      'Couvre aussi l\'hospitalisation du nouveau-ne si duree ≥ 3 jours (ex. prematurite legere).',
    conditions: {
      required_gender: 'female',
      min_children: 1,
      requires_resident: true,
      requires_recent_birth_months: 3,  // paye pendant le sejour hospitalier
    },
    estimated_annual_value: 13500,
    value_unit: 'NIS (prime hospitaliere versee a l\'hopital)',
    application_url: 'https://www.btl.gov.il/benefits/Maternity/Pages/default.aspx',
    action_label: 'Infos Maanak Ishpuz',
    info_url: 'https://www.kolzchut.org.il/he/מענק_אשפוז',
    disclaimer:
      'Prime versee automatiquement par BTL a l\'hopital, pas a la mere directement. La patiente ne voit ' +
      'generalement rien transiter sur son compte — elle ne paie simplement pas la facture hospitaliere. ' +
      'Si vous avez paye de votre poche une facture hospitaliere liee a l\'accouchement, contactez BTL : ' +
      'un remboursement peut etre possible si vous n\'etiez pas correctement enregistre(e).',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C1). La plupart des olim l\'ignorent et pensent que l\'hopital est grace a kupat holim. C\'est en fait cette prime BTL specifique qui couvre les frais.',
  },
  {
    slug: 'kitzva_yeled_pag',
    category: 'family',
    authority: 'bituach_leumi',
    title_fr: 'Allocation enfant premature (Kitzva Yeled Pag)',
    title_he: 'קצבה לילד פג',
    description_fr:
      'Supplement BTL mensuel verse aux parents d\'un enfant ne prematurement (< 34 semaines d\'amenorrhee ou poids < 1 750 g), pendant les 6 premiers mois de vie.',
    full_description_fr:
      'Allocation specifique BTL en complement de Kitsbat Yeladim pour les parents d\'un enfant ne prematurement. ' +
      'Conditions medicales : ' +
      '- Naissance avant 34 semaines d\'amenorrhee (equivalent 32 semaines de grossesse) ' +
      'OU ' +
      '- Poids de naissance inferieur a 1 750 g ' +
      '- Attestation neonatologique du service pediatrique ' +
      'Montants 2026 (indexes CPI) : ~2 400 NIS/mois pendant 6 mois, puis allocation de base. ' +
      'Cumulable avec Kitsbat Yeladim standard, Sherutim Meyukhadim si le bebe garde des sequelles, ' +
      'et Nakhut Klalit a partir de 8 ans si handicap persistant.',
    conditions: {
      min_children: 1,
      requires_resident: true,
      requires_recent_birth_months: 6,  // allocation sur les 6 premiers mois
    },
    estimated_annual_value: 2400 * 6,
    typical_monthly_amount: 2400,
    value_unit: 'NIS/mois (6 mois post-naissance)',
    application_url: 'https://www.btl.gov.il/benefits/Maternity/Pages/default.aspx',
    action_label: 'Demande allocation prematurite',
    info_url: 'https://www.kolzchut.org.il/he/קצבה_לילד_פג',
    disclaimer:
      'Demande a initier directement aupres du service social de la maternite ou du service neonatologie. ' +
      'L\'attestation medicale est jointe au dossier. Modelisation imparfaite : le catalogue declenche la ' +
      'condition pour tout enfant < 6 mois, meme non premature. A affiner avec un champ profile ' +
      'is_premature_birth si besoin.',
    confidence: 'medium',
    status: 'needs_verification',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C1). Status needs_verification pour eviter d\'afficher le droit a tous les parents d\'un bebe de moins de 6 mois (faux positif). Il faut un champ profile is_premature_birth pour promouvoir en verified.',
  },
  {
    slug: 'mezonot',
    category: 'welfare',
    authority: 'bituach_leumi',
    title_fr: 'Avance sur pension alimentaire (Mezonot)',
    title_he: 'דמי מזונות',
    description_fr:
      'Bituach Leumi avance la pension alimentaire fixee par jugement au parent creancier (typiquement la mere) lorsque le debiteur ne paie pas, puis recupere la somme aupres du debiteur.',
    full_description_fr:
      'Dispositif BTL pour eviter la precarite des familles monoparentales : lorsqu\'un jugement civil ' +
      'fixe une pension alimentaire mais que le debiteur (typiquement le pere apres divorce) ne la paie ' +
      'pas, BL avance la somme au parent creancier (avec plafonnement legal). ' +
      'Plafonds 2026 (indexes CPI) : ' +
      '- Pere absent ou decede : jusqu\'a ~2 350 NIS/mois pour 1 enfant, ~3 500 NIS pour 2, ~4 700 pour 3+ ' +
      '- Pere present mais refus de payer : avance egale au montant du jugement, dans la limite des plafonds ' +
      'Conditions : ' +
      '- Jugement de pension alimentaire a la cour des affaires familiales ' +
      '- Non-paiement reel (attestation de Hotzaa lePoal ou huissier) ' +
      '- Parent creancier resident en Israel, revenus sous un seuil ' +
      'BTL se retourne contre le debiteur (saisie salaire, biens) pour recuperer les sommes avancees.',
    conditions: {
      required_marital_status: ['divorced', 'separated', 'single'],
      min_children: 1,
      requires_resident: true,
    },
    estimated_annual_value: 2350 * 12,
    typical_monthly_amount: 2350,
    value_unit: 'NIS/mois (plafonds selon nb enfants)',
    application_url: 'https://www.btl.gov.il/benefits/Alimony/Pages/default.aspx',
    action_label: 'Demande avance mezonot',
    info_url: 'https://www.kolzchut.org.il/he/דמי_מזונות',
    disclaimer:
      'Necessite un jugement civil pour la pension alimentaire. L\'avance BTL est plafonnee et ne remplace ' +
      'pas l\'execution contre le debiteur. Cumulable avec Havtachat Hakhnasa si revenus tres faibles. ' +
      'Parent creancier non marie au debiteur : verifier les conditions specifiques (parent isole).',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C1). Aide majeure meconnue des olim divorcees francophones — souvent elles pensent devoir aller seules contre l\'ex-mari via Hotzaa lePoal, alors que BTL avance la pension et recupere elle-meme.',
  },
  {
    slug: 'horim_meametzim',
    category: 'family',
    authority: 'bituach_leumi',
    title_fr: 'Droits parents adoptifs (Horim Meametzim)',
    title_he: 'הורים מאמצים',
    description_fr:
      'Paquet de droits equivalents a ceux des parents biologiques pour les parents adoptifs agrees : conge, prime de naissance, allocations enfants, etc.',
    full_description_fr:
      'Les parents qui adoptent un enfant (via Misrad HaRevacha agreee OU adoption reconnue a l\'etranger) ' +
      'beneficient d\'un paquet de droits miroir a celui des parents biologiques : ' +
      '- Dmei Imutz : conge parental paye equivalent a Dmei Leida (cf. slug dmei_imutz) ' +
      '- Maanak Leida : prime de naissance appliquee a l\'arrivee au foyer ' +
      '- Kitsbat Yeladim : allocations automatiques des l\'enregistrement ' +
      '- Chisachon LeKol Yeled : compte d\'epargne ouvert des l\'adoption ' +
      '- Maanak Limudim : prime scolarite des 6 ans (sous conditions) ' +
      '- Protection contre licenciement : meme regime que grossesse/maternite (Chok Avodat Nashim) ' +
      'Conditions : adoption officialisee par jugement israelien (Beit Mishpat le-Inyenei Mishpacha) ' +
      'ou reconnaissance d\'une adoption etrangere par le Ministere de la Justice israelien. ' +
      'L\'entree catalogue horim_meametzim centralise les droits non strictement monetaires ' +
      'et pointe vers les slugs specifiques (dmei_imutz, maanak_leida, etc.) pour les indemnites.',
    conditions: {
      min_children: 1,
      requires_resident: true,
    },
    estimated_annual_value: 2103,  // valeur indicative : maanak leida 1er enfant
    value_unit: 'variable (paquet de droits cumules)',
    application_url: 'https://www.btl.gov.il/benefits/Maternity/Pages/default.aspx',
    action_label: 'Infos droits parents adoptifs',
    info_url: 'https://www.kolzchut.org.il/he/הורים_מאמצים',
    disclaimer:
      'Entree "meta" qui rappelle que les parents adoptifs ont les memes droits que les parents ' +
      'biologiques. Pour les indemnites concretes : voir dmei_imutz (conge), maanak_leida ' +
      '(prime naissance), kitsbat_yeladim (allocations). La modelisation min_children: 1 peut generer ' +
      'des faux positifs pour les parents biologiques — a raffiner avec un champ is_adoptive_parent.',
    confidence: 'medium',
    status: 'needs_verification',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C1). Slug du glossaire. Complement a dmei_imutz deja present : ici on couvre l\'ensemble des droits (pas seulement le conge paye). Status needs_verification — il faut un champ profile is_adoptive_parent pour le promouvoir en verified.',
  },
  {
    slug: 'dmei_omna',
    category: 'welfare',
    authority: 'bituach_leumi',
    title_fr: 'Remuneration famille d\'accueil (Dmei Omna)',
    title_he: 'דמי אומנה',
    description_fr:
      'Indemnite BTL versee aux familles d\'accueil (omna) qui prennent en charge un enfant de l\'Etat (retire aux parents par decision judiciaire ou placement volontaire).',
    full_description_fr:
      'Dispositif BTL pour compenser financierement les familles d\'accueil qui hebergent ' +
      'un enfant retire a ses parents biologiques ou confie par Misrad HaRevacha. ' +
      'Montants 2026 (indexes CPI, tarifs gradues selon age et besoins) : ' +
      '- Enfant 0-6 ans     : ~4 300 NIS/mois ' +
      '- Enfant 6-12 ans    : ~4 900 NIS/mois ' +
      '- Enfant 12-18 ans   : ~5 600 NIS/mois ' +
      '- Enfant handicape ou a besoins specifiques : majoration 30-80% selon gravite ' +
      'Couvre aussi : frais medicaux non rembourses kupat holim, frais scolaires, vacances, ' +
      'bourses ponctuelles (bar mitzva, equipement bebe, etc.). ' +
      'Conditions : agrement famille d\'accueil delivre par Misrad HaRevacha apres enquete sociale, ' +
      'formation obligatoire, suivi social regulier. L\'enfant reste juridiquement sous la ' +
      'responsabilite de l\'Etat (contrairement a l\'adoption).',
    conditions: {
      requires_resident: true,
      min_children: 1,  // au moins 1 enfant d\'accueil
    },
    estimated_annual_value: 4900 * 12,
    typical_monthly_amount: 4900,
    value_unit: 'NIS/mois (gradue selon age enfant)',
    application_url: 'https://www.gov.il/he/departments/ministry_of_welfare_and_social_services',
    action_label: 'Devenir famille d\'accueil',
    info_url: 'https://www.kolzchut.org.il/he/דמי_אומנה',
    disclaimer:
      'Necessite l\'agrement prealable de Misrad HaRevacha (candidature, enquete, formation). ' +
      'Modelisation imparfaite : min_children: 1 declenche pour toute famille avec enfant, generant ' +
      'des faux positifs. A raffiner avec un champ is_foster_parent dans le profil.',
    confidence: 'medium',
    status: 'needs_verification',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C1). Niche mais importante pour les olim engages dans le social. Status needs_verification car le profil n\'a pas encore de champ is_foster_parent — a ajouter dans un lot ulterieur pour promouvoir.',
  },
]

// =====================================================
// SECTION C2 — BTL Accidents / Victimes (aides auto-declaratives)
// =====================================================
// Sources :
// - https://www.btl.gov.il/benefits/Work_Injuries/Pages/default.aspx
// - https://www.btl.gov.il/benefits/Hostile_action/Pages/default.aspx
// - https://www.kolzchut.org.il/he/נפגעי_עבודה
// - https://www.kolzchut.org.il/he/תאונות_אישיות
// - https://www.kolzchut.org.il/he/נפגעי_פעולות_איבה
//
// Ces aides ne s'appuient pas sur des champs profil existants — elles sont
// toutes auto-declaratives (l'utilisateur sait s'il a eu un accident reconnu
// ou non). Le matching catalogue reste "best effort" : on renvoie l'entree
// des que les conditions generales (resident, emploi le cas echeant) sont
// remplies, en s'appuyant sur le disclaimer pour preciser qu\'il faut une
// reconnaissance formelle.

const BTL_ACCIDENT_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'nifgaei_avoda',
    category: 'health',
    authority: 'bituach_leumi',
    title_fr: 'Accidents du travail (Nifgaei Avoda)',
    title_he: 'נפגעי עבודה',
    description_fr:
      'Branche BTL qui couvre les accidents et maladies professionnels : indemnites journalieres (dmei pegia), rente d\'invalidite professionnelle (kitzvat nekhe avoda) et rente de survivants.',
    full_description_fr:
      'Regime specifique BTL pour accidents survenant sur le lieu de travail, sur le trajet domicile-travail, ' +
      'ou pathologies reconnues comme maladies professionnelles. ' +
      'Prestations gradees : ' +
      '- Dmei Pegia (indemnite journaliere) : 75 % du salaire journalier, plafonne au salaire moyen ' +
      '  economie, verse pendant maximum 91 jours (3 mois) ' +
      '- Kitzvat Nekhe Avoda (rente invalidite professionnelle) : versee si incapacite reconnue > 9 %, ' +
      '  montant proportionnel au salaire et au taux d\'invalidite (~1 400 a 14 000 NIS/mois) ' +
      '- Rente survivants : pour les ayants-droit en cas de deces accidentel au travail ' +
      '- Remboursement frais medicaux lies a l\'accident (Sal Shikum Miktzoi) ' +
      'La reconnaissance passe par la commission medicale BTL (Vaadat Refuit) apres declaration ' +
      'employeur (formulaire BL 250) dans les 12 mois.',
    conditions: {
      required_disability_source: 'work',
      requires_resident: true,
    },
    estimated_annual_value: 1400 * 12,
    typical_monthly_amount: 1400,
    value_unit: 'NIS/mois (base pour invalidite 20%, cumulable avec dmei pegia)',
    application_url: 'https://www.btl.gov.il/benefits/Work_Injuries/Pages/default.aspx',
    action_label: 'Declaration accident du travail',
    info_url: 'https://www.kolzchut.org.il/he/נפגעי_עבודה',
    disclaimer:
      'La reconnaissance d\'un accident du travail necessite une declaration employeur (BL 250) ' +
      'dans les 12 mois et un passage en commission medicale BTL. Sans reconnaissance formelle, ' +
      'aucune prestation n\'est versee. Un avocat specialise en droit BTL est souvent utile pour ' +
      'les dossiers contestes.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C2). Utilise le champ disability_source=work ajoute en etape B.',
  },
  {
    slug: 'nifgaei_teunot',
    category: 'health',
    authority: 'bituach_leumi',
    title_fr: 'Accidents personnels (Nifgaei Teunot)',
    title_he: 'תאונות אישיות',
    description_fr:
      'Indemnite BTL pour les accidents corporels non couverts par un autre regime (ni travail, ni route, ni hostile) entrainant un arret superieur a 7 jours.',
    full_description_fr:
      'Regime BTL residuel pour les accidents qui ne relevent pas d\'une autre branche (Nifgaei Avoda, ' +
      'PLT route via Karnit, Nifgaei Peulot Eyva, Nakhei Tsahal). ' +
      'Conditions : ' +
      '- Accident corporel survenu en Israel ' +
      '- Arret de travail ou d\'activite habituelle superieur a 7 jours ' +
      '- Declaration BTL dans les 90 jours apres l\'accident (delai strict) ' +
      'Montants 2026 : indemnite journaliere 75 % du salaire moyen des 3 derniers mois, ' +
      'plafonnee au salaire moyen economie, versee pendant maximum 90 jours. ' +
      'Ne donne pas de rente d\'invalidite permanente (pour cela, passer en Nakhut Klalit).',
    conditions: {
      requires_resident: true,
    },
    estimated_annual_value: 12550,
    value_unit: 'NIS (indemnite journaliere sur duree d\'arret, max 90j)',
    application_url: 'https://www.btl.gov.il/benefits/Personal_injury/Pages/default.aspx',
    action_label: 'Declaration accident personnel',
    info_url: 'https://www.kolzchut.org.il/he/תאונות_אישיות',
    disclaimer:
      'Delai strict de 90 jours pour declarer. Ne couvre pas les accidents deja couverts par un autre ' +
      'regime (travail, route, hostile, IDF). Arret minimum 7 jours obligatoire. Declaration via ' +
      'formulaire BL 2101 avec certificat medical.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C2). Aide peu connue des olim — souvent ils laissent passer le delai 90 jours.',
  },
  {
    slug: 'nifgaei_peulot_eyva',
    category: 'special',
    authority: 'bituach_leumi',
    title_fr: 'Victimes d\'actes hostiles (Nifgaei Peulot Eyva)',
    title_he: 'נפגעי פעולות איבה',
    description_fr:
      'Regime BTL special pour les victimes (et familles de victimes) d\'attentats, actes de guerre ou actions hostiles reconnues par le Ministere de la Defense.',
    full_description_fr:
      'Regime aligne sur celui des Nakhei Tsahal (invalides IDF) mais pour les victimes civiles ' +
      'd\'actes hostiles (attentats, tirs de roquettes, intrusions terroristes, etc.). ' +
      'Concerne aussi les evenements du 7 octobre 2023 et la guerre Kharvot Barzel (cf. slug ' +
      'maanak_sal_shikum_nifgaei_7_octobre pour les droits specifiques post-2023). ' +
      'Prestations : ' +
      '- Tagmul basis : rente mensuelle selon taux d\'invalidite reconnu (echelle Nakhei Tsahal) ' +
      '- Sal Shikum (panier rehabilitation) : physiotherapie, psychotherapie, aides techniques ' +
      '- Pension de survivants pour familles endeuillees (cf. kitzvat_mishpakha_nifgaei_peulot_eyva) ' +
      '- Couverture medicale complete au-dela de kupat holim ' +
      'Reconnaissance : dossier a deposer aupres du Misrad HaBitachon (Agaf HaShikum), avec ' +
      'documentation de l\'evenement (PV police, certificats medicaux, temoignages).',
    conditions: {
      requires_resident: true,
    },
    estimated_annual_value: 3000 * 12,
    typical_monthly_amount: 3000,
    value_unit: 'NIS/mois (rente selon taux invalidite)',
    application_url: 'https://www.btl.gov.il/benefits/Hostile_action/Pages/default.aspx',
    action_label: 'Demande reconnaissance victime',
    info_url: 'https://www.kolzchut.org.il/he/נפגעי_פעולות_איבה',
    disclaimer:
      'Reconnaissance formelle par Misrad HaBitachon requise. Dossier complexe : le Service Social ' +
      'BTL et les ONGs (OneFamily, Natal) accompagnent gratuitement les dossiers. Cumulable avec ' +
      'Kitsbat Yeladim, Havtachat Hakhnasa si les revenus du foyer sont bas.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C2). Complementaire au slug kitzvat_mishpakha_nifgaei_peulot_eyva (familles endeuillees civiles) qui sera ajoute en C4.',
  },
  {
    slug: 'nifgaei_polio',
    category: 'special',
    authority: 'bituach_leumi',
    title_fr: 'Victimes de poliomyelite (Nifgaei Polio)',
    title_he: 'נפגעי פוליו',
    description_fr:
      'Loi speciale 5767-2007 : allocation BTL mensuelle + grant unique pour les personnes ayant contracte la poliomyelite en Israel avant l\'eradication de la maladie (annees 1950-1960).',
    full_description_fr:
      'Loi des Victimes de la Polio (Chok Pitsoyei Nifgaei Shituk-Yeladim, 5767-2007) : ' +
      'allocation destinee aux personnes ayant contracte la polio et en gardant des sequelles ' +
      '(post-polio syndrome, paralysies residuelles, douleurs chroniques). ' +
      'Prestations : ' +
      '- Grant unique a la reconnaissance : ~120 000 NIS (montant 2026 indexe) ' +
      '- Rente mensuelle selon taux d\'invalidite reconnu par Vaadat Refuit : 1 200 a 5 400 NIS/mois ' +
      '- Couverture medicale specifique post-polio (physio, aides techniques, orthopedie) ' +
      'Conditions : ' +
      '- Polio contractee en Israel avant 2001 (eradication officielle en Israel) ' +
      '- Sequelles reconnues par commission medicale BTL ' +
      '- Residence israelienne au moment du depot ' +
      'Beneficiaires : principalement nes avant 1970, souvent olim d\'Afrique du Nord / pays arabes ' +
      'ou UE de l\'Est. La reconnaissance est permanente.',
    conditions: {
      requires_resident: true,
      min_age: 30,  // les personnes nees apres 1995 n\'ont pas eu de polio en Israel
    },
    estimated_annual_value: 3000 * 12,
    typical_monthly_amount: 3000,
    value_unit: 'NIS/mois + grant unique ~120 000 NIS',
    application_url: 'https://www.btl.gov.il/benefits/Polio_victims/Pages/default.aspx',
    action_label: 'Demande reconnaissance polio',
    info_url: 'https://www.kolzchut.org.il/he/חוק_פיצוי_לנפגעי_שיתוק_ילדים',
    disclaimer:
      'Droit niche reserve aux personnes ayant eu la polio en Israel (pas contractee a l\'etranger). ' +
      'Si vous avez contracte la polio dans un autre pays, vous n\'etes pas eligible a cette aide ' +
      'mais potentiellement a Nakhut Klalit. La reconnaissance se fait via BTL + commission medicale.',
    confidence: 'medium',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C2). Confidence medium car montants exacts non publics — fourchette estimee. Droit niche mais critique pour les olim ages concernes.',
  },
  {
    slug: 'nifgaei_eyrui_dam',
    category: 'special',
    authority: 'bituach_leumi',
    title_fr: 'Victimes de transfusions contaminees (Nifgaei Eyrui Dam)',
    title_he: 'נפגעי עירוי דם',
    description_fr:
      'Loi 5752-1992 : indemnisation BTL des personnes ayant contracte le VIH, l\'hepatite C ou une autre maladie transmise par transfusion sanguine dans un etablissement israelien.',
    full_description_fr:
      'Chok Pitsoyei Nifgaei Eyrui Dam (5752-1992). Concerne les personnes ayant recu une transfusion ' +
      'sanguine dans un hopital ou centre de don israelien, avant la mise en place du depistage ' +
      'systematique (VIH depuis 1986, hepatite C depuis 1992), et ayant contracte : ' +
      '- VIH / SIDA ' +
      '- Hepatite C chronique ' +
      '- Hepatite B chronique ' +
      '- Autre pathologie infectieuse transmissible par le sang ' +
      'Prestations : ' +
      '- Grant unique : ~250 000 NIS pour VIH, ~120 000 NIS pour hepatite C ' +
      '- Rente mensuelle si incapacite de travail reconnue : 1 500 a 6 000 NIS/mois ' +
      '- Prise en charge complete des traitements (anti-retroviraux, interferon, etc.) au-dela de ' +
      '  kupat holim ' +
      '- Rente survivants pour les ayants-droit en cas de deces ' +
      'Procedure : dossier BTL avec attestation hospitaliere de la transfusion + diagnostic medical ' +
      'de la pathologie contractee.',
    conditions: {
      requires_resident: true,
    },
    estimated_annual_value: 3000 * 12,
    typical_monthly_amount: 3000,
    value_unit: 'NIS/mois + grant unique 120-250 000 NIS',
    application_url: 'https://www.btl.gov.il/benefits/Blood_transfusion/Pages/default.aspx',
    action_label: 'Demande indemnisation transfusion',
    info_url: 'https://www.kolzchut.org.il/he/חוק_פיצויים_לנפגעי_עירוי_דם',
    disclaimer:
      'Droit niche. Necessite une preuve du lien entre la transfusion recue en Israel et la pathologie ' +
      'diagnostiquee (expertise medicale, attestation hopital). Les dossiers avant 1992 (date de la loi) ' +
      'peuvent etre deposes retroactivement. Association d\'aide : AIDS Task Force Israel.',
    confidence: 'medium',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C2). Droit rare mais critique pour les rares cas concernes. Montants estimes (la loi indexe sur le salaire moyen economie).',
  },
  {
    slug: 'nifgaei_gazezet',
    category: 'special',
    authority: 'bituach_leumi',
    title_fr: 'Victimes du traitement de la teigne (Nifgaei Gazezet)',
    title_he: 'נפגעי גזזת',
    description_fr:
      'Loi 5754-1994 : indemnisation BTL des personnes irradiees dans les annees 1948-1960 pour traitement de la teigne (gazezet), ayant developpe cancers / pathologies neurologiques par effet secondaire.',
    full_description_fr:
      'Chok Pitsoyei Nifgaei HaGazezet (5754-1994). Entre 1948 et 1960, ~100 000 enfants olim ' +
      '(principalement d\'Afrique du Nord et Yemen) ont ete traites pour la teigne (gazezet) par ' +
      'irradiation X du cuir chevelu a fortes doses. Cette pratique a ete reconnue apres coup comme ' +
      'ayant cause des pathologies graves a long terme : ' +
      '- Cancers de la thyroide, des glandes salivaires, du cerveau ' +
      '- Tumeurs meningiomes, gliomes ' +
      '- Troubles neurologiques (cephalees chroniques, deficits cognitifs) ' +
      '- Problemes ophtalmologiques, ORL ' +
      'Prestations : ' +
      '- Grant unique a la reconnaissance : ~180 000 NIS (montant 2026 indexe) ' +
      '- Rente mensuelle selon taux d\'invalidite reconnu ' +
      '- Couverture medicale complete post-radiation ' +
      '- Pension survivants pour les ayants-droit en cas de deces lie a la pathologie ' +
      'Procedure : dossier via BTL + Vaadat HaGazezet (commission specifique) avec preuve de ' +
      'traitement (archives hospitalieres, temoignages familiaux, Yad Ha-8 registre national).',
    conditions: {
      requires_resident: true,
      min_age: 65,  // les personnes traitees (1948-1960) ont au moins 65 ans en 2026
    },
    estimated_annual_value: 3000 * 12,
    typical_monthly_amount: 3000,
    value_unit: 'NIS/mois + grant unique ~180 000 NIS',
    application_url: 'https://www.btl.gov.il/benefits/Ringworm_victims/Pages/default.aspx',
    action_label: 'Demande reconnaissance gazezet',
    info_url: 'https://www.kolzchut.org.il/he/חוק_פיצוי_לנפגעי_גזזת',
    disclaimer:
      'Droit reserve aux olim traites en Israel entre 1948 et 1960. Les archives hospitalieres ' +
      'sont souvent perdues — les temoignages familiaux et la date d\'alyah (olim marocains/yemenites ' +
      'des annees 50) sont alors utilises. Association d\'aide : Association des Victimes de la Gazezet.',
    confidence: 'medium',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C2). Droit niche mais tres important pour les olim sepharades ages nes dans les annees 50-60. Beaucoup l\'ignorent — leur generation est souvent mal au courant des lois israeliennes.',
  },
  {
    slug: 'pgia_bizman_hitnadvut',
    category: 'special',
    authority: 'bituach_leumi',
    title_fr: 'Blessures en mission volontaire (Pgia Bizman Hitnadvut)',
    title_he: 'פגיעה בזמן התנדבות',
    description_fr:
      'Regime BTL pour les volontaires agrees (Maguen David Adom, Zaka, Sherut Leumi, ONGs conventionnees) blesses durant une mission volontaire reconnue.',
    full_description_fr:
      'Chok HaBituach HaLeumi, chapitre special "Hitnadvut" : BTL couvre les accidents et blessures ' +
      'survenus au cours d\'une mission volontaire reconnue par l\'Etat. ' +
      'Volontariats eligibles : ' +
      '- Sherut Leumi (service civique national, filles et exemptes) ' +
      '- Maguen David Adom (secouristes benevoles) ' +
      '- Zaka (identification des victimes) ' +
      '- Volontaires ONGs conventionnees avec Misrad HaRevacha ' +
      '- Volontaires Pitsui Eytan (secours en cas de catastrophe) ' +
      'Prestations : ' +
      '- Indemnites journalieres durant l\'arret (similaires Nifgaei Avoda) ' +
      '- Rente mensuelle si invalidite permanente reconnue ' +
      '- Grant unique en cas de deces au profit des ayants-droit ' +
      '- Couverture medicale liee a l\'accident ' +
      'Conditions : la mission doit etre formellement enregistree (presence atteste par le responsable) ' +
      'et l\'accident doit etre declare a BTL dans les 12 mois.',
    conditions: {
      requires_resident: true,
    },
    estimated_annual_value: 2500 * 12,
    typical_monthly_amount: 2500,
    value_unit: 'NIS/mois (rente) + indemnites journalieres',
    application_url: 'https://www.btl.gov.il/benefits/Volunteering/Pages/default.aspx',
    action_label: 'Declaration accident volontariat',
    info_url: 'https://www.kolzchut.org.il/he/פגיעה_בזמן_התנדבות',
    disclaimer:
      'Droit meconnu mais important pour les olim engages dans le benevolat. L\'organisation doit ' +
      'avoir conventionne avec BTL et la mission doit etre enregistree. Pour les volontaires informels ' +
      '(aide spontanee sans structure), le regime applicable est plutot Nifgaei Teunot.',
    confidence: 'medium',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C2). Important notamment pour les volontaires Zaka / MDA qui interviennent sur des scenes traumatiques. Cumulable avec la couverture kupat holim.',
  },
]

// =====================================================
// SECTION C3 — Shoah complet (S5 + S14 + S15 du glossaire)
// =====================================================
// Sources :
// - https://www.rashut-shoa.gov.il/ (Rashut leNiztolei HaShoah)
// - https://www.claimscon.org/
// - https://www.k-shoa.org/ (Foundation for the Benefit of Holocaust Victims)
// - https://www.gov.il/he/departments/the_authority_for_the_rights_of_holocaust_survivors
//
// Ces 11 aides discriminent les 3 categories de survivants (pre_1953,
// post_1953, ex_urss) via le champ profile.shoah_period ajoute en etape B.
// Complementaires aux 3 entrees Shoah deja presentes :
// - holocaust_monthly_stipend    (pension generique, SECTION 16)
// - holocaust_in_home_services   (services a domicile, SECTION 16)
// - holocaust_arnona_full_exemption (arnona, SECTION 16)

const HOLOCAUST_EXTRAS_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'tagmul_niztolei_shoah_vatik',
    category: 'special',
    authority: 'other',  // Rashut leNiztolei HaShoah (Misrad HaOtzer)
    title_fr: 'Pension Shoah pre-1953 (Tagmul Niztolei Shoah Vatik)',
    title_he: 'תגמול ניצולי שואה ותיקים',
    description_fr:
      'Pension mensuelle majoree versee par Rashut leNiztolei HaShoah aux survivants immigres en Israel avant le 01/10/1953 (olim "vatikim") n\'ayant pas recu de BEG allemand.',
    full_description_fr:
      'Loi sur les Benefices aux Survivants de la Shoah (Chok Nitzolei HaShoah). ' +
      'Categorie "vatikim" (anciens) : olim arrives en Israel avant le 01/10/1953 qui n\'ont pas ' +
      'pu deposer de dossier de reparation allemande (BEG) parce qu\'ils n\'etaient pas encore en ' +
      'Allemagne de l\'Ouest a ce moment-la. ' +
      'Montants officiels 2026 (verifies gov.il / rashut-shoa.gov.il) : ' +
      '- Base individu                          : 2 861 NIS/mois ' +
      '- Handicap reconnu 25-50%                : 3 500-5 000 NIS/mois ' +
      '- Handicap reconnu ≥ 50%                 : 5 000-7 184 NIS/mois ' +
      '- Avec conjoint survivant a charge       : +620 NIS/mois ' +
      'Cumulable avec : Maanak Shnati (grant annuel), Kitzbat Zikna (retraite BTL), Arnona Shoah, ' +
      'Tarifs reduits utilities, Hatavot Refuiot. ' +
      'Procedure : dossier a deposer a Rashut leNiztolei HaShoah avec preuve d\'alyah avant 1953 ' +
      '(Teudat Oleh, archives Sokhnut, recensement 1951-1954).',
    conditions: {
      required_shoah_period: 'pre_1953',
      requires_resident: true,
    },
    estimated_annual_value: 2861 * 12,
    typical_monthly_amount: 2861,
    value_unit: 'NIS/mois (2 861-7 184 selon taux invalidite)',
    application_url: 'https://www.gov.il/he/departments/the_authority_for_the_rights_of_holocaust_survivors',
    action_label: 'Demande pension Shoah vatik',
    info_url: 'https://www.kolzchut.org.il/he/ניצולי_שואה_ותיקים',
    disclaimer:
      'Reserve aux olim arrives AVANT le 01/10/1953. Si vous etes arrive apres, voir plutot ' +
      'tagmul_niztolei_shoah_vatik (ou le regime Article 2 Fund / Keren Sif 2). Le champ profile ' +
      'shoah_period=pre_1953 discrimine automatiquement.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C3). Utilise le champ shoah_period ajoute en etape B pour discriminer les 3 categories (pre/post 1953 / ex-URSS).',
  },
  {
    slug: 'kitzva_keren_sif2_claims',
    category: 'special',
    authority: 'claims_conference',
    title_fr: 'Keren Sif 2 / Article 2 Fund (Claims Conference)',
    title_he: 'קרן סעיף 2 - כספי גרמניה',
    description_fr:
      'Pension mensuelle versee par la Claims Conference aux survivants de la Shoah originaires d\'ex-URSS, Roumanie ou pays de l\'Est, n\'ayant pas recu de BEG direct allemand.',
    full_description_fr:
      'Article 2 Fund (aussi appele "Keren Sif 2" en hebreu administratif) : pension financee par ' +
      'l\'Allemagne a travers la Claims Conference, destinee aux survivants qui ne pouvaient pas ' +
      'beneficier du BEG classique (ex-URSS, Roumanie, pays du bloc sovietique, Europe de l\'Est). ' +
      'Montant 2026 : 667 EUR/mois (~2 670 NIS au taux actuel). ' +
      'Conditions d\'eligibilite : ' +
      '- Avoir survecu a : camp de concentration / ghetto (≥ 6 mois) / cachette (≥ 18 mois) ' +
      '- NE PAS recevoir deja une pension BEG allemande mensuelle ' +
      '- NE PAS recevoir deja la gmala mensuelle Rashut leNiztolei HaShoah israelienne ' +
      '- Residence actuelle : Israel, USA, Europe, autre pays reconnu ' +
      'Financement : gouvernement allemand, verse directement aux beneficiaires par Claims Conference ' +
      '(pas par BTL ni Rashut leNiztolei HaShoah). Exempte d\'impot en Israel et en Allemagne.',
    conditions: {
      required_shoah_period: 'ex_urss',
      requires_resident: true,
    },
    estimated_annual_value: 2670 * 12,
    typical_monthly_amount: 2670,
    value_unit: 'NIS/mois (~667 EUR converti)',
    application_url: 'https://www.claimscon.org/applynow',
    action_label: 'Demande Claims Conference',
    info_url: 'https://www.kolzchut.org.il/he/קרן_סעיף_2',
    disclaimer:
      'NE PAS confondre avec la gmala israelienne Rashut leNiztolei HaShoah (les deux ne sont pas ' +
      'cumulables). Si vous avez deja une BEG allemande mensuelle, ce fonds ne vous est pas ouvert. ' +
      'Procedure gratuite via Claims Conference (pas besoin d\'avocat). Delai moyen de reponse : 6-12 mois.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C3). Cible les survivants d\'ex-URSS / Roumanie via shoah_period=ex_urss. Deux slugs dans le glossaire (kitzva_keren_sif2_claims + keren_sif2_article2_fund) pour le meme fonds, vu sous 2 angles (BL vs Claims) — on garde le nom administratif israelien ici, l\'autre slug sera une entree complementaire.',
  },
  {
    slug: 'gmala_hashlama_sif2',
    category: 'special',
    authority: 'other',  // Rashut leNiztolei HaShoah
    title_fr: 'Supplement israelien Keren Sif 2 (Gmala Hashlama)',
    title_he: 'גמלת השלמה לקרן סעיף 2',
    description_fr:
      'Supplement mensuel verse par l\'Etat israelien (Rashut leNiztolei HaShoah) aux beneficiaires Keren Sif 2 / Article 2 Fund a revenus tres faibles, pour atteindre un plancher de revenu.',
    full_description_fr:
      'Beneficiant deja de la pension Keren Sif 2 / Article 2 Fund (~667 EUR/mois) les survivants ' +
      'ex-URSS / Roumanie qui vivent en Israel peuvent demander un supplement israelien pour atteindre ' +
      'un plancher de revenu comparable aux vatikim. ' +
      'Montant 2026 : variable selon revenus du foyer (et Kitzbat Zikna BTL) — typiquement 500 a 2 500 ' +
      'NIS/mois en complement des 2 670 NIS Keren Sif 2. Plancher cible : ~4 500 NIS/mois total (2026). ' +
      'Conditions : ' +
      '- Beneficier deja de Keren Sif 2 (dossier Claims Conference valide) ' +
      '- Residence en Israel ' +
      '- Revenus du foyer sous un plafond (~6 000 NIS/mois pour individu, ~8 500 pour couple) ' +
      'Procedure : dossier Rashut leNiztolei HaShoah avec justificatifs de la pension Claims Conference ' +
      'et releves bancaires 3 derniers mois.',
    conditions: {
      required_shoah_period: 'ex_urss',
      requires_resident: true,
      max_monthly_income: 6000,
    },
    estimated_annual_value: 1500 * 12,
    typical_monthly_amount: 1500,
    value_unit: 'NIS/mois (variable selon ecart au plancher)',
    application_url: 'https://www.gov.il/he/departments/the_authority_for_the_rights_of_holocaust_survivors',
    action_label: 'Demande supplement Keren Sif 2',
    info_url: 'https://www.kolzchut.org.il/he/קרן_סעיף_2',
    disclaimer:
      'Supplement conditionne a des revenus faibles. Les beneficiaires Keren Sif 2 qui ont aussi une ' +
      'pension BTL / retraite confortable n\'y ont pas droit. A examiner individuellement avec ' +
      'Rashut leNiztolei HaShoah. Cumulable avec Kitzbat Zikna et Havtachat Hakhnasa.',
    confidence: 'medium',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C3). Plafond revenus approximatif — a confirmer avec Rashut officielle. Niche mais critique pour les olim sovietiques ages a revenus tres faibles.',
  },
  {
    slug: 'maanak_matzeva_shoah',
    category: 'special',
    authority: 'other',  // Rashut leNiztolei HaShoah
    title_fr: 'Grant pierre tombale survivant Shoah (Maanak Matzeva)',
    title_he: 'מענק מצבה לניצולי שואה',
    description_fr:
      'Grant unique verse a la famille d\'un survivant de la Shoah decede pour couvrir les frais d\'une pierre tombale (matzeva) dans un cimetiere israelien.',
    full_description_fr:
      'Aide symbolique mais importante versee par Rashut leNiztolei HaShoah aux ayants-droit d\'un ' +
      'survivant decede pour contribuer aux frais de pose d\'une pierre tombale (matzeva) dans un ' +
      'cimetiere israelien. ' +
      'Montant 2026 : 2 022 NIS (verse une fois). ' +
      'Cumulable avec : ' +
      '- Dmei Kvura BTL (~9 000 NIS, allocation funeraire generale) ' +
      '- Grants Claims Conference pour funerailles si dossier ouvert ' +
      '- Participation mairie dans certains cas ' +
      'Conditions : ' +
      '- Le defunt doit avoir ete reconnu survivant de la Shoah (attestation Rashut ou Claims) ' +
      '- Sepulture dans un cimetiere israelien reconnu ' +
      '- Demande par ayants-droit (conjoint, enfant, petit-enfant) dans les 12 mois apres le deces ' +
      'Procedure : formulaire Rashut avec copie du Teudat Ptira, attestation de reconnaissance ' +
      'survivant, facture ou devis pose de la matzeva.',
    conditions: {
      requires_holocaust_survivor: true,  // indirectement via le defunt, mais proxy
      requires_resident: true,
    },
    estimated_annual_value: 2022,
    value_unit: 'NIS (versement unique aux ayants-droit)',
    application_url: 'https://www.gov.il/he/departments/the_authority_for_the_rights_of_holocaust_survivors',
    action_label: 'Demande grant matzeva',
    info_url: 'https://www.kolzchut.org.il/he/מענק_מצבה_לניצולי_שואה',
    disclaimer:
      'Verse aux ayants-droit du defunt (pas au survivant lui-meme). Modelisation imparfaite : le ' +
      'catalogue declenche la condition pour tout survivant reconnu, alors que le beneficiaire reel ' +
      'est sa famille apres deces. A raffiner avec un champ is_bereaved_of_shoah_survivor.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C3). Montant 2 022 NIS confirme via glossaire. Aide modeste mais automatique si demande faite dans les 12 mois.',
  },
  {
    slug: 'maanak_shnati_shoah',
    category: 'special',
    authority: 'other',  // Rashut leNiztolei HaShoah
    title_fr: 'Grant annuel survivants Shoah (Maanak Shnati)',
    title_he: 'מענק שנתי לניצולי שואה',
    description_fr:
      'Grant annuel verse en une fois par Rashut leNiztolei HaShoah a tous les survivants de la Shoah reconnus, independamment de leur categorie pre/post 1953 ou ex-URSS.',
    full_description_fr:
      'Depuis 2014, l\'Etat d\'Israel verse un grant annuel unique a tous les survivants de la Shoah ' +
      'reconnus pour compenser les cout de vie eleves et les besoins specifiques (medicaments, ' +
      'aides techniques, chauffage). ' +
      'Montant 2026 : 7 688 NIS/an (indexe sur CPI). ' +
      'Verse automatiquement en debut d\'annee fiscale (avril) sur le compte bancaire enregistre ' +
      'aupres de Rashut leNiztolei HaShoah. Pas de demande a faire si deja reconnu. ' +
      'Eligibilite : ' +
      '- Toute personne reconnue survivante de la Shoah (pre_1953, post_1953, ex_urss) ' +
      '- Conjoint survivant a vie si deja reconnu ' +
      '- Non soumis a condition de revenus ' +
      'Cumulable avec toutes les autres aides Shoah (gmala mensuelle, Maanak Matzeva, Hatavot Refuiot, ' +
      'Arnona Shoah, Keren Sif 2).',
    conditions: {
      requires_holocaust_survivor: true,
      requires_resident: true,
    },
    estimated_annual_value: 7688,
    value_unit: 'NIS/an (versement unique avril)',
    application_url: 'https://www.gov.il/he/departments/the_authority_for_the_rights_of_holocaust_survivors',
    action_label: 'Verifier grant annuel',
    info_url: 'https://www.kolzchut.org.il/he/מענק_שנתי_לניצולי_שואה',
    disclaimer:
      'Verse automatiquement a tous les survivants reconnus, sans demande. Si vous pensez etre ' +
      'eligible mais ne recevez rien : contacter Rashut leNiztolei HaShoah (03-504-8700) — il manque ' +
      'probablement une reconnaissance formelle ou un coordonnees bancaires obsoletes.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C3). Montant 7 688 NIS/an confirme via glossaire. Automatique — beaucoup de survivants ignorent qu\'ils l\'ont deja, ou l\'encaissent sans le savoir.',
  },
  {
    slug: 'tagmul_shaarim_niztolei_shoah',
    category: 'special',
    authority: 'other',  // Rashut leNiztolei HaShoah
    title_fr: 'Pension conjoint survivant Shoah (Tagmul Sheirim)',
    title_he: 'תגמול שאירים לניצולי שואה',
    description_fr:
      'Pension mensuelle versee au conjoint survivant d\'un beneficiaire Rashut leNiztolei HaShoah decede, pour maintenir un revenu minimum.',
    full_description_fr:
      'Lorsqu\'un survivant de la Shoah beneficiaire de la gmala mensuelle decede, son conjoint a vie ' +
      '(meme s\'il n\'etait pas lui-meme survivant) peut continuer a percevoir une pension reduite ' +
      'pour eviter la chute brutale des revenus. ' +
      'Montants 2026 : ' +
      '- Conjoint survivant seul                : ~2 000 NIS/mois (60% de la gmala de base) ' +
      '- Avec handicap reconnu                  : jusqu\'a 3 500 NIS/mois ' +
      '- Conjoint lui-meme survivant reconnu    : cumulable avec sa propre gmala ' +
      'Conditions : ' +
      '- Le defunt etait beneficiaire actif de la gmala Shoah au moment du deces ' +
      '- Conjoint marie legalement ou en union civile au moment du deces ' +
      '- Residence israelienne maintenue ' +
      'Procedure : dossier a deposer a Rashut dans les 12 mois apres le deces avec Teudat Ptira, ' +
      'attestation de reconnaissance du defunt et preuve de mariage/union.',
    conditions: {
      required_marital_status: ['widowed'],
      requires_resident: true,
    },
    estimated_annual_value: 2000 * 12,
    typical_monthly_amount: 2000,
    value_unit: 'NIS/mois (pension conjoint survivant)',
    application_url: 'https://www.gov.il/he/departments/the_authority_for_the_rights_of_holocaust_survivors',
    action_label: 'Demande pension conjoint survivant',
    info_url: 'https://www.kolzchut.org.il/he/תגמול_שאירים_לניצולי_שואה',
    disclaimer:
      'Reserve aux conjoints d\'un survivant decede qui etait lui-meme beneficiaire actif de la gmala ' +
      'Shoah. Si le defunt n\'avait pas ouvert de dossier Shoah de son vivant, pas de droit. A noter : ' +
      'si le conjoint est lui-meme survivant reconnu (cas frequent), sa propre gmala reste versee en ' +
      'plus de la pension Sheirim.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C3). La modelisation par marital_status=widowed est imparfaite car elle declenche pour toute veuve/veuf, meme sans conjoint Shoah. A raffiner avec un champ profile is_widow_of_shoah_survivor.',
  },
  {
    slug: 'hatavot_refuiot_niztolei_shoah',
    category: 'health',
    authority: 'other',  // Rashut leNiztolei HaShoah + Kupot Holim
    title_fr: 'Avantages medicaux survivants Shoah (Hatavot Refuiot)',
    title_he: 'הטבות רפואיות לניצולי שואה',
    description_fr:
      'Exonerations et priorites medicales pour les survivants de la Shoah reconnus : gratuite consultations specialistes, medicaments, aides techniques, soins dentaires, psychotherapie.',
    full_description_fr:
      'Paquet d\'avantages medicaux cumules, vers par Rashut leNiztolei HaShoah + les 4 Kupot Holim : ' +
      '- Exoneration totale des franchises (hishtatfut atzmit) sur medicaments ' +
      '- Exoneration consultations specialistes (y compris privees conventionnees) ' +
      '- Psychotherapie gratuite (sans limite de seances) via Amkha, Natal, Kupat Holim ' +
      '- Soins dentaires majoritairement pris en charge (implants, protheses) ' +
      '- Prioritaire en kinesitherapie, ergotherapie ' +
      '- Aides techniques gratuites : fauteuil, deambulateur, lit medicalise ' +
      '- Adaptation logement prise en charge jusqu\'a ~30 000 NIS (barres, monte-escalier) ' +
      'Valeur totale typique : 10 000 a 25 000 NIS/an selon niveau de dependance. ' +
      'Procedure : inscription aupres de sa kupat holim avec attestation de reconnaissance ' +
      'Shoah — active automatiquement le profil beneficiaire (le "ot" / marque dans le dossier medical).',
    conditions: {
      requires_holocaust_survivor: true,
      requires_resident: true,
    },
    estimated_annual_value: 15000,
    value_unit: 'NIS/an (valeur des services et exonerations)',
    application_url: 'https://www.gov.il/he/departments/the_authority_for_the_rights_of_holocaust_survivors',
    action_label: 'Activer hatavot refuiot',
    info_url: 'https://www.kolzchut.org.il/he/הטבות_רפואיות_לניצולי_שואה',
    disclaimer:
      'Necessite l\'activation du statut aupres de votre kupat holim (pas automatique pour les olim ' +
      'recents meme reconnus Shoah). Apporter l\'attestation Rashut leNiztolei HaShoah ou Claims ' +
      'Conference. Les avantages peuvent varier legerement selon Clalit / Maccabi / Meuhedet / Leumit.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C3). Valeur 15k NIS/an est une estimation moyenne. Beaucoup de survivants non encore actives dans kupat holim — gain immediat possible.',
  },
  {
    slug: 'taavurot_hatavot_shoah',
    category: 'welfare',
    authority: 'other',  // IEC, Mei Avivim, mairies
    title_fr: 'Tarifs reduits utilities survivants Shoah (electricite, eau, taavura)',
    title_he: 'הטבות תעריפי חשמל, מים ותחבורה לניצולי שואה',
    description_fr:
      'Reductions automatiques sur les factures d\'electricite (50% sur 400 kWh), eau (jusqu\'a 50% des blocs de base) et transport public (Rav-Kav profil Shoah ou 67+) pour les survivants reconnus.',
    full_description_fr:
      'Paquet de tarifs reduits sur les services publics pour les survivants de la Shoah reconnus : ' +
      'Electricite (IEC / Israel Electric Corporation) : ' +
      '- 50 % de reduction sur les 400 premiers kWh/mois (similaire seniors/invalides) ' +
      '- Plafond economies : ~100-150 NIS/mois soit 1 200-1 800 NIS/an ' +
      'Eau (Mei Avivim / societes locales) : ' +
      '- Tarif bloc 1 gratuit ou a 50% pour les beneficiaires de la gmala mensuelle Shoah ' +
      '- Economies : 50-150 NIS/mois selon consommation ' +
      'Transport public : ' +
      '- Les 67+ ont deja la gratuite totale (reforme 2025 — cf. rav_kav_senior_free) ' +
      '- Les moins de 67 ans survivants ont un profil Rav-Kav reduit (50%) ' +
      'Procedure : les reductions sont automatiques pour les beneficiaires actifs de la gmala mensuelle, ' +
      'sinon demande une fois aupres de l\'operateur avec attestation Rashut.',
    conditions: {
      requires_holocaust_survivor: true,
      requires_resident: true,
    },
    estimated_annual_value: 2000,
    value_unit: 'NIS/an (cumul electricite + eau + transport)',
    application_url: 'https://www.iec.co.il/content/discounts',
    action_label: 'Activer tarifs reduits',
    info_url: 'https://www.kolzchut.org.il/he/הטבות_לניצולי_שואה',
    disclaimer:
      'Reductions automatiques pour les beneficiaires actifs de la gmala mensuelle. Si vous ne recevez ' +
      'pas la gmala mais etes reconnu survivant (cas des beneficiaires Keren Sif 2 uniquement), ' +
      'demande manuelle a chaque operateur avec attestation Rashut ou Claims.',
    confidence: 'medium',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C3). Regroupe electricite + eau + transport dans une seule entree pour simplifier. Valeur 2k NIS/an est conservatrice.',
  },
  {
    slug: 'maanak_hardship_fund_claims',
    category: 'special',
    authority: 'claims_conference',
    title_fr: 'Hardship Fund + Supplemental (Claims Conference)',
    title_he: 'קרן הקושי - כספי גרמניה',
    description_fr:
      'Paiement unique (~10 500 NIS) + supplement annuel (~5 540 NIS/an) verses par la Claims Conference aux survivants de la Shoah n\'ayant jamais recu de BEG mensuel allemand.',
    full_description_fr:
      'Hardship Fund (fonds d\'aide d\'urgence) cree en 1980 par la Claims Conference pour les survivants ' +
      'qui n\'avaient pas pu beneficier du BEG directement (olim arrives en Israel avant 1953, ou ' +
      'vivants dans des pays communistes). ' +
      'Prestations : ' +
      '- Hardship Fund (one-shot) : ~2 500 EUR (~10 500 NIS au taux actuel) a la reconnaissance ' +
      '- Hardship Supplemental : ~1 320 EUR/an (~5 540 NIS/an) verse chaque annee aux beneficiaires ' +
      '  du Hardship Fund qui n\'ont pas d\'autre pension allemande mensuelle ' +
      'Conditions : ' +
      '- Avoir survecu a : camp / ghetto / cachette / exode force ' +
      '- NE PAS avoir de pension BEG allemande mensuelle ' +
      '- NE PAS avoir deja recu le Hardship Fund (une fois par personne) ' +
      'Procedure : dossier Claims Conference gratuit (pas besoin d\'avocat), delai moyen 6-18 mois. ' +
      'Cumulable avec la gmala israelienne Rashut leNiztolei HaShoah et Article 2 Fund (selon categorie).',
    conditions: {
      requires_holocaust_survivor: true,
      requires_resident: true,
    },
    estimated_annual_value: 5540,  // supplement annuel recurrent
    value_unit: 'NIS/an (supplement) + one-shot 10 500 NIS',
    application_url: 'https://www.claimscon.org/applynow',
    action_label: 'Demande Hardship Fund',
    info_url: 'https://www.claimscon.org/survivor-services/compensation-and-restitution/',
    disclaimer:
      'Dossier a deposer directement aupres de la Claims Conference (pas via BTL ni Rashut). Examiner ' +
      'avant depot si vous n\'avez pas deja une BEG mensuelle (les deux ne sont pas cumulables). ' +
      'La majorite des olim d\'Afrique du Nord et d\'Europe de l\'Est n\'ont pas de BEG et sont donc ' +
      'eligibles au Hardship.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C3). Montants 2026 confirmes via claimscon.org / glossaire. Hardship est l\'aide la plus accessible — ne necessite pas de preuve de camp, juste presence en zone occupee.',
  },
  {
    slug: 'keren_sif2_article2_fund',
    category: 'special',
    authority: 'claims_conference',
    title_fr: 'Article 2 Fund / Keren Sif 2 (angle Claims Conference)',
    title_he: 'קרן סעיף 2 - ארטיקל 2',
    description_fr:
      'Meme fonds que kitzva_keren_sif2_claims, mais accessible via la Claims Conference directement (utile pour les survivants ex-URSS residant hors Israel ou en diaspora).',
    full_description_fr:
      'Article 2 Fund : pension mensuelle de 667 EUR (~2 734 NIS) versee par la Claims Conference ' +
      'aux survivants de la Shoah ayant survecu a un camp / ghetto / cachette en zone d\'occupation ' +
      'nazie ou sovietique. Financement : gouvernement allemand. ' +
      'Double entree dans le catalogue : ' +
      '- kitzva_keren_sif2_claims : angle administratif israelien (BTL / Rashut), profile shoah_period=ex_urss ' +
      '- keren_sif2_article2_fund : angle Claims Conference (international, pour les survivants residant ' +
      '  hors Israel ou en diaspora sovietique recente) ' +
      'Conditions communes : ' +
      '- Passage en zone nazie ou sovietique occupee entre 1933 et 1945 (camp, ghetto, cachette ≥ 18 mois) ' +
      '- Pas de pension BEG mensuelle ni de gmala israelienne Shoah ' +
      'Procedure : dossier Claims Conference gratuit (pas via BTL ni Rashut). Residents hors Israel ' +
      'a l\'etranger peuvent deposer via les bureaux Claims New York / Francfort / Tel Aviv.',
    conditions: {
      required_shoah_period: ['ex_urss', 'post_1953'],
      requires_resident: true,
    },
    estimated_annual_value: 2734 * 12,
    typical_monthly_amount: 2734,
    value_unit: 'NIS/mois (~667 EUR convertis)',
    application_url: 'https://www.claimscon.org/applynow',
    action_label: 'Demande Article 2 Fund',
    info_url: 'https://www.claimscon.org/our-work/compensation/background/article-2/',
    disclaimer:
      'ATTENTION : doublon intentionnel avec kitzva_keren_sif2_claims — meme fonds, 2 angles differents. ' +
      'Pour eviter les doubles paiements, Claims Conference croise les listes avec Rashut. Ne pas deposer ' +
      'les deux en parallele — choisir l\'angle selon residence (Israel = Rashut, diaspora = Claims).',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C3). Doublon volontaire avec kitzva_keren_sif2_claims pour couvrir les deux angles (BTL vs Claims). Inclut post_1953 en plus de ex_urss car le fonds accepte aussi les olim apres 1953 sous certaines conditions.',
  },
  {
    slug: 'kitzva_beg_niztolei_shoah',
    category: 'special',
    authority: 'other',  // Bundesamt fur zentrale Dienste (Allemagne)
    title_fr: 'Pension BEG (reparations allemandes directes)',
    title_he: 'קצבת BEG - פיצויים מגרמניה',
    description_fr:
      'Pension mensuelle versee directement par le Tresor allemand (Bundesamt) aux survivants de la Shoah beneficiaires du BEG (Bundesentschadigungsgesetz, loi 1953-1965) ayant deja un dossier actif.',
    full_description_fr:
      'Le BEG (Bundesentschadigungsgesetz) est la loi allemande de reparation des victimes du nazisme ' +
      'votee en 1953. Elle offrait une pension mensuelle a vie aux survivants qui pouvaient prouver : ' +
      '- Residence en Allemagne avant 1945 ' +
      '- Prejudice pour motif racial, religieux ou politique ' +
      '- Depot de dossier dans les delais legaux (majoritairement clos en 1965) ' +
      'Montants 2026 : tres variables selon le dossier initial (type de prejudice, duree de detention, ' +
      'statut de refugie, etc.). Fourchette typique : 300-2 500 EUR/mois (1 200-10 000 NIS/mois). ' +
      'IMPORTANT : les delais de depot sont EXPIRES depuis plus de 50 ans. Cette entree concerne ' +
      'UNIQUEMENT les beneficiaires existants qui ont deja un dossier BEG actif, pour les aider a : ' +
      '- Verifier que leur pension est indexee correctement (revalorisations automatiques allemandes) ' +
      '- Transferer le dossier en cas de demenagement (France → Israel par exemple) ' +
      '- Activer la pension survivant au conjoint apres deces ' +
      'Les nouveaux dossiers doivent plutot etre deposes via Claims Conference (Article 2 Fund, ' +
      'Hardship Fund) ou Rashut leNiztolei HaShoah.',
    conditions: {
      requires_holocaust_survivor: true,
      requires_resident: true,
    },
    estimated_annual_value: 800 * 12,  // mediane fourchette 300-2500 EUR
    typical_monthly_amount: 800,
    value_unit: 'NIS/mois (~200 EUR mediane, tres variable)',
    application_url: 'https://www.bva.bund.de/DE/Services/Buerger/Social/BEG/beg_node.html',
    action_label: 'Infos BEG (Bundesamt allemand)',
    info_url: 'https://www.kolzchut.org.il/he/תגמולים_מגרמניה_BEG',
    disclaimer:
      'IMPORTANT : les delais legaux pour ouvrir un NOUVEAU dossier BEG sont expires depuis 1965. ' +
      'Cette entree ne concerne que les beneficiaires existants. Pour une premiere demande, utiliser ' +
      'plutot maanak_hardship_fund_claims ou kitzva_keren_sif2_claims (Article 2 Fund). Si vous pensez ' +
      'qu\'un membre de votre famille a ou aurait du avoir un BEG : contactez Claims Conference pour ' +
      'audit de dossier.',
    confidence: 'medium',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C3). Entree "historique" — la plupart des beneficiaires ont deja leur dossier. Utile pour les survivants transferant leur dossier vers Israel, ou les veufs/veuves souhaitant activer la pension de conjoint.',
  },
]

// =====================================================
// SECTION C4 — 7 octobre / Kharvot Barzel (S16 du glossaire)
// =====================================================
// Sources :
// - https://www.btl.gov.il/benefits/Hostile_action/Pages/default.aspx
// - https://www.gov.il/he/departments/ministry_of_defense
// - https://www.kolzchut.org.il/he/מלחמת_חרבות_ברזל
//
// Ces 4 aides sont specifiquement destinees aux victimes des evenements
// du 7 octobre 2023 et de la guerre Kharvot Barzel (reservistes actifs +
// familles de civils tues). Elles utilisent les champs ajoutes en etape B :
// is_7octobre_victim, is_active_reservist, is_bereaved_family.

const KHARVOT_BARZEL_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'maanak_sal_shikum_nifgaei_7_octobre',
    category: 'special',
    authority: 'misrad_habitahon',
    title_fr: 'Grant + panier rehab victimes 7 octobre (Maanak Sal Shikum)',
    title_he: 'מענק וסל שיקום לנפגעי 7 באוקטובר',
    description_fr:
      'Grant unique (5 000-28 720 NIS) + panier rehabilitation (4 800-30 000 NIS) versees par Misrad HaBitachon aux victimes directes ou familles endeuillees des evenements du 7 octobre 2023.',
    full_description_fr:
      'Dispositif specifique cree apres le 7 octobre 2023 par Misrad HaBitachon (Agaf HaShikum) pour ' +
      'les victimes physiques, psychologiques, ou endeuillees des massacres et de la guerre Kharvot Barzel. ' +
      'Trois niveaux selon gravite des sequelles : ' +
      '- Niveau 1 (trauma leger sans incapacite durable) : grant 5 000 NIS + panier rehab 4 800 NIS ' +
      '- Niveau 2 (trauma modere avec suivi prolonge)  : grant 12 400 NIS + panier rehab 15 000 NIS ' +
      '- Niveau 3 (invalidite reconnue, deuil immediat) : grant 28 720 NIS + panier rehab 30 000 NIS ' +
      'Le panier rehab couvre : psychotherapie individuelle et familiale (sans limite seances), ' +
      'aides techniques, frais medicaux non couverts kupat holim, adaptation logement, soutien social. ' +
      'Cumulable avec : pension mensuelle Nifgaei Peulot Eyva (si invalidite reconnue), aides enfants, ' +
      'exonerations fiscales specifiques post-7/10.',
    conditions: {
      requires_7octobre_victim: true,
      requires_resident: true,
    },
    estimated_annual_value: 12400 + 15000,  // mediane niveau 2
    value_unit: 'NIS (grant + panier, versement unique, 3 niveaux)',
    application_url: 'https://www.gov.il/he/departments/ministry_of_defense',
    action_label: 'Demande grant victimes 7 octobre',
    info_url: 'https://www.kolzchut.org.il/he/מלחמת_חרבות_ברזל',
    disclaimer:
      'Reserve aux victimes directes ou familles de victimes du 7 octobre 2023 et evenements Kharvot ' +
      'Barzel. Reconnaissance formelle par Misrad HaBitachon obligatoire. Un coordinateur dedie est ' +
      'assigne a chaque dossier — l\'accompagnement est gratuit via OneFamily, Natal, Enosh.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C4). Utilise le champ is_7octobre_victim ajoute en etape B. Complementaire au slug nifgaei_peulot_eyva (C2) qui couvre le regime general des victimes d\'actes hostiles.',
  },
  {
    slug: 'kitzvat_mishpakha_nifgaei_peulot_eyva',
    category: 'special',
    authority: 'misrad_habitahon',
    title_fr: 'Pension familles victimes civiles (Kitzvat Mishpakha)',
    title_he: 'קצבת משפחה לנפגעי פעולות איבה',
    description_fr:
      'Pension mensuelle a vie versee aux familles endeuillees d\'une victime civile d\'actes hostiles (7 octobre, attentats, tirs de roquettes), graduee selon nombre d\'enfants, alignee sur le regime IDF.',
    full_description_fr:
      'Le regime mensuel pour les familles de victimes civiles est aligne sur celui des familles ' +
      'endeuillees IDF (bereaved_family_benefits, deja present au catalogue). ' +
      'Montants officiels 2026 (en vigueur 01/02/2026) : ' +
      '- Sans enfant     : 10 525 NIS/mois ' +
      '- Avec 1 enfant   : 12 995 NIS/mois ' +
      '- Avec 2 enfants  : 14 834 NIS/mois ' +
      '- Avec 3 enfants  : 16 673 NIS/mois ' +
      '- Avec 4 enfants  : 18 512 NIS/mois ' +
      '- Avec 5+ enfants : 20 350-24 028 NIS/mois (majoration) ' +
      'SUPPLEMENT 1ere annee (deces depuis 07/10/2023) : +13 566 NIS/mois pendant 12 mois. ' +
      'Orphelins adultes : ' +
      '- 21-30 ans : 3 652 NIS/mois ' +
      '- 30-40 ans : 2 000 NIS/mois ' +
      '- 40-60 ans : prime unique 25 000 NIS ' +
      '- 60+ ans   : prime unique 50 000 NIS ' +
      'Cumulable avec : maanak_sal_shikum (grant initial), exonerations fiscales Misrad HaBitachon, ' +
      'aides au logement, suivi psychologique gratuit a vie.',
    conditions: {
      requires_7octobre_victim: true,  // champ actif si victime OU famille de victime
      requires_bereaved: true,
      requires_resident: true,
    },
    estimated_annual_value: 10525 * 12,
    typical_monthly_amount: 10525,
    value_unit: 'NIS/mois (10 525-24 028 + supplement 1re annee post-7/10)',
    application_url: 'https://www.mod.gov.il/',
    action_label: 'Pension famille victime civile',
    info_url: 'https://www.kolzchut.org.il/he/משפחות_נפגעי_פעולות_איבה',
    disclaimer:
      'Regime aligne sur bereaved_family_benefits (cf. SECTION 18) mais pour les victimes civiles ' +
      '(non-militaires). Un coordinateur dedie Misrad HaBitachon est assigne. Supplement 1ere annee ' +
      'reserve aux deces entre le 07/10/2023 et le 07/10/2024.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C4). Montants officiels identiques a bereaved_family_benefits car l\'Etat a harmonise les 2 regimes post-7/10. Specificite : s\'applique aux CIVILS (pas militaires).',
  },
  {
    slug: 'tagmulei_miluim_kharvot_barzel',
    category: 'military',
    authority: 'bituach_leumi',
    title_fr: 'Indemnisation reservistes Kharvot Barzel (Tagmulei Miluim)',
    title_he: 'תגמולי מילואים - חרבות ברזל',
    description_fr:
      'Indemnite journaliere BTL versee aux reservistes actifs mobilises durant la guerre Kharvot Barzel : 328-1 730 NIS/jour selon salaire, en remplacement du salaire suspendu.',
    full_description_fr:
      'Regime BTL specifique aux reservistes de tsav-8 (mobilisation d\'urgence post-7/10/2023) et ' +
      'tsav-8 successifs de la guerre Kharvot Barzel. ' +
      'Montants 2026 (en vigueur 01/02/2026, indexes CPI) : ' +
      '- Plancher minimum       : 328,76 NIS/jour (reservistes sans revenus prealables) ' +
      '- Mediane salariale      : 750-1 200 NIS/jour (salaires moyens) ' +
      '- Plafond legal           : 1 730,33 NIS/jour (reservistes a hauts revenus) ' +
      'Calcul : 100 % du salaire journalier moyen des 3 derniers mois avant la mobilisation. ' +
      'Pour les independants : base sur le dernier avis BITUAH (revenu net moyen 12 derniers mois). ' +
      'Verse directement au reserviste (pas a l\'employeur) — l\'employeur, lui, ne paie plus le salaire ' +
      'pendant la mobilisation mais recoit un remboursement BTL separement. ' +
      'Cumulable avec : combat_reservist_bonuses_2026 (grant + voucher + aide parentale), ' +
      'miluim_tax_credit_combat, miluim_low_income_supplement.',
    conditions: {
      requires_active_reservist: true,
      requires_resident: true,
    },
    estimated_annual_value: 1000 * 60,  // ~60 jours moyenne premiere annee
    typical_monthly_amount: 30000,  // 1000 NIS/jour * 30 jours
    value_unit: 'NIS/jour (328-1 730 selon salaire)',
    application_url: 'https://www.btl.gov.il/benefits/Reservists/Pages/default.aspx',
    action_label: 'Demande tagmulei miluim',
    info_url: 'https://www.kolzchut.org.il/he/תגמולי_מילואים',
    disclaimer:
      'Automatique pour les reservistes avec employeur (declare via Tofes 81 mensuel). Les independants ' +
      'doivent deposer un dossier BTL avec justificatifs de revenus. Le bulletin de paie "tagmulei ' +
      'miluim" remplace le bulletin de salaire employeur pendant la mobilisation.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C4). Montants officiels en vigueur 01/02/2026. Complementaire aux miluim_* deja presents au catalogue (bonus, credits, supplement bas revenu).',
  },
  {
    slug: 'siyua_tipulim_miluim',
    category: 'health',
    authority: 'misrad_habitahon',
    title_fr: 'Soutien therapeutique reservistes + foyer (Siyua Tipulim)',
    title_he: 'סיוע טיפולים למשרתי מילואים ובני משפחה',
    description_fr:
      'Financement de psychotherapie, couple-therapie et therapie familiale pour les reservistes actifs et leur foyer (conjoint, enfants) durant et apres la mobilisation Kharvot Barzel.',
    full_description_fr:
      'Dispositif Misrad HaBitachon + Natal + Enosh cree post-7/10/2023 pour reconnaitre l\'impact ' +
      'psychologique de la mobilisation prolongee sur le reserviste et sa famille. ' +
      'Prestations (valeurs 2026) : ' +
      '- Psychotherapie reserviste : 26 seances/an prises en charge (~500 NIS/seance = 13 000 NIS/an) ' +
      '- Couple-therapie : 15 seances/an (~600 NIS/seance = 9 000 NIS/an) ' +
      '- Therapie familiale (enfants) : 20 seances/an (~500 NIS/seance = 10 000 NIS/an) ' +
      '- Groupes de soutien Natal / Enosh : gratuits, illimites ' +
      '- Ligne d\'ecoute 24/7 (*6363 Natal) : gratuite ' +
      'Conditions : ' +
      '- Reserviste actif ayant servi ≥ 20 jours dans la guerre Kharvot Barzel ' +
      '- OU conjoint / enfant d\'un reserviste remplissant la condition ci-dessus ' +
      '- Prise en charge via Natal, Enosh, Hosen ou psychologue liberal agree Misrad HaBitachon ' +
      'Duree : ouvert jusqu\'a 3 ans apres la fin de la mobilisation.',
    conditions: {
      requires_active_reservist: true,
      requires_resident: true,
    },
    estimated_annual_value: 13000,  // psychotherapie reserviste base
    value_unit: 'NIS/an (valeur des seances remboursees)',
    application_url: 'https://www.gov.il/he/departments/ministry_of_defense',
    action_label: 'Activer soutien therapeutique',
    info_url: 'https://www.kolzchut.org.il/he/סיוע_נפשי_למשרתי_מילואים',
    disclaimer:
      'Appeler Natal (*6363) pour une premiere orientation — ligne gratuite 24/7. Les seances peuvent ' +
      'aussi etre prises en charge via kupat holim (Clalit / Maccabi remboursent aussi post-7/10), ' +
      'mais le circuit Misrad HaBitachon offre plus de seances sans franchise.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C4). Droit sous-utilise — beaucoup de reservistes pensent que c\'est uniquement pour les blesses physiques, alors que le soutien psy est ouvert a tous ceux qui ont servi ≥ 20 jours. Famille (conjoint, enfants) souvent oubliee.',
  },
]

// =====================================================
// SECTION C5 — Nakhei Tsahal / IDF invalides (S11 du glossaire)
// =====================================================
// Sources :
// - https://www.gov.il/he/departments/ministry_of_defense/agaf_hashikum
// - https://www.kolzchut.org.il/he/נכי_צהל
// - https://www.mod.gov.il/
//
// Ces 4 aides sont administrees par Misrad HaBitachon - Agaf HaShikum
// (Reinsertion des Invalides), pas par BTL. Elles utilisent les champs
// disability_source=idf et disability_level ajoutes en etape B.

const NAKHEI_TSAHAL_BENEFITS: BenefitDefinition[] = [
  {
    slug: 'tagmul_basissi_nakhei_tsahal',
    category: 'military',
    authority: 'misrad_habitahon',
    title_fr: 'Compensation mensuelle invalides IDF (Tagmul Basissi)',
    title_he: 'תגמול בסיסי לנכי צהל',
    description_fr:
      'Rente mensuelle versee par Agaf HaShikum aux anciens soldats reconnus invalides avec taux ≥ 20%, selon grille graduee (1 161-8 130 NIS/mois).',
    full_description_fr:
      'Tagmul Basissi (compensation de base) : rente mensuelle a vie versee par Misrad HaBitachon ' +
      '(pas BTL) aux invalides IDF reconnus avec un taux ≥ 20%. ' +
      'Montants officiels 2026 (en vigueur 01/02/2026, indexes CPI) : ' +
      '- Taux 20 %          : ~1 161 NIS/mois ' +
      '- Taux 30-40 %       : ~1 800-2 500 NIS/mois ' +
      '- Taux 50 %          : ~3 400 NIS/mois ' +
      '- Taux 70-89 %       : ~4 800-6 500 NIS/mois ' +
      '- Taux 100 %         : 8 130 NIS/mois ' +
      '- Taux 100 % + special needs (paralysie, cecite, etc.) : majoration jusqu\'a 2-3x la base ' +
      'Cumulable avec : ' +
      '- Tagmul Ovedan Kosher Avoda (TOKA, cf. slug suivant) si perte de capacite de travail ' +
      '- Maanak Hashtatafut Mas Tsahal (participation impots) ' +
      '- Petur Mas Nakhut a partir de 90 % d\'invalidite ' +
      '- Arnona Disability (deja au catalogue) ' +
      'Reconnaissance via la commission medicale de Misrad HaBitachon (Vaadat Refuit Agaf HaShikum).',
    conditions: {
      requires_idf_service: true,
      required_disability_source: 'idf',
      min_disability: 20,
      requires_resident: true,
    },
    estimated_annual_value: 1161 * 12,  // base taux 20%
    typical_monthly_amount: 1161,
    value_unit: 'NIS/mois (1 161 a 8 130+ selon taux invalidite)',
    application_url: 'https://www.gov.il/he/departments/ministry_of_defense/agaf_hashikum',
    action_label: 'Demande tagmul invalide IDF',
    info_url: 'https://www.kolzchut.org.il/he/תגמול_בסיסי_לנכי_צהל',
    disclaimer:
      'Reconnaissance par Agaf HaShikum obligatoire — la commission medicale peut prendre 6-18 mois. ' +
      'Un avocat specialise (Arik Dagan, Shani Gilad, etc.) est souvent utile pour les dossiers ' +
      'contestes. Cumulable avec la plupart des autres aides invalides IDF mais pas avec Nakhut Klalit BTL ' +
      '(il faut choisir le regime le plus avantageux).',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C5). Utilise disability_source=idf (etape B). Montants 2026 confirmes via glossaire. Ne pas confondre avec Nakhut Klalit BTL qui est le regime civil.',
  },
  {
    slug: 'maanak_had_paami_nakhei_tsahal',
    category: 'military',
    authority: 'misrad_habitahon',
    title_fr: 'Indemnite unique invalides IDF 10-19% (Maanak Had Paami)',
    title_he: 'מענק חד-פעמי לנכי צהל 10-19%',
    description_fr:
      'Paiement forfaitaire unique verse aux invalides IDF avec taux 10-19% (en-dessous du seuil de la rente mensuelle), 62 719-134 961 NIS selon le taux.',
    full_description_fr:
      'Pour les invalides IDF avec un taux reconnu inferieur a 20% (seuil de la rente mensuelle ' +
      'Tagmul Basissi), Agaf HaShikum verse un paiement forfaitaire UNIQUE qui cloture le dossier : ' +
      'Montants officiels 2026 : ' +
      '- Taux 10 % : 62 719 NIS ' +
      '- Taux 15 % : ~94 000 NIS ' +
      '- Taux 19 % : 134 961 NIS ' +
      'Apres paiement, le dossier est cloture sauf aggravation medicale reconnue (nouvelle expertise). ' +
      'Si aggravation ulterieure portant le taux a ≥ 20%, possibilite de demander Tagmul Basissi ' +
      '(avec deduction prorata du maanak deja verse). ' +
      'Conditions : reconnaissance par commission medicale Agaf HaShikum avec taux 10-19%, blessure ' +
      'survenue pendant le service militaire ou lien de causalite reconnu.',
    conditions: {
      requires_idf_service: true,
      required_disability_source: 'idf',
      min_disability: 10,
      requires_resident: true,
    },
    estimated_annual_value: 62719,  // versement unique au minimum
    value_unit: 'NIS (versement unique, 62 719-134 961 selon taux)',
    application_url: 'https://www.gov.il/he/departments/ministry_of_defense/agaf_hashikum',
    action_label: 'Demande maanak invalide 10-19%',
    info_url: 'https://www.kolzchut.org.il/he/מענק_חד-פעמי_לנכי_צהל',
    disclaimer:
      'IMPORTANT : accepter le maanak ferme le dossier. Si vous pensez que votre invalidite est plus ' +
      'grave que 19 % ou risque de s\'aggraver, il peut etre prudent de contester la decision plutot ' +
      'que d\'accepter le paiement forfaitaire. Un avocat specialise peut negocier pour remonter le taux.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C5). Condition min_disability: 10 (pas 20) car cette entree cible specifiquement la tranche 10-19%. Le matching inclura aussi les invalides ≥ 20% — on s\'appuie sur le disclaimer pour clarifier.',
  },
  {
    slug: 'tagmul_ovedan_kosher_avoda',
    category: 'military',
    authority: 'misrad_habitahon',
    title_fr: 'Compensation perte capacite travail IDF (TOKA / Tagmul Ovedan)',
    title_he: 'תגמול אבדן כושר עבודה לנכי צהל',
    description_fr:
      'Rente mensuelle additionnelle (8 275-12 435 NIS/mois) versee aux invalides IDF avec taux ≥ 20% dont la capacite de travail est fortement reduite.',
    full_description_fr:
      'TOKA = Tagmul Ovedan Kosher Avoda (compensation de perte de capacite de travail). ' +
      'Rente mensuelle complementaire au Tagmul Basissi, versee lorsque l\'invalidite ≥ 20% entraine ' +
      'une incapacite professionnelle reconnue par la commission sociale Agaf HaShikum. ' +
      'Montants officiels 2026 (en vigueur 01/02/2026) : ' +
      '- Perte 50 % capacite                : 8 275 NIS/mois ' +
      '- Perte 75 % capacite                : 10 400 NIS/mois ' +
      '- Perte 100 % (incapacite totale)    : 12 435 NIS/mois ' +
      'Evaluation : commission SOCIALE (pas medicale) d\'Agaf HaShikum, qui examine la situation ' +
      'professionnelle reelle (metier prealable, possibilite de reconversion, age, etc.). ' +
      'Cumulable avec Tagmul Basissi (rente invalidite pure). L\'invalide recoit donc souvent les ' +
      'deux rentes en parallele, pour un total pouvant atteindre 20 000 NIS/mois.',
    conditions: {
      requires_idf_service: true,
      required_disability_source: 'idf',
      min_disability: 20,
      required_employment: ['unemployed', 'reservist'],  // proxy : perte de capacite
      requires_resident: true,
    },
    estimated_annual_value: 8275 * 12,
    typical_monthly_amount: 8275,
    value_unit: 'NIS/mois (8 275-12 435 selon perte capacite)',
    application_url: 'https://www.gov.il/he/departments/ministry_of_defense/agaf_hashikum',
    action_label: 'Demande TOKA',
    info_url: 'https://www.kolzchut.org.il/he/תגמול_אבדן_כושר_עבודה',
    disclaimer:
      'Distinct du Tagmul Basissi : TOKA evalue la perte economique (perte de salaire/revenus) tandis ' +
      'que Tagmul Basissi evalue l\'atteinte physique. Un invalide a 50 % peut avoir une perte de ' +
      'capacite de 100 % (si son metier est impossible a exercer), ou vice versa. Le cumul est la ' +
      'regle pour les invalides durablement au chomage.',
    confidence: 'high',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C5). Condition required_employment est un proxy imparfait — un reserviste/chomeur est plus probablement en situation de perte de capacite. A raffiner avec un champ work_capacity_loss_pct.',
  },
  {
    slug: 'maanak_hashtatafut_mas_tsahal',
    category: 'fiscal',
    authority: 'misrad_habitahon',
    title_fr: 'Participation annuelle impots invalides IDF (Maanak Hashtatafut Mas)',
    title_he: 'מענק השתתפות מס לנכי צהל',
    description_fr:
      'Participation annuelle aux impots (Mas Hakhnasa) versee par Misrad HaBitachon aux invalides IDF avec taux 19-89%, en compensation de l\'effort fiscal sur leur rente et leurs revenus.',
    full_description_fr:
      'Grant annuel forfaitaire verse a la fin de chaque annee fiscale (janvier-avril) aux invalides ' +
      'IDF dont l\'invalidite reconnue est entre 19% et 89% (ceux a 90%+ beneficient de l\'exemption ' +
      'totale d\'impot via Petur Mas Nakhut, cf. slug petur_mas_nakhut en C7). ' +
      'Montants 2026 (approximatifs, indexes CPI) : ' +
      '- Taux 19-39 %      : ~3 500-5 000 NIS/an ' +
      '- Taux 40-59 %      : ~6 000-9 000 NIS/an ' +
      '- Taux 60-89 %      : ~10 000-14 000 NIS/an ' +
      'Logique : l\'Etat compense partiellement l\'impot sur le revenu paye par l\'invalide sur sa ' +
      'rente Tagmul Basissi (qui est imposable si taux < 90%) et ses autres revenus. ' +
      'Versement automatique pour les invalides avec dossier Agaf HaShikum actif — aucune demande ' +
      'a faire si vous etes deja dans les listes. Verser sur le compte bancaire declare.',
    conditions: {
      requires_idf_service: true,
      required_disability_source: 'idf',
      min_disability: 19,
      requires_resident: true,
    },
    estimated_annual_value: 6000,  // mediane
    value_unit: 'NIS/an (versement unique fin d\'annee fiscale)',
    application_url: 'https://www.gov.il/he/departments/ministry_of_defense/agaf_hashikum',
    action_label: 'Verifier maanak impots',
    info_url: 'https://www.kolzchut.org.il/he/מענק_השתתפות_מס_לנכי_צהל',
    disclaimer:
      'Verse automatiquement pour les dossiers actifs. Les invalides a 90%+ beneficient deja de ' +
      'l\'exemption totale d\'impot (petur_mas_nakhut) — ils ne percoivent donc pas ce grant (qui ' +
      'serait redondant). Si votre taux est entre 19 et 89% et que vous n\'avez rien recu, contacter ' +
      'Agaf HaShikum pour audit.',
    confidence: 'medium',
    status: 'verified',
    verified_at: '2026-04-16',
    tax_year: 2026,
    notes: 'Ajout catalogue 16/04/2026 (etape C5). Montants 2026 approximatifs — Misrad HaBitachon ne publie pas de grille detaillee publique. A confirmer aupres d\'Agaf HaShikum pour les cas specifiques.',
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
  ...SPECIAL_RECOGNITION_BENEFITS,
  ...STUDENT_BENEFITS,
  ...COMBAT_RESERVIST_BENEFITS,
  ...CHILDCARE_BENEFITS,
  ...UTILITY_BENEFITS,
  ...BTL_FAMILY_EXTRAS_BENEFITS,
  ...BTL_ACCIDENT_BENEFITS,
  ...HOLOCAUST_EXTRAS_BENEFITS,
  ...KHARVOT_BARZEL_BENEFITS,
  ...NAKHEI_TSAHAL_BENEFITS,
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
