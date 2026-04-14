import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { LEGAL_CONSTANTS, LEGAL_SOURCES, getStaleConstants, getConstantsToRefresh } from '@/lib/legalWatch'

/**
 * GET /api/admin/legal-watch
 * Retourne l'etat de la veille legale pour le dashboard admin.
 * Gate par ADMIN_EMAILS.
 */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user } = auth

  if (!ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
  }

  try {
    const stale = getStaleConstants(90)
    const toRefresh = getConstantsToRefresh()

    const now = Date.now()
    const enriched = LEGAL_CONSTANTS.map(c => {
      const verifiedAt = new Date(c.verified_at).getTime()
      const daysSince = Math.floor((now - verifiedAt) / (1000 * 60 * 60 * 24))
      const source = LEGAL_SOURCES[c.source_id]
      return {
        ...c,
        days_since_verification: daysSince,
        source_name: source?.name || c.source_id,
        source_category: source?.category || 'general',
        is_stale: daysSince > 90,
        needs_refresh: c.tax_year ? c.tax_year < new Date().getFullYear() : false,
      }
    })

    const byCategory: Record<string, typeof enriched> = {}
    for (const c of enriched) {
      const cat = c.source_category
      if (!byCategory[cat]) byCategory[cat] = []
      byCategory[cat].push(c)
    }

    return NextResponse.json({
      stats: {
        total_constants: LEGAL_CONSTANTS.length,
        total_sources: Object.keys(LEGAL_SOURCES).length,
        stale_count: stale.length,
        to_refresh_count: toRefresh.length,
      },
      sources: Object.values(LEGAL_SOURCES),
      constants: enriched,
      by_category: byCategory,
    })
  } catch (err) {
    console.error('[admin/legal-watch GET] unexpected:', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
