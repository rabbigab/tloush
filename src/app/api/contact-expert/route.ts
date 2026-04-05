import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { escapeHtml } from '@/lib/fileValidation'

// Simple in-memory rate limit: max 5 requests per IP per 15 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5
const RATE_WINDOW = 15 * 60 * 1000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Trop de demandes. Réessayez dans quelques minutes.' }, { status: 429 })
    }

    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      return NextResponse.json({ error: 'Service email non configuré' }, { status: 500 })
    }

    const body = await req.json()
    const { name, email, phone, title, specialty, city, website, message, expertSlug, expertName } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    const resend = new Resend(resendApiKey)
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || 'onboarding@resend.dev'

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;margin:0;padding:0">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:24px">
      <h1 style="color:#2563eb;font-size:24px;margin:0">Tloush</h1>
      <p style="color:#64748b;font-size:12px;margin-top:4px">Nouvelle demande de contact</p>
    </div>

    <div style="background:white;border-radius:16px;border:1px solid #e2e8f0;padding:24px">
      <h2 style="font-size:16px;color:#0f172a;margin:0 0 16px">
        ${expertSlug === 'inscription' ? 'Nouvelle inscription pro' : `Contact expert : ${escapeHtml(expertName || 'N/A')}`}
      </h2>

      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#64748b;width:120px">Nom</td>
          <td style="padding:6px 0;font-size:14px;color:#0f172a;font-weight:500">${escapeHtml(name)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#64748b">Email</td>
          <td style="padding:6px 0;font-size:14px;color:#0f172a">${escapeHtml(email)}</td>
        </tr>
        ${phone ? `<tr>
          <td style="padding:6px 0;font-size:13px;color:#64748b">Téléphone</td>
          <td style="padding:6px 0;font-size:14px;color:#0f172a">${escapeHtml(phone)}</td>
        </tr>` : ''}
        ${title ? `<tr>
          <td style="padding:6px 0;font-size:13px;color:#64748b">Titre</td>
          <td style="padding:6px 0;font-size:14px;color:#0f172a">${escapeHtml(title)}</td>
        </tr>` : ''}
        ${specialty ? `<tr>
          <td style="padding:6px 0;font-size:13px;color:#64748b">Spécialité</td>
          <td style="padding:6px 0;font-size:14px;color:#0f172a">${escapeHtml(specialty)}</td>
        </tr>` : ''}
        ${city ? `<tr>
          <td style="padding:6px 0;font-size:13px;color:#64748b">Ville</td>
          <td style="padding:6px 0;font-size:14px;color:#0f172a">${escapeHtml(city)}</td>
        </tr>` : ''}
        ${website ? `<tr>
          <td style="padding:6px 0;font-size:13px;color:#64748b">Site web</td>
          <td style="padding:6px 0;font-size:14px;color:#0f172a">${escapeHtml(website)}</td>
        </tr>` : ''}
      </table>

      <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e2e8f0">
        <p style="font-size:13px;color:#64748b;margin:0 0 4px">Message :</p>
        <p style="font-size:14px;color:#334155;white-space:pre-wrap;margin:0">${escapeHtml(message)}</p>
      </div>
    </div>

    <div style="text-align:center;margin-top:24px">
      <p style="font-size:11px;color:#94a3b8">Email envoyé automatiquement par Tloush</p>
    </div>
  </div>
</body>
</html>`

    await resend.emails.send({
      from: `Tloush <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
      to: adminEmail,
      replyTo: email,
      subject: expertSlug === 'inscription'
        ? `[Tloush] Nouvelle inscription pro : ${name}`
        : `[Tloush] Contact expert : ${name}`,
      html,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/contact-expert]', err)
    return NextResponse.json({ error: 'Erreur lors de l\'envoi' }, { status: 500 })
  }
}
