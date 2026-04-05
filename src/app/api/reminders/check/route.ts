import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { escapeHtml } from '@/lib/fileValidation'
import { DOC_LABELS } from '@/lib/docTypes'

/**
 * Checks for upcoming deadlines and sends reminder emails.
 * Should be called daily via Vercel Cron.
 *
 * Sends reminders at:
 * - 7 days before deadline
 * - 2 days before deadline
 * - Day of deadline
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY non configurée' }, { status: 500 })
  }

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const resend = new Resend(resendApiKey)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tloush.com'
  const fromEmail = `Tloush <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const in2Days = new Date(today)
  in2Days.setDate(in2Days.getDate() + 2)

  const in7Days = new Date(today)
  in7Days.setDate(in7Days.getDate() + 7)

  // Find documents with deadlines in the next 7 days (including today)
  const { data: docs, error } = await supabase
    .from('documents')
    .select('id, user_id, file_name, document_type, summary_fr, action_description, deadline')
    .gte('deadline', today.toISOString().split('T')[0])
    .lte('deadline', in7Days.toISOString().split('T')[0])
    .not('deadline', 'is', null)

  if (error || !docs?.length) {
    return NextResponse.json({ sent: 0, reason: error?.message || 'Aucune échéance' })
  }

  let sentCount = 0

  for (const doc of docs) {
    const deadlineDate = new Date(doc.deadline + 'T00:00:00')
    const diffDays = Math.round((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    let reminderType: string | null = null
    let urgencyLabel = ''
    let urgencyColor = '#f59e0b'

    if (diffDays === 0) {
      reminderType = 'due_today'
      urgencyLabel = "Aujourd'hui"
      urgencyColor = '#dc2626'
    } else if (diffDays <= 2) {
      reminderType = '2_days'
      urgencyLabel = `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`
      urgencyColor = '#ea580c'
    } else if (diffDays <= 7) {
      reminderType = '7_days'
      urgencyLabel = `Dans ${diffDays} jours`
      urgencyColor = '#f59e0b'
    }

    if (!reminderType) continue

    // Check if already sent
    const { data: existing } = await supabase
      .from('reminder_log')
      .select('id')
      .eq('document_id', doc.id)
      .eq('reminder_type', reminderType)
      .single()

    if (existing) continue

    // Check user preferences
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('urgent_alerts_enabled')
      .eq('user_id', doc.user_id)
      .single()

    if (prefs && prefs.urgent_alerts_enabled === false) continue

    // Get user email
    const { data: { user } } = await supabase.auth.admin.getUserById(doc.user_id)
    if (!user?.email) continue

    const docLabel = DOC_LABELS[doc.document_type] || 'Document'
    const deadlineFormatted = deadlineDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;margin:0;padding:0">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:24px">
      <h1 style="color:#2563eb;font-size:24px;margin:0">Tloush</h1>
      <p style="color:#64748b;font-size:12px;margin-top:4px">Rappel d'échéance</p>
    </div>

    <div style="background:white;border-radius:16px;border:2px solid ${urgencyColor}30;padding:24px;margin-bottom:16px">
      <div style="background:${urgencyColor}10;border-radius:12px;padding:16px;margin-bottom:16px;text-align:center">
        <div style="font-size:32px;margin-bottom:8px">&#9200;</div>
        <h2 style="font-size:18px;color:${urgencyColor};margin:0">Échéance ${urgencyLabel.toLowerCase()}</h2>
        <p style="font-size:14px;color:#64748b;margin:8px 0 0">${escapeHtml(deadlineFormatted)}</p>
      </div>

      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#64748b;width:120px">Document</td>
          <td style="padding:8px 0;font-size:14px;color:#0f172a;font-weight:600">${escapeHtml(doc.file_name)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#64748b">Type</td>
          <td style="padding:8px 0;font-size:14px;color:#334155">${escapeHtml(docLabel)}</td>
        </tr>
        ${doc.summary_fr ? `<tr>
          <td style="padding:8px 0;font-size:13px;color:#64748b;vertical-align:top">Résumé</td>
          <td style="padding:8px 0;font-size:14px;color:#334155">${escapeHtml(doc.summary_fr)}</td>
        </tr>` : ''}
        ${doc.action_description ? `<tr>
          <td style="padding:8px 0;font-size:13px;color:#64748b;vertical-align:top">Action</td>
          <td style="padding:8px 0;font-size:14px;color:${urgencyColor};font-weight:600">${escapeHtml(doc.action_description)}</td>
        </tr>` : ''}
      </table>
    </div>

    <div style="text-align:center;margin:24px 0">
      <a href="${siteUrl}/inbox" style="display:inline-block;background:#2563eb;color:white;text-decoration:none;padding:12px 32px;border-radius:12px;font-weight:600;font-size:14px">
        Voir dans mon inbox
      </a>
    </div>

    <div style="text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0">
      <p style="font-size:11px;color:#94a3b8;margin:0">
        Rappel automatique envoyé par Tloush.<br>
        <a href="${siteUrl}/profile" style="color:#2563eb">Gérer mes préférences</a>
      </p>
    </div>
  </div>
</body>
</html>`

    try {
      await resend.emails.send({
        from: fromEmail,
        to: user.email,
        subject: reminderType === 'due_today'
          ? `Tloush — Échéance aujourd'hui : ${doc.file_name}`
          : `Tloush — Rappel : échéance dans ${diffDays} jours`,
        html
      })

      // Log the reminder
      await supabase
        .from('reminder_log')
        .insert({
          user_id: doc.user_id,
          document_id: doc.id,
          reminder_type: reminderType
        })

      sentCount++
    } catch (err) {
      console.error(`[Reminder] Error for doc ${doc.id}:`, err)
    }
  }

  return NextResponse.json({ sent: sentCount, checked: docs.length })
}
