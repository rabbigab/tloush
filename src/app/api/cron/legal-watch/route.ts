import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getStaleConstants, getConstantsToRefresh, formatStaleAlert, LEGAL_CONSTANTS, LEGAL_SOURCES } from '@/lib/legalWatch'

/**
 * CRON : Veille legale automatique
 *
 * Tourne tous les lundis a 9h. Verifie :
 * 1. Les constantes perimees (>90 jours sans verification)
 * 2. Les constantes d'une annee fiscale passee (a rafraichir)
 * 3. Envoie un email a l'admin avec la liste des items a verifier
 *
 * Configure dans vercel.json : "0 9 * * 1"
 */
export async function GET(req: NextRequest) {
  // Verifier le secret CRON
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  // 1. Detecter les constantes perimees
  const staleConstants = getStaleConstants(90)

  // 2. Detecter les constantes d'annees passees
  const toRefresh = getConstantsToRefresh()

  // 3. Unifier (dedup par id)
  const toAlertMap = new Map<string, typeof LEGAL_CONSTANTS[0]>()
  for (const c of staleConstants) toAlertMap.set(c.id, c)
  for (const c of toRefresh) toAlertMap.set(c.id, c)
  const toAlert = Array.from(toAlertMap.values())

  // 4. Si des items a verifier, envoyer un email admin
  if (toAlert.length > 0 && process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
    const resend = new Resend(process.env.RESEND_API_KEY)

    const textBody = formatStaleAlert(toAlert)
    const htmlBody = `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #7c3aed;">🔍 Veille legale Tloush</h1>
  <p><strong>${toAlert.length}</strong> constante(s) a verifier dans les sources officielles.</p>

  <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
    <thead>
      <tr style="background: #f3f4f6;">
        <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Constante</th>
        <th style="text-align: right; padding: 8px; border-bottom: 2px solid #ddd;">Valeur</th>
        <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Derniere verif</th>
      </tr>
    </thead>
    <tbody>
      ${toAlert.map(c => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            <a href="${c.source_url}" target="_blank">${c.name}</a>
            ${c.notes ? `<br><small style="color: #6b7280;">${c.notes}</small>` : ''}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-family: monospace;">
            ${c.value} ${c.unit}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; color: #6b7280;">
            ${c.verified_at}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div style="margin-top: 24px; padding: 16px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
    <strong>Action requise :</strong> verifiez chaque lien source officiel pour confirmer que la valeur actuelle est correcte. Si elle a change, mettez a jour <code>src/lib/legalWatch.ts</code> et <code>verified_at</code>.
  </div>

  <p style="margin-top: 24px; color: #6b7280; font-size: 12px;">
    Tloush — Veille legale automatique • ${new Date().toLocaleDateString('fr-FR')}
  </p>
</body>
</html>`

    try {
      await resend.emails.send({
        from: `Tloush <${process.env.EMAIL_FROM || 'noreply@tloush.com'}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `🔍 Veille legale : ${toAlert.length} item(s) a verifier`,
        html: htmlBody,
        text: textBody,
      })
    } catch (err) {
      console.error('[legal-watch] Failed to send email:', err)
    }
  }

  return NextResponse.json({
    success: true,
    stats: {
      total_constants: LEGAL_CONSTANTS.length,
      total_sources: Object.keys(LEGAL_SOURCES).length,
      stale_count: staleConstants.length,
      to_refresh_count: toRefresh.length,
      total_alerts: toAlert.length,
    },
    alerts: toAlert.map(c => ({
      id: c.id,
      name: c.name,
      value: c.value,
      unit: c.unit,
      source_url: c.source_url,
      verified_at: c.verified_at,
      days_since_verification: Math.floor(
        (Date.now() - new Date(c.verified_at).getTime()) / (1000 * 60 * 60 * 24)
      ),
    })),
    timestamp: new Date().toISOString(),
  })
}
