import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { requireAuth } from '@/lib/apiAuth'
import { escapeHtml } from '@/lib/fileValidation'
import { createClient } from '@supabase/supabase-js'
import { createRateLimit } from '@/lib/rateLimit'

const ratelimit = createRateLimit('feedback', 3, '15 m')

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { user } = auth

    if (ratelimit) {
      const { success } = await ratelimit.limit(user.id)
      if (!success) {
        return NextResponse.json(
          { error: 'Trop de messages. Réessayez dans quelques minutes.' },
          { status: 429 }
        )
      }
    }

    const body = await req.json()
    const { category, message } = body as { category?: string; message?: string }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json({ error: 'Message trop court' }, { status: 400 })
    }
    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message trop long (max 2000 caractères)' }, { status: 400 })
    }

    const validCategories = ['bug', 'suggestion', 'question', 'other']
    const safeCategory = validCategories.includes(category || '') ? category : 'other'

    // Save to Supabase (primary storage)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: dbError } = await supabaseAdmin.from('feedbacks').insert({
      user_id: user.id,
      email: user.email || null,
      category: safeCategory,
      message: message.trim(),
    })

    if (dbError) {
      console.error('[/api/feedback] DB insert failed:', dbError)
      // Don't fail the request — still try email
    }

    // Also send email notification (optional)
    const resendApiKey = process.env.RESEND_API_KEY
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey)
        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || 'onboarding@resend.dev'
        const fromAddress = process.env.EMAIL_FROM || 'Tloush <onboarding@resend.dev>'

        const categoryLabels: Record<string, string> = {
          bug: '🐛 Bug',
          suggestion: '💡 Suggestion',
          question: '❓ Question',
          other: '💬 Autre',
        }

        const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;margin:0;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;padding:24px;border:1px solid #e2e8f0">
    <h2 style="color:#0f172a;margin:0 0 8px;font-size:18px">Nouveau feedback Tloush</h2>
    <p style="color:#64748b;font-size:12px;margin:0 0 16px">${categoryLabels[safeCategory || 'other']}</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
      <tr><td style="padding:4px 0;color:#64748b;font-size:13px;width:100px">User ID</td><td style="font-size:13px;color:#334155;font-family:monospace">${escapeHtml(user.id)}</td></tr>
      <tr><td style="padding:4px 0;color:#64748b;font-size:13px">Email</td><td style="font-size:13px;color:#334155">${escapeHtml(user.email || '—')}</td></tr>
    </table>
    <div style="background:#f8fafc;border-left:3px solid #2563eb;padding:12px 16px;border-radius:4px">
      <p style="margin:0;font-size:14px;color:#0f172a;white-space:pre-wrap">${escapeHtml(message)}</p>
    </div>
  </div>
</body></html>`

        await resend.emails.send({
          from: fromAddress,
          to: adminEmail,
          replyTo: user.email || undefined,
          subject: `[Feedback Tloush] ${categoryLabels[safeCategory || 'other']} — ${user.email || user.id}`,
          html,
        })
      } catch (emailErr) {
        console.error('[/api/feedback] Email send failed:', emailErr)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[/api/feedback]', err)
    return NextResponse.json({ error: 'Erreur envoi feedback' }, { status: 500 })
  }
}
