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
  ] = await Promise.all([
    // All users from auth
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
    // Documents count
    supabaseAdmin.from('documents').select('*', { count: 'exact', head: true }),
    // Active subscriptions
    supabaseAdmin.from('subscriptions').select('*'),
    // Recent documents with user info
    supabaseAdmin.from('documents')
      .select('id, user_id, file_name, document_type, status, created_at, summary_fr')
      .order('created_at', { ascending: false })
      .limit(50),
    // Usage tracking current month
    supabaseAdmin.from('usage_tracking')
      .select('*')
      .eq('period', new Date().toISOString().slice(0, 7)),
  ])

  const users = usersRes.data?.users || []
  const totalDocuments = documentsRes.count || 0
  const subscriptions = subscriptionsRes.data || []
  const recentDocs = recentDocsRes.data || []
  const usageData = usageRes.data || []

  // 5. Build user stats
  // Count documents per user
  const { data: docCounts } = await supabaseAdmin
    .from('documents')
    .select('user_id')

  const docsPerUser: Record<string, number> = {}
  for (const doc of docCounts || []) {
    docsPerUser[doc.user_id] = (docsPerUser[doc.user_id] || 0) + 1
  }

  // Map subscriptions by user
  const subsByUser: Record<string, { plan_id: string; status: string; stripe_customer_id?: string }> = {}
  for (const sub of subscriptions) {
    subsByUser[sub.user_id] = {
      plan_id: sub.plan_id,
      status: sub.status,
      stripe_customer_id: sub.stripe_customer_id,
    }
  }

  // Usage by user this month
  const usageByUser: Record<string, number> = {}
  for (const u of usageData) {
    usageByUser[u.user_id] = u.documents_analyzed || 0
  }

  // Build enriched user list
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

  // 7. Revenue estimate
  const activeSolo = subscriptions.filter(s => s.plan_id === 'solo' && s.status === 'active').length
  const activeFamily = subscriptions.filter(s => s.plan_id === 'family' && s.status === 'active').length
  const mrr = activeSolo * 49 + activeFamily * 99

  // 8. Recent signups (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const recentSignups = users.filter(u => u.created_at > weekAgo).length

  // 9. Active users (signed in last 7 days)
  const activeUsers = users.filter(u => u.last_sign_in_at && u.last_sign_in_at > weekAgo).length

  return NextResponse.json({
    overview: {
      total_users: users.length,
      recent_signups_7d: recentSignups,
      active_users_7d: activeUsers,
      total_documents: totalDocuments,
      mrr,
      active_solo: activeSolo,
      active_family: activeFamily,
    },
    plan_distribution: planDistribution,
    users: enrichedUsers,
    recent_documents: recentDocs,
  })
}
