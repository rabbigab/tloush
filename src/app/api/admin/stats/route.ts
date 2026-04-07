import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

export const dynamic = 'force-dynamic'

export async function GET() {
  // 1. Auth check — must be logged in
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // 2. Admin check
  if (!ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  // 3. Use service role to read all data
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 4. Fetch all stats in parallel
  const [
    usersRes,
    documentsRes,
    subscriptionsRes,
    recentDocsRes,
    usageRes,
    feedbacksRes,
    allDocsRes,
  ] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
    supabaseAdmin.from('documents').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('subscriptions').select('*'),
    supabaseAdmin.from('documents')
      .select('id, user_id, file_name, document_type, status, created_at, summary_fr')
      .order('created_at', { ascending: false })
      .limit(50),
    supabaseAdmin.from('usage_tracking')
      .select('*')
      .eq('period', new Date().toISOString().slice(0, 7)),
    // Feedbacks
    supabaseAdmin.from('feedbacks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
    // All docs for per-user counts + daily trend
    supabaseAdmin.from('documents').select('user_id, created_at, document_type'),
  ])

  const users = usersRes.data?.users || []
  const totalDocuments = documentsRes.count || 0
  const subscriptions = subscriptionsRes.data || []
  const recentDocs = recentDocsRes.data || []
  const usageData = usageRes.data || []
  const feedbacks = feedbacksRes.data || []
  const allDocs = allDocsRes.data || []

  // 5. Build user stats
  const docsPerUser: Record<string, number> = {}
  for (const doc of allDocs) {
    docsPerUser[doc.user_id] = (docsPerUser[doc.user_id] || 0) + 1
  }

  const subsByUser: Record<string, { plan_id: string; status: string; stripe_customer_id?: string }> = {}
  for (const sub of subscriptions) {
    subsByUser[sub.user_id] = {
      plan_id: sub.plan_id,
      status: sub.status,
      stripe_customer_id: sub.stripe_customer_id,
    }
  }

  const usageByUser: Record<string, number> = {}
  for (const u of usageData) {
    usageByUser[u.user_id] = u.documents_analyzed || 0
  }

  const enrichedUsers = users.map(u => {
    const sub = subsByUser[u.id]
    return {
      id: u.id,
      email: u.email || '',
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      plan: sub?.plan_id || 'free',
      subscription_status: sub?.status || 'none',
      total_documents: docsPerUser[u.id] || 0,
      documents_this_month: usageByUser[u.id] || 0,
      provider: u.app_metadata?.provider || 'email',
      phone: (u.user_metadata as Record<string, string>)?.phone || null,
    }
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // 6. Plan distribution
  const planDistribution = { free: 0, solo: 0, family: 0 }
  for (const u of enrichedUsers) {
    const plan = u.plan as keyof typeof planDistribution
    if (plan in planDistribution) planDistribution[plan]++
    else planDistribution.free++
  }

  // 7. Revenue
  const activeSolo = subscriptions.filter(s => s.plan_id === 'solo' && s.status === 'active').length
  const activeFamily = subscriptions.filter(s => s.plan_id === 'family' && s.status === 'active').length
  const mrr = activeSolo * 49 + activeFamily * 99

  // 8. Time-based metrics
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const weekAgo = new Date(now - 7 * dayMs).toISOString()
  const monthAgo = new Date(now - 30 * dayMs).toISOString()

  const recentSignups = users.filter(u => u.created_at > weekAgo).length
  const activeUsers7d = users.filter(u => u.last_sign_in_at && u.last_sign_in_at > weekAgo).length
  const activeUsers30d = users.filter(u => u.last_sign_in_at && u.last_sign_in_at > monthAgo).length

  // 9. Engagement metrics
  const usersWithDocs = Object.keys(docsPerUser).length
  const avgDocsPerActiveUser = usersWithDocs > 0
    ? Math.round(totalDocuments / usersWithDocs * 10) / 10
    : 0

  // Retention: users who signed up > 7 days ago AND logged in within last 7 days
  const olderUsers = users.filter(u => u.created_at < weekAgo)
  const retainedUsers = olderUsers.filter(u => u.last_sign_in_at && u.last_sign_in_at > weekAgo)
  const retentionRate = olderUsers.length > 0
    ? Math.round(retainedUsers.length / olderUsers.length * 100)
    : 0

  // Conversion rate: free → paid
  const paidUsers = subscriptions.filter(s => s.status === 'active').length
  const conversionRate = users.length > 0
    ? Math.round(paidUsers / users.length * 1000) / 10
    : 0

  // 10. Signups trend: daily for last 30 days
  const signupTrend: { date: string; count: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now - i * dayMs)
    const dateStr = day.toISOString().slice(0, 10)
    const count = users.filter(u => u.created_at.slice(0, 10) === dateStr).length
    signupTrend.push({ date: dateStr, count })
  }

  // 11. Documents trend: daily for last 30 days
  const docsTrend: { date: string; count: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now - i * dayMs)
    const dateStr = day.toISOString().slice(0, 10)
    const count = allDocs.filter(d => d.created_at?.slice(0, 10) === dateStr).length
    docsTrend.push({ date: dateStr, count })
  }

  // 12. Document type distribution
  const docTypeDistribution: Record<string, number> = {}
  for (const doc of allDocs) {
    const t = doc.document_type || 'other'
    docTypeDistribution[t] = (docTypeDistribution[t] || 0) + 1
  }

  // 13. Feedback stats
  const feedbackStats = {
    total: feedbacks.length,
    new: feedbacks.filter(f => f.status === 'new').length,
    byCategory: {
      bug: feedbacks.filter(f => f.category === 'bug').length,
      suggestion: feedbacks.filter(f => f.category === 'suggestion').length,
      question: feedbacks.filter(f => f.category === 'question').length,
      other: feedbacks.filter(f => f.category === 'other').length,
    },
  }

  return NextResponse.json({
    overview: {
      total_users: users.length,
      recent_signups_7d: recentSignups,
      active_users_7d: activeUsers7d,
      active_users_30d: activeUsers30d,
      total_documents: totalDocuments,
      mrr,
      active_solo: activeSolo,
      active_family: activeFamily,
      avg_docs_per_user: avgDocsPerActiveUser,
      retention_rate_7d: retentionRate,
      conversion_rate: conversionRate,
      users_with_docs: usersWithDocs,
      feedback_new: feedbackStats.new,
    },
    plan_distribution: planDistribution,
    signup_trend: signupTrend,
    docs_trend: docsTrend,
    doc_type_distribution: docTypeDistribution,
    feedback_stats: feedbackStats,
    feedbacks,
    users: enrichedUsers,
    recent_documents: recentDocs,
  })
}
