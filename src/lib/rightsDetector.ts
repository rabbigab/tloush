// =====================================================
// Automatic rights detector — MVP 10 regles a forte confiance
// =====================================================
// Scanne le profil utilisateur + documents pour detecter les droits
// non reclames. Focus sur les droits a FORTE CONFIANCE uniquement,
// pour eviter les faux positifs qui feraient perdre la confiance.

import type { UserProfile } from '@/types/userProfile'

export interface DetectedRight {
  slug: string
  title_fr: string
  description_fr: string
  authority: string
  category: 'fiscal' | 'family' | 'employment' | 'housing' | 'health' | 'retirement'
  confidence_score: number  // 0.0 - 1.0
  confidence_level: 'high' | 'medium' | 'low'
  estimated_value: number | null
  value_unit: string
  source: 'profile' | 'document' | 'cross_ref'
  source_doc_id?: string
  action_url: string
  action_label: string
  disclaimer: string
}

interface DocumentLite {
  id: string
  document_type: string
  analysis_data: Record<string, unknown> | null
  period: string | null
  created_at: string
}

interface ScanContext {
  profile: UserProfile
  documents: DocumentLite[]
  now: Date
}

// =====================================================
// REGLE 1 : Points de credit oleh hadash non utilises
// =====================================================
// SCHEDULE OFFICIEL 2022+ (reforme de la loi)
// Source : https://www.kolzchut.org.il/en/Income_Tax_Credit_Points_for_New_Immigrants
//
// Annee 0 (mois 1-12)  : 1 pt/mois = 12 pts cumules → 1 pt annuel moyen
// Annee 1 (mois 13-24) : 3 pts/mois = 36 pts cumules → 3 pts annuel
// Annee 2 (mois 25-36) : 6×3 + 6×2 = 30 pts → 2.5 pts annuel
// Annee 3 (mois 37-48) : 6×2 + 6×1 = 18 pts → 1.5 pts annuel
// Annee 4 (mois 49-54) : 6×1 = 6 pts → 0.5 pt annuel (derniers 6 mois)
// Total : 4.5 ans
function computeOlehAnnualBonus(yearsSinceAliyah: number): number {
  if (yearsSinceAliyah === 0) return 1
  if (yearsSinceAliyah === 1) return 3
  if (yearsSinceAliyah === 2) return 2.5
  if (yearsSinceAliyah === 3) return 1.5
  if (yearsSinceAliyah === 4) return 0.5
  return 0
}

function detectOlehCreditPoints(ctx: ScanContext): DetectedRight | null {
  if (!ctx.profile.aliyah_year) return null

  const yearsSinceAliyah = ctx.now.getFullYear() - ctx.profile.aliyah_year
  if (yearsSinceAliyah < 0 || yearsSinceAliyah > 4) return null

  const bonusPoints = computeOlehAnnualBonus(yearsSinceAliyah)
  if (bonusPoints === 0) return null

  const annualValue = bonusPoints * 2904  // 2904 NIS/an par point

  return {
    slug: 'oleh_credit_points',
    title_fr: `Points de credit Oleh Hadash (~${bonusPoints} pts/an)`,
    description_fr: `En tant qu'oleh hadash (annee ${yearsSinceAliyah + 1} d'alyah), vous beneficiez de points de credit fiscal supplementaires selon la loi reformee en 2022 (total 4.5 ans d'avantages). Cette annee : environ ${bonusPoints} point(s) annuel(s). Verifiez que votre employeur les applique sur votre tofes 101.`,
    authority: 'Rashut HaMisim',
    category: 'fiscal',
    confidence_score: 0.90,
    confidence_level: 'high',
    estimated_value: annualValue,
    value_unit: 'NIS/an',
    source: 'profile',
    action_url: 'https://www.gov.il/he/departments/israel_tax_authority',
    action_label: 'Verifier le formulaire 101',
    disclaimer: 'Schedule officiel 2022+ : les points sont mensualises et varient mois par mois. L\'equivalent annuel indique est une moyenne. Demandez a votre employeur de verifier votre tofes 101 avec un yoetz mas.',
  }
}

