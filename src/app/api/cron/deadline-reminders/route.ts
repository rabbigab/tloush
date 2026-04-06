import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { escapeHtml } from '@/lib/fileValidation'

/**
 * CRON: Runs daily. Sends email reminders for documents with upcoming deadlines.
 * - 3 days before: email reminder
 * - 1 day before: email reminder (more urgent)
 * Configure in Vercel cron: 0 8 * * * (every day at 8am UTC)
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY non configurée' }, { status: 500 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const resend = new Resend(resendApiKey)

  const today = new Date()
  const in1day = new Date(today)
  in1day.setDate(in1day.getDate() + 1)
  const in3days = new Date(today)
  in3days.setDate(in3days.getDate() + 3)

  const format = (d: Date) => d.toISOString().split('T')[0]

  // Find documents with deadline in 1 day or 3 days
  const { data: docs } = await supabase
    .from('documents')
    .select('id, user_id, file_name, document_type, deadline, summary_fr, action_description, action_completed_at')
    .in('deadline', [format(in1day), format(in3days)])
    .is('action_completed_at', null)

  if (!docs || docs.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  let sent = 0

  // Group by user
  const byUser = new Map<string, typeof docs>()
  for (const doc of docs) {
    const list = byUser.get(doc.user_id) || []
    list.push(doc)
    byUser.set(doc.user_id, list)
  }

  for (const [userId, userDocs] of byUser) {
    // Get user email
    const { data: { user } } = await supabase.auth.admin.getUserById(userId)
    if (!user?.email) continue

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tloush.com'

    const docRows = userDocs.map(doc => {
      const daysLeft = doc.deadline === format(in1day) ? '1 jour' : '3 jours'
      const urgencyColor = doc.deadline === format(in1day) ? '#dc2626' : '#d97706'
      return `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e2e8f0">
            <strong>${escapeHtml(doc.file_name)}</strong>
            ${doc.action_description ? `<br/><span style="color:#64748b;font-size:13px">${escapeHtml(doc.action_description)}</span>` : ''}
          </td>
          <td style="padding:12px;border-bottom:1px solid #e2e8f0;color:${urgencyColor};font-weight:700;white-space:nowrap">
            ${daysLeft}
          </td>
          <td style="padding:12px;border-bottom:1px solid #e2e8f0">
            <a href="${siteUrl}/documents/${doc.id}" style="color:#2563eb;text-decoration:none;font-weight:600">Voir</a>
          </td>
        </tr>`
    }).join('')

    const hasUrgent = userDocs.some(d => d.deadline === format(in1day))
    const subject = hasUrgent
      ? `⚠️ Échéance demain — ${userDocs.length} document${userDocs.length > 1 ? 's' : ''} à traiter`
      : `📅 Échéance dans 3 jours — ${userDocs.length} document${userDocs.length > 1 ? 's' : ''}`

    try {
      await resend.emails.send({
        from: 'Tloush <notifications@tloush.com>',
        to: user.email,
        subject,
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <div style="text-align:center;margin-bottom:24px">
              <h1 style="font-size:24px;color:#1e293b;margin:0">Tloush</h1>
              <p style="color:#64748b;margin:4px 0 0">Rappel d'échéance</p>
            </div>
            <p style="color:#334155;font-size:15px">
              Bonjour,<br/><br/>
              Vous avez des documents avec une échéance proche. N'oubliez pas de les traiter :
            </p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px">
              <thead>
                <tr style="background:#f8fafc">
                  <th style="padding:10px 12px;text-align:left;color:#64748b;font-size:12px;text-transform:uppercase">Document</th>
                  <th style="padding:10px 12px;text-align:left;color:#64748b;font-size:12px;text-transform:uppercase">Échéance</th>
                  <th style="padding:10px 12px;text-align:left;color:#64748b;font-size:12px;text-transform:uppercase">Action</th>
                </tr>
              </thead>
              <tbody>${docRows}</tbody>
            </table>
            <div style="text-align:center;margin:24px 0">
              <a href="${siteUrl}/inbox" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px">
                Voir mes documents
              </a>
            </div>
            <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:32px">
              Tloush — Votre assistant administratif en Israël
            </p>
          </div>
        `,
      })
      sent++
    } catch (err) {
      console.error(`[deadline-reminders] Failed to send to ${user.email}:`, err)
    }
  }

  return NextResponse.json({ sent, total: docs.length })
}
