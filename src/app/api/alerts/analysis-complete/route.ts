import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { escapeHtml } from '@/lib/fileValidation'
import { DOC_LABELS } from '@/lib/docTypes'

/**
 * Sends an email summary after document analysis.
 * Called fire-and-forget from upload route.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    return NextResponse.json({ ok: false, reason: 'no_resend_key' })
  }

  const { userId, documentId } = await req.json()
  if (!userId || !documentId) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const resend = new Resend(resendApiKey)

  const { data: { user } } = await supabase.auth.admin.getUserById(userId)
  if (!user?.email) return NextResponse.json({ ok: false, reason: 'no_email' })

  const { data: doc } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single()

  if (!doc) return NextResponse.json({ ok: false, reason: 'no_doc' })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tloush.com'
  const docType = DOC_LABELS[doc.document_type] || 'Document'
  const urgentBadge = doc.is_urgent
    ? '<span style="display:inline-block;background:#fef2f2;color:#dc2626;padding:4px 10px;border-radius:8px;font-size:12px;font-weight:600;margin-left:8px">URGENT</span>'
    : ''
  const actionSection = doc.action_required && doc.action_description
    ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px;margin:16px 0">
        <p style="margin:0;color:#92400e;font-weight:600;font-size:14px">Action requise :</p>
        <p style="margin:6px 0 0;color:#78350f;font-size:14px">${escapeHtml(doc.action_description)}</p>
        ${doc.deadline ? `<p style="margin:6px 0 0;color:#dc2626;font-size:13px;font-weight:600">Échéance : ${doc.deadline}</p>` : ''}
      </div>`
    : ''

  try {
    await resend.emails.send({
      from: 'Tloush <notifications@tloush.com>',
      to: user.email,
      subject: `Analyse terminée — ${escapeHtml(doc.file_name)}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <div style="text-align:center;margin-bottom:24px">
            <h1 style="font-size:24px;color:#1e293b;margin:0">Tloush</h1>
          </div>

          <div style="background:white;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin-bottom:20px">
            <div style="margin-bottom:16px">
              <span style="display:inline-block;background:#eff6ff;color:#2563eb;padding:4px 12px;border-radius:8px;font-size:12px;font-weight:600">${escapeHtml(docType)}</span>
              ${urgentBadge}
              ${doc.period ? `<span style="color:#94a3b8;font-size:12px;margin-left:8px">${escapeHtml(doc.period)}</span>` : ''}
            </div>

            <h2 style="color:#1e293b;font-size:16px;margin:0 0 12px">${escapeHtml(doc.file_name)}</h2>

            ${doc.summary_fr ? `<p style="color:#475569;font-size:14px;line-height:1.6;margin:0">${escapeHtml(doc.summary_fr)}</p>` : ''}

            ${actionSection}
          </div>

          <div style="text-align:center;margin:24px 0">
            <a href="${siteUrl}/documents/${doc.id}" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px">
              Voir l'analyse complète
            </a>
          </div>

          <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:32px">
            Tloush — Votre assistant administratif en Israël
          </p>
        </div>
      `,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[analysis-complete email]', err)
    return NextResponse.json({ ok: false })
  }
}