// =====================================================
// REGLE 2 : Parent isole avec enfants
// =====================================================
function detectSingleParentBonus(ctx: ScanContext): DetectedRight | null {
  const p = ctx.profile
  const isSingleParent =
    (p.marital_status === 'divorced' || p.marital_status === 'widowed' || p.marital_status === 'separated') &&
    p.children_count && p.children_count > 0

  if (!isSingleParent) return null

  return {
    slug: 'single_parent_credit_points',
    title_fr: '1 point de credit supplementaire (parent isole)',
    description_fr: `En tant que parent isole (${p.marital_status === 'divorced' ? 'divorce(e)' : p.marital_status === 'widowed' ? 'veuf/veuve' : 'separe(e)'}) avec ${p.children_count} enfant(s), vous avez droit a 1 point de credit fiscal supplementaire.`,
    authority: 'Rashut HaMisim',
    category: 'fiscal',
    confidence_score: 0.90,
    confidence_level: 'high',
    estimated_value: 2904,
    value_unit: 'NIS/an',
    source: 'profile',
    action_url: 'https://www.gov.il/he/service/request_refund_from_tax_authorities',
    action_label: 'Demande remboursement',
    disclaimer: 'Valable sous conditions. Verifiez avec un yoetz mas.',
  }
}

// =====================================================
// REGLE 3 : Enfants de moins de 5 ans
// =====================================================
function detectYoungChildrenPoints(ctx: ScanContext): DetectedRight | null {
  const p = ctx.profile
  if (!p.children_count || p.children_count === 0) return null

  // Si pas de dates de naissance, on ne peut pas etre sur
  if (!p.children_birth_dates || p.children_birth_dates.length === 0) return null

  const youngChildren = p.children_birth_dates.filter(d => {
    const age = ctx.now.getFullYear() - new Date(d).getFullYear()
    return age >= 0 && age <= 5
  })

  if (youngChildren.length === 0) return null

  const bonusPoints = youngChildren.length * 1.5
  const annualValue = bonusPoints * 2904

  return {
    slug: 'young_children_credit_points',
    title_fr: `${bonusPoints} points de credit pour enfants < 5 ans`,
    description_fr: `Vous avez ${youngChildren.length} enfant(s) de moins de 5 ans. Cela vous donne droit a ${bonusPoints} points de credit fiscal.`,
    authority: 'Rashut HaMisim',
    category: 'family',
    confidence_score: 0.90,
    confidence_level: 'high',
    estimated_value: annualValue,
    value_unit: 'NIS/an',
    source: 'profile',
    action_url: 'https://www.gov.il/he/departments/israel_tax_authority',
    action_label: 'Mettre a jour le tofes 101',
    disclaimer: 'Verifiez que votre employeur a bien inclus ces points.',
  }
}

// =====================================================
// REGLE 4 : Allocation enfants (kitsbat yeladim)
// =====================================================
// Montants 2025 officiels Bituach Leumi (geles au niveau 2024) :
// - Enfant 1 : 169 NIS/mois
// - Enfants 2 a 4 : 215 NIS/mois chacun
// - Enfant 5+ : 169 NIS/mois (le tarif retombe !)
// + 57 NIS dans le compte "Chisachon LeKol Yeled" (epargne separee)
// Source : https://www.btl.gov.il/benefits/children/Pages/שיעורי%20הקצבה.aspx
function computeChildAllowance(childrenCount: number): number {
  if (childrenCount === 0) return 0
  if (childrenCount === 1) return 169
  if (childrenCount <= 4) {
    // enfant 1 : 169, enfants 2-4 : 215 chacun
    return 169 + (childrenCount - 1) * 215
  }
  // enfant 1 : 169, enfants 2-4 : 215 × 3 = 645, enfants 5+ : 169 chacun
  return 169 + 645 + (childrenCount - 4) * 169
}

