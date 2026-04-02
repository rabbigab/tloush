import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { escapeHtml } from '@/lib/fileValidation'

// Verify cron secret to prevent unauthorized calls
function verifyCronAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return false
  return authHeader === `Bearer ${process.env.CRON_SECRET}`
}

export async function POST(req: NextRequest) {
  // Allow cron secret OR service role
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY non configurée' }, { status: 500 })
  }

  const resend = new Resend(resendApiKey)

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get users who opted in for digest
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('user_id')
    .eq('email_digest_enabled', true)

  if (!prefs || prefs.length === 0) {
    return NextResponse.json({ sent: 0, message: 'Aucun utilisateur avec digest activé' })
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  let sentCount = 0

  for (const pref of prefs) {
    // Get user email
    const { data: { user } } = await supabase.auth.admin.getUserById(pref.user_id)
    if (!user?.email) continue

    // Get documents from last 7 days
    const { data: docs } = await supabase
      .from('documents')
      .select('id, document_type, summary_fr, is_urgent, action_required, action_description, created_at')
      .eq('user_id', pref.user_id)
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })

    if (!docs || docs.length === 0) continue

    const urgentCount = docs.filter(d => d.is_urgent).length
    const actionCount = docs.filter(d => d.action_required).length

    const docRows = docs.map(d => {
      const summary = d.summary_fr || ''
      const truncated = summary.length > 80 ? summary.substring(0, 80) + '...' : summary
      return `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#334155">${escapeHtml(d.document_type || 'Document')}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#334155">${escapeHtml(truncated)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center">${d.is_urgent ? '<span style="color:#dc2626;font-weight:600">Urgent</span>' : '<span style="color:#16a34a">OK</span>'}</td>
      </tr>`
    }).join('')

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;margin:0;padding:0">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:24px">
      <h1 style="color:#2563eb;font-size:24px;margin:0">Tloush</h1>
      <p style="color:#94a3b8;font-size:13px;margin:4px 0 0">Votre résumé hebdomadaire</p>
    </div>

    <div style="background:white;border-radius:16px;border:1px solid #e2e8f0;padding:24px;margin-bottom:16px">
      <h2 style="font-size:18px;color:#0f172a;margin:0 0 16px">Cette semaine</h2>

      <div style="display:flex;gap:12px;margin-bottom:20px">
        <div style="flex:1;background:#eff6ff;border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:28px;font-weight:700;color:#2563eb">${docs.length}</div>
          <div style="font-size:12px;color:#64748b">Documents</div>
        </div>
        ${urgentCount > 0 ? `<div style="flex:1;background:#fef2f2;border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:28px;font-weight:700;color:#dc2626">${urgentCount}</div>
          <div style="font-size:12px;color:#64748b">Urgents</div>
        </div>` : ''}
        ${actionCount > 0 ? `<div style="flex:1;background:#fffbeb;border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:28px;font-weight:700;color:#d97706">${actionCount}</div>
          <div style="font-size:12px;color:#64748b">Actions</div>
        </div>` : ''}
      </div>

      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#f1f5f9">
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600">Type</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600">Résumé</th>
            <th style="padding:8px 12px;text-align:center;font-size:12px;color:#64748b;font-weight:600">Statut</th>
          </tr>
        </thead>
        <tbody>${docRows}</tbody>
      </table>
    </div>

    <div style="text-align:center;margin:24px 0">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://tloush.com'}/inbox" style="display:inline-block;background:#2563eb;color:white;text-decoration:none;padding:12px 32px;border-radius:12px;font-weight:600;font-size:14px">
        Voir mes documents
      </a>
    </div>

    <div style="text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0">
      <p style="font-size:11px;color:#94a3b8;margin:0">
        Vous recevez cet email car vous avez activé le résumé hebdomadaire sur Tloush.<br>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://tloush.com'}/profile" style="color:#2563eb">Gérer mes préférences</a>
      </p>
    </div>
  </div>
</body>
</html>`

    try {
      await resend.emails.send({
        from: `Tloush <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: user.email,
        subject: `Tloush — ${docs.length} document${docs.length > 1 ? 's' : ''} cette semaine${urgentCount > 0 ? ` (${urgentCount} urgent${urgentCount > 1 ? 's' : ''})` : ''}`,
        html
      })
      sentCount++
    } catch (err) {
      console.error(`[Digest] Erreur envoi à ${user.email}:`, err)
    }
  }

  return NextResponse.json({ sent: sentCount, total: prefs.length })
}
