import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/apiAuth'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
  const now = new Date()
  const dayStart = new Date(now)
  dayStart.setHours(0, 0, 0, 0)
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - 7)
  const monthStart = new Date(now)
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [
    totalProviders,
    activeProviders,
    pendingApps,
    totalContacts,
    contactsToday,
    contactsThisWeek,
    contactsThisMonth,
    totalReviews,
    pendingReviews,
    byCategoryRes,
    topProvidersRes,
  ] = await Promise.all([
    supabaseAdmin.from('providers').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('providers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('provider_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('provider_contacts').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('provider_contacts').select('id', { count: 'exact', head: true }).gte('created_at', dayStart.toISOString()),
    supabaseAdmin.from('provider_contacts').select('id', { count: 'exact', head: true }).gte('created_at', weekStart.toISOString()),
    supabaseAdmin.from('provider_contacts').select('id', { count: 'exact', head: true }).gte('created_at', monthStart.toISOString()),
    supabaseAdmin.from('provider_reviews').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabaseAdmin.from('provider_reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('providers').select('category').eq('status', 'active'),
    supabaseAdmin.from('providers').select('id, first_name, last_name, category, slug, average_rating, total_reviews').eq('status', 'active').order('total_reviews', { ascending: false }).limit(5),
  ])

  // Aggregate contacts per provider for top-5 contacted
  const { data: contactsAgg } = await supabaseAdmin
    .from('provider_contacts')
    .select('provider_id')
    .gte('created_at', monthStart.toISOString())

  const contactCountByProvider = new Map<string, number>()
  for (const c of contactsAgg || []) {
    contactCountByProvider.set(c.provider_id, (contactCountByProvider.get(c.provider_id) || 0) + 1)
  }
  const topContactedIds = Array.from(contactCountByProvider.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id)

  let topContacted: Array<{ id: string; first_name: string; last_name: string; category: string; slug: string; contacts: number }> = []
  if (topContactedIds.length > 0) {
    const { data: topContactedDetails } = await supabaseAdmin
      .from('providers')
      .select('id, first_name, last_name, category, slug')
      .in('id', topContactedIds)

    topContacted = (topContactedDetails || [])
      .map(p => ({ ...p, contacts: contactCountByProvider.get(p.id) || 0 }))
      .sort((a, b) => b.contacts - a.contacts)
  }

  // Count by category
  const byCategory: Record<string, number> = {}
  for (const row of byCategoryRes.data || []) {
    byCategory[row.category] = (byCategory[row.category] || 0) + 1
  }

  // Conversion funnel
  const conversionRate = (totalContacts.count || 0) > 0 && (totalReviews.count || 0) >= 0
    ? ((totalReviews.count || 0) / (totalContacts.count || 1)) * 100
    : 0

  return NextResponse.json({
    providers: {
      total: totalProviders.count || 0,
      active: activeProviders.count || 0,
      pending_applications: pendingApps.count || 0,
      by_category: byCategory,
    },
    contacts: {
      total: totalContacts.count || 0,
      today: contactsToday.count || 0,
      this_week: contactsThisWeek.count || 0,
      this_month: contactsThisMonth.count || 0,
    },
    reviews: {
      published: totalReviews.count || 0,
      pending: pendingReviews.count || 0,
      conversion_rate: Math.round(conversionRate * 10) / 10,
    },
    top_contacted_this_month: topContacted,
    top_rated: topProvidersRes.data || [],
  })
  } catch (err) {
    console.error('[admin/annuaire-stats GET] unexpected:', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