function detectKitsbatYeladim(ctx: ScanContext): DetectedRight | null {
  const p = ctx.profile
  if (!p.children_count || p.children_count === 0) return null

  const monthlyTotal = computeChildAllowance(p.children_count)

  return {
    slug: 'kitsbat_yeladim',
    title_fr: `Allocation enfants (Kitsbat Yeladim)`,
    description_fr: `En tant que parent de ${p.children_count} enfant(s) resident en Israel, vous avez droit a l'allocation familiale de Bituach Leumi. Montant mensuel estime : ${monthlyTotal} NIS (baremes BL 2025).`,
    authority: 'Bituach Leumi',
    category: 'family',
    confidence_score: 0.85,
    confidence_level: 'high',
    estimated_value: monthlyTotal * 12,
    value_unit: 'NIS/an',
    source: 'profile',
    action_url: 'https://www.btl.gov.il/benefits/children/',
    action_label: 'Demande allocation enfants',
    disclaimer: 'Montants bases sur les baremes BL 2025. Les allocations sont normalement automatiques mais peuvent necessiter une mise a jour pour les olim recents. Verifiez avec votre espace personnel BL.',
  }
}

// =====================================================
// REGLE 5 : Miluim non rembourse
// =====================================================
async function detectMiluimNonReimbursed(ctx: ScanContext, supabase?: unknown): Promise<DetectedRight | null> {
  if (ctx.profile.employment_status !== 'reservist' && ctx.profile.employment_status !== 'employed') return null

  // On verifie s'il y a des periodes de miluim non remboursees
  // (necessite un query sur miluim_periods)
  // Pour le MVP, on skip cette detection si on n'a pas acces au client
  return null
}

// =====================================================
// REGLE 6 : Remboursement mas hachnasa (points non utilises)
// =====================================================
function detectMasRefundPotential(ctx: ScanContext): DetectedRight | null {
  // On cherche un tofes 106 ou une fiche de paie recente pour estimer
  // les points de credit utilises vs eligibles
  const payslips = ctx.documents.filter(d => d.document_type === 'payslip')
  if (payslips.length === 0) return null

  // Points eligibles de base (resident) + oleh bonus + femme + enfants
  let eligiblePoints = 2.25  // base
  if (ctx.profile.aliyah_year) {
    const years = ctx.now.getFullYear() - ctx.profile.aliyah_year
    if (years === 0) eligiblePoints += 3
    else if (years === 1) eligiblePoints += 2
    else if (years === 2) eligiblePoints += 1
  }
  if (ctx.profile.children_birth_dates?.length) {
    for (const d of ctx.profile.children_birth_dates) {
      const age = ctx.now.getFullYear() - new Date(d).getFullYear()
      if (age >= 0 && age <= 5) eligiblePoints += 1.5
      else if (age <= 17) eligiblePoints += 1
    }
  }
  if (
    (ctx.profile.marital_status === 'divorced' ||
      ctx.profile.marital_status === 'widowed' ||
      ctx.profile.marital_status === 'separated') &&
    ctx.profile.children_count
  ) {
    eligiblePoints += 1
  }

  // Les points typiques sur une fiche de paie : 2.25 (minimum)
  // Si l'utilisateur a droit a plus, il y a potentiellement un remboursement
  if (eligiblePoints <= 2.25) return null

  const missingPoints = eligiblePoints - 2.25
  const annualValue = missingPoints * 2904

  return {
    slug: 'mas_hachnasa_refund',
    title_fr: 'Remboursement d\'impot potentiel',
    description_fr: `Votre profil indique que vous avez droit a ${eligiblePoints} points de credit, mais les fiches de paie standard n'en utilisent que 2.25. Vous pourriez recuperer environ ${Math.round(annualValue).toLocaleString('fr-IL')} NIS par annee fiscale.`,
    authority: 'Rashut HaMisim',
    category: 'fiscal',
    confidence_score: 0.85,
    confidence_level: 'high',
    estimated_value: annualValue,
    value_unit: 'NIS/an',
    source: 'cross_ref',
    source_doc_id: payslips[0]?.id,
    action_url: '/tax-refund',
    action_label: 'Utiliser l\'estimateur',
    disclaimer: 'Estimation indicative. Utilisez l\'estimateur de remboursement pour un calcul precis.',
  }
}

