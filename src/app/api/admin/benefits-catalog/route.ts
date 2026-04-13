import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import {
  BENEFITS_CATALOG,
  CATALOG_METADATA,
  CATALOG_SUMMARY,
  getCatalogStats,
} from '@/lib/benefitsCatalog'

// =====================================================
// GET /api/admin/benefits-catalog
// Retourne le catalogue complet de benefices pour le dashboard admin.
// Gate par ADMIN_EMAILS.
// =====================================================

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

  const stats = getCatalogStats()

  return NextResponse.json({
    metadata: CATALOG_METADATA,
    summary: CATALOG_SUMMARY,
    stats,
    catalog: BENEFITS_CATALOG,
  })
}
