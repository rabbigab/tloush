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

  // Global totals
  const [totalViewsRes, todayViewsRes, weekViewsRes, monthViewsRes] = await Promise.all([
    supabaseAdmin.from('page_views').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', dayStart.toISOString()),
    supabaseAdmin.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', weekStart.toISOString()),
    supabaseAdmin.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', monthStart.toISOString()),
  ])

  // Fetch recent views to aggregate locally (last 30 days max for top pages + sources)
  const { data: recentViews } = await supabaseAdmin
    .from('page_views')
    .select('path, referrer, session_id, country, created_at')
    .gte('created_at', monthStart.toISOString())
    .limit(10000)

  // Unique visitors (by session_id)
  const uniqueSessionsMonth = new Set<string>()
  const uniqueSessionsToday = new Set<string>()
  const uniqueSessionsWeek = new Set<string>()
  const pathCounts = new Map<string, number>()
  const referrerCounts = new Map<string, number>()
  const countryCounts = new Map<string, number>()

  // Daily aggregation for the last 30 days
  const dailyMap = new Map<string, { views: number; visitors: Set<string> }>()

  for (const v of recentViews || []) {
    if (v.session_id) uniqueSessionsMonth.add(v.session_id)

    const createdAt = new Date(v.created_at)
    if (createdAt >= dayStart && v.session_id) uniqueSessionsToday.add(v.session_id)
    if (createdAt >= weekStart && v.session_id) uniqueSessionsWeek.add(v.session_id)

    pathCounts.set(v.path, (pathCounts.get(v.path) || 0) + 1)

    // Group referrer by domain
    if (v.referrer) {
      try {
        const domain = new URL(v.referrer).hostname.replace(/^www\./, '')
        referrerCounts.set(domain, (referrerCounts.get(domain) || 0) + 1)
      } catch {
        referrerCounts.set('other', (referrerCounts.get('other') || 0) + 1)
      }
    } else {
      referrerCounts.set('direct', (referrerCounts.get('direct') || 0) + 1)
    }

    if (v.country) {
      countryCounts.set(v.country, (countryCounts.get(v.country) || 0) + 1)
    }

    // Daily trend
    const dayKey = createdAt.toISOString().split('T')[0]
    if (!dailyMap.has(dayKey)) {
      dailyMap.set(dayKey, { views: 0, visitors: new Set() })
    }
    const day = dailyMap.get(dayKey)!
    day.views += 1
    if (v.session_id) day.visitors.add(v.session_id)
  }

  const topPages = Array.from(pathCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([path, count]) => ({ path, count }))

  const topReferrers = Array.from(referrerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([source, count]) => ({ source, count }))

  const topCountries = Array.from(countryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([country, count]) => ({ country, count }))

  const dailyTrend = Array.from(dailyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, data]) => ({ date, views: data.views, visitors: data.visitors.size }))

  return NextResponse.json({
    totals: {
      all_time_views: totalViewsRes.count || 0,
      today_views: todayViewsRes.count || 0,
      week_views: weekViewsRes.count || 0,
      month_views: monthViewsRes.count || 0,
      today_visitors: uniqueSessionsToday.size,
      week_visitors: uniqueSessionsWeek.size,
      month_visitors: uniqueSessionsMonth.size,
    },
    top_pages: topPages,
    top_referrers: topReferrers,
    top_countries: topCountries,
    daily_trend: dailyTrend,
  })
  } catch (err) {
    console.error('[admin/visitor-stats GET] unexpected:', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