// =====================================================
// REGLE 7 : Convalescence (dmei havraa) absente
// =====================================================
// Extension Order (secteur prive) — table officielle :
//   Annee 1       : 5 jours
//   Annees 2-3    : 6 jours
//   Annees 4-10   : 7 jours
//   Annees 11-15  : 8 jours
//   Annees 16-19  : 9 jours
//   Annees 20+    : 10 jours
// Tarif 2025 : 418 NIS/jour (prive)
//
// ATTENTION : "Loi de gel et reduction de havraa 5785-2025" :
// En 2025, tous les employeurs doivent DEDUIRE 1 jour de havraa
// pour financer les benefices miluim. Un employe annee 1 en 2025 doit
// donc recevoir 4 × 418 = 1 672 NIS (pas 5 × 418 = 2 090).
// Cette reduction devrait prendre fin en 2026 — a verifier.
// Source : https://www.nevo.co.il/law_html/law00/234284.htm
function getHavraaDays(seniorityYears: number, year: number): number {
  let base: number
  if (seniorityYears < 1) base = 0
  else if (seniorityYears === 1) base = 5
  else if (seniorityYears <= 3) base = 6
  else if (seniorityYears <= 10) base = 7
  else if (seniorityYears <= 15) base = 8
  else if (seniorityYears <= 19) base = 9
  else base = 10

  // Gel 2025 : -1 jour obligatoire
  if (year === 2025 && base > 0) base -= 1
  return base
}

function detectMissingHavraa(ctx: ScanContext): DetectedRight | null {
  if (ctx.profile.employment_status !== 'employed') return null

  // On regarde les fiches de paie recentes pour voir s'il y a la ligne havraa
  const recentPayslips = ctx.documents
    .filter(d => d.document_type === 'payslip')
    .slice(0, 3)

  if (recentPayslips.length === 0) return null

  const hasHavraa = recentPayslips.some(p => {
    const details = (p.analysis_data?.payslip_details as Record<string, unknown>) || {}
    return Number(details.convalescence_amount) > 0 || Number(details.convalescence_days) > 0
  })

  if (hasHavraa) return null

  const currentYear = ctx.now.getFullYear()
  const minDays = getHavraaDays(1, currentYear)  // cas minimum : annee 1
  const estimatedValue = minDays * 418

  return {
    slug: 'havraa_missing',
    title_fr: 'Convalescence (dmei havraa) absente',
    description_fr: `Vos fiches de paie recentes ne mentionnent pas la prime de convalescence (dmei havraa). Apres 1 an d'anciennete, elle est obligatoire : ${minDays} a 10 jours/an selon anciennete × ~418 NIS/jour (prive).${currentYear === 2025 ? ' Note : loi de gel 2025 retire 1 jour pour financer le miluim.' : ''}`,
    authority: 'Extension Order (droit du travail israelien)',
    category: 'employment',
    confidence_score: 0.70,
    confidence_level: 'medium',
    estimated_value: estimatedValue,
    value_unit: 'NIS/an',
    source: 'document',
    source_doc_id: recentPayslips[0]?.id,
    action_url: '/rights-check',
    action_label: 'Verifier mes droits',
    disclaimer: 'Due apres 1 an de travail chez le meme employeur. Table : 5-6-7-7-8-9-10 jours selon anciennete. Tarif prive 418 NIS/jour (2025), public ~470 NIS/jour.',
  }
}

