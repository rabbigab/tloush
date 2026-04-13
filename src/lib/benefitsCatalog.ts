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
// Registre principal (rempli dans les sections 2-20)
// =====================================================
export const BENEFITS_CATALOG: BenefitDefinition[] = [
  ...KITSBAT_YELADIM_BENEFITS,
]
