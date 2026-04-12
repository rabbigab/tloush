// =====================================================
// Legal Watch — Systeme de veille legale automatique
// =====================================================
// Suit les sources officielles israeliennes pour detecter
// les changements de baremes et alerter l'admin.
//
// Source de verite : chaque constante legale a un metadata avec
// sa source officielle et sa date de derniere verification.

export interface LegalSource {
  id: string
  name: string
  url: string
  category: 'tax' | 'bl' | 'labor' | 'immigration' | 'general'
  check_method: 'manual' | 'pattern' | 'api'
  /** Patterns a chercher pour detecter si la page a change */
  patterns_to_check?: string[]
  /** Derniere date de verification manuelle */
  last_verified_at?: string
}

export interface LegalConstant {
  id: string
  name: string
  value: number | string
  unit: string
  source_id: string
  source_url: string
  verified_at: string
  verified_by: 'audit' | 'web_search' | 'manual'
  confidence: 'high' | 'medium' | 'low'
  tax_year?: number
  notes?: string
}

// =====================================================
// REGISTRE DES SOURCES OFFICIELLES
// =====================================================
export const LEGAL_SOURCES: Record<string, LegalSource> = {
  btl_children: {
    id: 'btl_children',
    name: 'Bituach Leumi — Kitsbat Yeladim',
    url: 'https://www.btl.gov.il/benefits/children/Pages/שיעורי%20הקצבה.aspx',
    category: 'bl',
    check_method: 'pattern',
    patterns_to_check: ['173', '219'],
  },
  btl_miluim: {
    id: 'btl_miluim',
    name: 'Bituach Leumi — Tagmulei Miluim',
    url: 'https://www.btl.gov.il/benefits/Reserve_Service/Pages/שיעורי%20הקצבה.aspx',
    category: 'bl',
    check_method: 'pattern',
    patterns_to_check: ['1730.33', '328.76'],
  },
  btl_rates_2026: {
    id: 'btl_rates_2026',
    name: 'Bituach Leumi — Rates 2026',
    url: 'https://www.btl.gov.il/About/news/Pages/hadasaidkonkitzva2026.aspx',
    category: 'bl',
    check_method: 'manual',
  },
  tax_authority: {
    id: 'tax_authority',
    name: 'Rashut HaMisim — Israel Tax Authority',
    url: 'https://www.gov.il/he/departments/israel_tax_authority',
    category: 'tax',
    check_method: 'manual',
  },
  kolzchut_credit_points: {
    id: 'kolzchut_credit_points',
    name: 'Kol-Zchut — Nekudot Zikui',
    url: 'https://www.kolzchut.org.il/he/נקודות_זיכוי_ממס_הכנסה',
    category: 'tax',
    check_method: 'pattern',
    patterns_to_check: ['2.25', '242'],
  },
  kolzchut_oleh: {
    id: 'kolzchut_oleh',
    name: 'Kol-Zchut — Oleh Hadash Credit Points',
    url: 'https://www.kolzchut.org.il/en/Income_Tax_Credit_Points_for_New_Immigrants',
    category: 'immigration',
    check_method: 'manual',
  },
  kolzchut_havraa: {
    id: 'kolzchut_havraa',
    name: 'Kol-Zchut — Dmei Havraa',
    url: 'https://www.kolzchut.org.il/he/דמי_הבראה',
    category: 'labor',
    check_method: 'pattern',
    patterns_to_check: ['418'],
  },
  nevo_havraa_freeze: {
    id: 'nevo_havraa_freeze',
    name: 'Nevo — Loi de gel havraa 5785-2025',
    url: 'https://www.nevo.co.il/law_html/law00/234284.htm',
    category: 'labor',
    check_method: 'manual',
  },
  gov_olim_2026: {
    id: 'gov_olim_2026',
    name: 'Gov.il — Tax reforms for new olim 2026',
    url: 'https://www.gov.il/en/pages/tax-reforms-for-new-olim',
    category: 'immigration',
    check_method: 'manual',
  },
}

