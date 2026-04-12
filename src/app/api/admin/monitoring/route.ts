import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/apiAuth'

// =====================================================
// GET /api/admin/monitoring
// Retourne les metriques d'admin pour le dashboard monitoring
// =====================================================

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

export async function GET(req: Request) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user } = auth

  // Check admin
  if (!ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const period = (searchParams.get('period') || '7d') as '1d' | '7d' | '30d'

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const now = new Date()
  const since = new Date(now)
  if (period === '1d') since.setDate(since.getDate() - 1)
  else if (period === '7d') since.setDate(since.getDate() - 7)
  else since.setDate(since.getDate() - 30)

  // Fetch claude_usage aggregates
  const { data: usageRaw } = await supabase
    .from('claude_usage')
    .select('*')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })
    .limit(10000)

  const usage = usageRaw || []

  // Aggregate stats
  const totalCalls = usage.length
  const successCalls = usage.filter(u => u.success).length
  const errorCalls = totalCalls - successCalls
  const totalTokensIn = usage.reduce((s, u) => s + (u.tokens_in || 0), 0)
  const totalTokensOut = usage.reduce((s, u) => s + (u.tokens_out || 0), 0)
  const totalCost = usage.reduce((s, u) => s + Number(u.cost_usd || 0), 0)
  const durations = usage.filter(u => u.duration_ms).map(u => u.duration_ms as number).sort((a, b) => a - b)
  const avgDuration = durations.length > 0 ? durations.reduce((s, d) => s + d, 0) / durations.length : 0
  const p50 = durations[Math.floor(durations.length * 0.5)] || 0
  const p95 = durations[Math.floor(durations.length * 0.95)] || 0
  const p99 = durations[Math.floor(durations.length * 0.99)] || 0

  // Stats par route
  const byRoute: Record<string, { calls: number; errors: number; cost: number; avgDuration: number }> = {}
  for (const u of usage) {
    if (!byRoute[u.route]) {
      byRoute[u.route] = { calls: 0, errors: 0, cost: 0, avgDuration: 0 }
    }
    const r = byRoute[u.route]
    r.calls++
    if (!u.success) r.errors++
    r.cost += Number(u.cost_usd || 0)
    if (u.duration_ms) {
      r.avgDuration = (r.avgDuration * (r.calls - 1) + u.duration_ms) / r.calls
    }
  }

  // Top 10 users par cout
  const byUser: Record<string, { cost: number; calls: number }> = {}
  for (const u of usage) {
    if (!u.user_id) continue
    if (!byUser[u.user_id]) byUser[u.user_id] = { cost: 0, calls: 0 }
    byUser[u.user_id].cost += Number(u.cost_usd || 0)
    byUser[u.user_id].calls++
  }
  const topUsers = Object.entries(byUser)
    .map(([userId, stats]) => ({ userId, ...stats }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10)

  // Cout par jour (pour graphique)
  const byDay: Record<string, { calls: number; cost: number }> = {}
  for (const u of usage) {
    const day = u.created_at?.slice(0, 10)
    if (!day) continue
    if (!byDay[day]) byDay[day] = { calls: 0, cost: 0 }
    byDay[day].calls++
    byDay[day].cost += Number(u.cost_usd || 0)
  }
  const timeseries = Object.entries(byDay)
    .map(([day, stats]) => ({ day, ...stats }))
    .sort((a, b) => a.day.localeCompare(b.day))

  // Top erreurs non resolues
  const { data: errors } = await supabase
    .from('error_log')
    .select('*')
    .eq('resolved', false)
    .order('last_seen_at', { ascending: false })
    .limit(20)

  return NextResponse.json({
    period,
    summary: {
      totalCalls,
      successCalls,
      errorCalls,
      errorRate: totalCalls > 0 ? (errorCalls / totalCalls) * 100 : 0,
      totalTokensIn,
      totalTokensOut,
      totalCost: Math.round(totalCost * 10000) / 10000,
      avgDuration: Math.round(avgDuration),
      p50,
      p95,
      p99,
    },
    byRoute,
    topUsers,
    timeseries,
    recentErrors: errors || [],
  })
}
