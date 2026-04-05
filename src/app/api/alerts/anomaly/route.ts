import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { escapeHtml } from '@/lib/fileValidation'

/**
 * Sends an anomaly alert email when a recurring expense deviates significantly.
 * Called internally after document upload when anomaly is detected.
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

  let userId: string, documentId: string, provider: string, newAmount: number, previousAmount: number, pct: number
  try {
    const body = await req.json()
    userId = body.userId
    documentId = body.documentId
    provider = body.provider
    newAmount = body.newAmount
    previousAmount = body.previousAmount
    pct = body.pct
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  if (!userId || !documentId || !provider) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('urgent_alerts_enabled')
    .eq('user_id', userId)
    .single()

  if (prefs && prefs.urgent_alerts_enabled === false) {
    return NextResponse.json({ sent: false, reason: 'Alertes désactivées' })
  }

  const { data: { user } } = await supabase.auth.admin.getUserById(userId)
  if (!user?.email) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  }

  const diff = newAmount - previousAmount
  const direction = diff > 0 ? 'augmenté' : 'diminué'
  const color = diff > 0 ? '#dc2626' : '#059669'

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;margin:0;padding:0">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:24px">
      <h1 style="color:#2563eb;font-size:24px;margin:0">Tloush</h1>
    </div>

    <div style="background:white;border-radius:16px;border:2px solid #fde68a;padding:24px;margin-bottom:16px">
      <div style="background:#fef3c7;border-radius:12px;padding:16px;margin-bottom:16px;text-align:center">
        <div style="font-size:32px;margin-bottom:8px">&#128202;</div>
        <h2 style="font-size:18px;color:#92400e;margin:0">Variation inhabituelle détectée</h2>
      </div>

      <p style="font-size:14px;color:#334155;margin:0 0 16px">
        Votre dernière facture <strong>${escapeHtml(provider)}</strong> a ${direction} de
        <strong style="color:${color}">${pct.toFixed(0)}%</strong> par rapport à l'habituel.
      </p>

      <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:8px;padding:12px">
        <tr>
          <td style="padding:12px;font-size:13px;color:#64748b">Montant habituel</td>
          <td style="padding:12px;font-size:16px;color:#0f172a;font-weight:600;text-align:right">${previousAmount.toFixed(0)}₪</td>
        </tr>
        <tr>
          <td style="padding:12px;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0">Nouveau montant</td>
          <td style="padding:12px;font-size:16px;color:${color};font-weight:700;text-align:right;border-top:1px solid #e2e8f0">${newAmount.toFixed(0)}₪</td>
        </tr>
      </table>

      <p style="font-size:13px;color:#64748b;margin:16px 0 0">
        Vérifiez si cette évolution est normale (augmentation tarifaire, consommation exceptionnelle, erreur de facturation...).
      </p>
    </div>

    <div style="text-align:center;margin:24px 0">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://tloush.com'}/documents/${documentId}" style="display:inline-block;background:#2563eb;color:white;text-decoration:none;padding:12px 32px;border-radius:12px;font-weight:600;font-size:14px">
        Voir la facture
      </a>
    </div>

    <div style="text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0">
      <p style="font-size:11px;color:#94a3b8;margin:0">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://tloush.com'}/profile" style="color:#2563eb">Gérer mes préférences</a>
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
      subject: `Tloush — ${provider} : ${direction} de ${pct.toFixed(0)}%`,
      html
    })
    return NextResponse.json({ sent: true })
  } catch (err) {
    console.error('[Anomaly Alert] Erreur envoi:', err)
    return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 })
  }
}