// =====================================================
// REGISTRE DES CONSTANTES LEGALES TRACKEES
// =====================================================
// Chaque constante a une reference a sa source + date de verif.
// Quand on update une valeur, on update verified_at.
export const LEGAL_CONSTANTS: LegalConstant[] = [
  // --- Bituach Leumi — Kitsbat Yeladim 2026 ---
  {
    id: 'kitsbat_child_1_2026',
    name: 'Allocation enfants - 1er enfant 2026',
    value: 173,
    unit: 'NIS/mois',
    source_id: 'btl_children',
    source_url: 'https://www.btl.gov.il/About/news/Pages/hadasaidkonkitzva2026.aspx',
    verified_at: '2026-04-12',
    verified_by: 'web_search',
    confidence: 'high',
    tax_year: 2026,
  },
  {
    id: 'kitsbat_child_2_4_2026',
    name: 'Allocation enfants - 2e-4e enfant 2026',
    value: 219,
    unit: 'NIS/mois',
    source_id: 'btl_children',
    source_url: 'https://www.btl.gov.il/About/news/Pages/hadasaidkonkitzva2026.aspx',
    verified_at: '2026-04-12',
    verified_by: 'web_search',
    confidence: 'high',
    tax_year: 2026,
  },

  // --- Bituach Leumi — Miluim 2026 ---
  {
    id: 'miluim_daily_max_2026',
    name: 'Miluim plafond journalier 2026',
    value: 1730.33,
    unit: 'NIS/jour',
    source_id: 'btl_miluim',
    source_url: 'https://www.btl.gov.il/benefits/Reserve_Service/',
    verified_at: '2026-04-12',
    verified_by: 'web_search',
    confidence: 'high',
    tax_year: 2026,
    notes: 'Confirme via recherche web avril 2026',
  },
  {
    id: 'miluim_daily_min_2026',
    name: 'Miluim plancher journalier 2026',
    value: 328.76,
    unit: 'NIS/jour',
    source_id: 'btl_miluim',
    source_url: 'https://www.btl.gov.il/benefits/Reserve_Service/',
    verified_at: '2026-04-12',
    verified_by: 'web_search',
    confidence: 'high',
    tax_year: 2026,
  },

  // --- Tax Authority — Credit points ---
  {
    id: 'credit_point_value',
    name: 'Valeur d\'un point de credit',
    value: 242,
    unit: 'NIS/mois',
    source_id: 'kolzchut_credit_points',
    source_url: 'https://www.kolzchut.org.il/he/נקודות_זיכוי_ממס_הכנסה',
    verified_at: '2026-04-12',
    verified_by: 'web_search',
    confidence: 'high',
    tax_year: 2025,
    notes: 'Probablement gele 2025-2026 (loi de gel)',
  },
  {
    id: 'credit_point_resident_base',
    name: 'Points de credit resident israelien',
    value: 2.25,
    unit: 'points',
    source_id: 'kolzchut_credit_points',
    source_url: 'https://www.kolzchut.org.il/he/נקודות_זיכוי_ממס_הכנסה',
    verified_at: '2026-04-12',
    verified_by: 'audit',
    confidence: 'high',
  },

  // --- Labor — Havraa ---
  {
    id: 'havraa_daily_rate_private_2025',
    name: 'Tarif journalier havraa secteur prive',
    value: 418,
    unit: 'NIS/jour',
    source_id: 'kolzchut_havraa',
    source_url: 'https://www.kolzchut.org.il/he/דמי_הבראה',
    verified_at: '2026-04-12',
    verified_by: 'web_search',
    confidence: 'high',
    tax_year: 2025,
    notes: 'Gele 2024-2025. Confirmer 2026 debut de l\'annee.',
  },

  // --- Immigration — Exemption 2026 ---
  {
    id: 'oleh_2026_full_exemption',
    name: 'Exemption totale olim 2026',
    value: 'Taux 0% 2026-2027, puis 10/20/30% 2028-2030',
    unit: 'taux',
    source_id: 'gov_olim_2026',
    source_url: 'https://www.gov.il/en/pages/tax-reforms-for-new-olim',
    verified_at: '2026-04-12',
    verified_by: 'web_search',
    confidence: 'high',
    tax_year: 2026,
    notes: 'Nouvelle loi fin 2025, applicable aux olim arrivant en 2026 uniquement. Plafond 1M NIS/an.',
  },
]

// =====================================================
// Detection des constantes perimees
// =====================================================
/**
 * Retourne les constantes qui n'ont pas ete verifiees depuis X jours.
 * Utilise par le cron pour alerter l'admin.
 */
export function getStaleConstants(maxAgeDays: number = 90): LegalConstant[] {
  const now = new Date()
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - maxAgeDays)

  return LEGAL_CONSTANTS.filter(c => {
    const verifiedAt = new Date(c.verified_at)
    return verifiedAt < cutoff
  })
}

/**
 * Retourne les constantes pour une annee fiscale qui vient de se terminer.
 * Ex: en janvier 2027, retourne les constantes tax_year=2025 qu'il faut
 * verifier car elles peuvent etre depassees.
 */
export function getConstantsToRefresh(): LegalConstant[] {
  const currentYear = new Date().getFullYear()
  return LEGAL_CONSTANTS.filter(c => {
    if (!c.tax_year) return false
    return c.tax_year < currentYear
  })
}

/**
 * Formate les constantes perimees en un email pour l'admin.
 */
export function formatStaleAlert(staleConstants: LegalConstant[]): string {
  if (staleConstants.length === 0) {
    return 'Aucune constante perimee. Tout est a jour.'
  }

  let msg = `ALERTE VEILLE LEGALE — ${staleConstants.length} constante(s) a verifier\n\n`
  for (const c of staleConstants) {
    msg += `• ${c.name}\n`
    msg += `  Valeur actuelle : ${c.value} ${c.unit}\n`
    msg += `  Derniere verif  : ${c.verified_at}\n`
    msg += `  Source          : ${c.source_url}\n`
    if (c.notes) msg += `  Note            : ${c.notes}\n`
    msg += '\n'
  }
  return msg
}
