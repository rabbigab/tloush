import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

/**
 * Sends an urgent document alert email to the user.
 * Called internally after document upload when is_urgent is true.
 */
export async function POST(req: NextRequest) {
  // Internal API: verify via cron secret or internal header
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY non configurée' }, { status: 500 })
  }

  const { userId, documentId } = await req.json()
  if (!userId || !documentId) {
    return NextResponse.json({ error: 'userId et documentId requis' }, { status: 400 })
  }

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Check user preferences
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('urgent_alerts_enabled')
    .eq('user_id', userId)
    .single()

  // Default to true if no preferences set
  if (prefs && prefs.urgent_alerts_enabled === false) {
    return NextResponse.json({ sent: false, reason: 'Alertes urgentes désactivées' })
  }

  // Get user email
  const { data: { user } } = await supabase.auth.admin.getUserById(userId)
  if (!user?.email) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  }

  // Get document details
  const { data: doc } = await supabase
    .from('documents')
    .select('file_name, document_type, summary_fr, action_description, analysis_data')
    .eq('id', documentId)
    .eq('user_id', userId)
    .single()

  if (!doc) {
    return NextResponse.json({ error: 'Document introuvable' }, { status: 404 })
  }

  const keyInfo = (doc.analysis_data as Record<string, unknown>)?.key_info as Record<string, string> | undefined
  const deadline = keyInfo?.deadline || null

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;margin:0;padding:0">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:24px">
      <h1 style="color:#2563eb;font-size:24px;margin:0">Tloush</h1>
    </div>

    <div style="background:white;border-radius:16px;border:2px solid #fecaca;padding:24px;margin-bottom:16px">
      <div style="background:#fef2f2;border-radius:12px;padding:16px;margin-bottom:16px;text-align:center">
        <div style="font-size:32px;margin-bottom:8px">&#128680;</div>
        <h2 style="font-size:18px;color:#dc2626;margin:0">Document urgent détecté</h2>
      </div>

      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#64748b;width:120px">Document</td>
          <td style="padding:8px 0;font-size:14px;color:#0f172a;font-weight:600">${doc.file_name}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#64748b">Type</td>
          <td style="padding:8px 0;font-size:14px;color:#334155">${doc.document_type || 'Document'}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#64748b;vertical-align:top">Résumé</td>
          <td style="padding:8px 0;font-size:14px;color:#334155">${doc.summary_fr || 'Analyse disponible dans votre inbox'}</td>
        </tr>
        ${doc.action_description ? `<tr>
          <td style="padding:8px 0;font-size:13px;color:#64748b;vertical-align:top">Action requise</td>
          <td style="padding:8px 0;font-size:14px;color:#dc2626;font-weight:600">${doc.action_description}</td>
        </tr>` : ''}
        ${deadline ? `<tr>
          <td style="padding:8px 0;font-size:13px;color:#64748b">Date limite</td>
          <td style="padding:8px 0;font-size:14px;color:#dc2626;font-weight:700">${deadline}</td>
        </tr>` : ''}
      </table>
    </div>

    <div style="text-align:center;margin:24px 0">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://tloush.vercel.app'}/inbox" style="display:inline-block;background:#dc2626;color:white;text-decoration:none;padding:12px 32px;border-radius:12px;font-weight:600;font-size:14px">
        Voir le document dans mon inbox
      </a>
    </div>

    <div style="text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0">
      <p style="font-size:11px;color:#94a3b8;margin:0">
        Vous recevez cet email car les alertes urgentes sont activées sur Tloush.<br>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://tloush.vercel.app'}/profile" style="color:#2563eb">Gérer mes préférences</a>
      </p>
    </div>
  </div>
</body>
</html>`

  const resend = new Resend(resendApiKey)

  try {
    await resend.emails.send({
      from: `Tloush <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
      to: user.email,
      subject: `Tloush — Document urgent : ${doc.file_name}`,
      html
    })
    return NextResponse.json({ sent: true })
  } catch (err) {
    console.error('[Urgent Alert] Erreur envoi:', err)
    return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 })
  }
}