// =====================================================
// REGLE 8 : Pension employeur absente ou insuffisante (Section 14)
// =====================================================
// Extension Order "Pensia Chova" 2008 :
// - 6% employe + 6.5% employeur (tagmulim) + pitzuim employeur
// - Pitzuim MINIMUM = 6%, mais la Section 14 du Severance Pay Law demande
//   8.33% pour liberer l'employeur de toute obligation complementaire au
//   moment du licenciement. Tout ce qui est sous 8.33% cree un "gap" que
//   l'employe devra reclamer separement → gros manque a gagner silencieux.
// - Si l'employe avait deja une pension active en entrant → obligation
//   des le JOUR 1 (avec back-pay depuis le 4e mois), pas 6 mois.
function detectMissingPension(ctx: ScanContext): DetectedRight | null {
  if (ctx.profile.employment_status !== 'employed') return null

  const recentPayslips = ctx.documents
    .filter(d => d.document_type === 'payslip')
    .slice(0, 3)

  if (recentPayslips.length === 0) return null

  const hasPension = recentPayslips.some(p => {
    const details = (p.analysis_data?.payslip_details as Record<string, unknown>) || {}
    return Number(details.pension_employee) > 0
  })

  if (hasPension) return null

  return {
    slug: 'pension_missing',
    title_fr: 'Cotisation retraite manquante',
    description_fr: 'Vos fiches de paie recentes ne montrent pas de cotisation retraite (keren pensia). Elle est obligatoire : 6% salarie + 6.5% employeur + 6% (minimum) ou 8.33% (Section 14) pitzuim employeur. Sans Section 14 a 8.33%, vous accumulez un "gap" de severance non finance.',
    authority: 'Droit du travail israelien',
    category: 'retirement',
    confidence_score: 0.75,
    confidence_level: 'medium',
    estimated_value: null,
    value_unit: 'NIS/mois',
    source: 'document',
    source_doc_id: recentPayslips[0]?.id,
    action_url: '/rights-check',
    action_label: 'En savoir plus',
    disclaimer: 'Regles : apres 6 mois d\'anciennete par defaut, ou des le 1er jour si vous aviez deja une pension active. Exigez Section 14 (8.33%) dans votre contrat pour eviter les gaps de severance.',
  }
}

// =====================================================
// REGLE 9 : Freelance debut activite (exemption BL)
// =====================================================
function detectFreelanceBLExemption(ctx: ScanContext): DetectedRight | null {
  if (ctx.profile.employment_status !== 'self_employed') return null

  return {
    slug: 'freelance_bl_exemption',
    title_fr: 'Exemption BL pour freelance debut activite',
    description_fr: 'Les independants dont le revenu est faible (en dessous du plafond exempte) peuvent beneficier d\'une exemption partielle de Bituach Leumi. Verifiez votre categorie BL.',
    authority: 'Bituach Leumi',
    category: 'fiscal',
    confidence_score: 0.60,
    confidence_level: 'medium',
    estimated_value: null,
    value_unit: 'variable',
    source: 'profile',
    action_url: 'https://www.btl.gov.il/',
    action_label: 'Mon espace BL',
    disclaimer: 'Depend du revenu annuel. Consultez un comptable pour optimiser.',
  }
}

// =====================================================
// REGLE 10 : Invalidite reconnue
// =====================================================
function detectDisabilityRights(ctx: ScanContext): DetectedRight | null {
  if (!ctx.profile.disability_level || ctx.profile.disability_level < 20) return null

  const level = ctx.profile.disability_level

  return {
    slug: 'disability_benefits',
    title_fr: `Droits lies au taux d'invalidite ${level}%`,
    description_fr: `Avec un taux d'invalidite reconnu de ${level}%, vous avez potentiellement droit a : allocation d'invalidite BL, exemption partielle Arnona, reduction de l'impot sur le revenu, aides specifiques.`,
    authority: 'Bituach Leumi / Rashut HaMisim',
    category: 'health',
    confidence_score: level >= 40 ? 0.85 : 0.70,
    confidence_level: level >= 40 ? 'high' : 'medium',
    estimated_value: null,
    value_unit: 'variable',
    source: 'profile',
    action_url: 'https://www.btl.gov.il/benefits/Disability/',
    action_label: 'Voir les droits BL invalidite',
    disclaimer: 'Les droits varient selon le taux et la nature de l\'invalidite. Un travailleur social BL peut vous guider.',
  }
}

// =====================================================
// Main: scan function
// =====================================================
export function scanUserRights(
  profile: UserProfile,
  documents: DocumentLite[]
): DetectedRight[] {
  const ctx: ScanContext = {
    profile,
    documents,
    now: new Date(),
  }

  const detections: (DetectedRight | null)[] = [
    detectOlehCreditPoints(ctx),
    detectSingleParentBonus(ctx),
    detectYoungChildrenPoints(ctx),
    detectKitsbatYeladim(ctx),
    detectMasRefundPotential(ctx),
    detectMissingHavraa(ctx),
    detectMissingPension(ctx),
    detectFreelanceBLExemption(ctx),
    detectDisabilityRights(ctx),
  ]

  return detections.filter((d): d is DetectedRight => d !== null)
}
