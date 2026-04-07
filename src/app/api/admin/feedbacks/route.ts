import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

export async function PATCH(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }
  if (!ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const body = await req.json()
  const { id, status, admin_note } = body as { id?: string; status?: string; admin_note?: string }

  if (!id) {
    return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
  }

  const validStatuses = ['new', 'read', 'resolved', 'archived']
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const update: Record<string, string> = {}
  if (status) update.status = status
  if (admin_note !== undefined) update.admin_note = admin_note

  const { error } = await supabaseAdmin.from('feedbacks').update(update).eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

// POST: reply to a feedback via email
export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }
  if (!ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const body = await req.json()
  const { id, reply } = body as { id?: string; reply?: string }

  if (!id || !reply || reply.trim().length < 2) {
    return NextResponse.json({ error: 'Réponse manquante' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get the feedback to find user email + original message
  const { data: feedback, error: fetchError } = await supabaseAdmin
    .from('feedbacks')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !feedback) {
    return NextResponse.json({ error: 'Feedback introuvable' }, { status: 404 })
  }

  if (!feedback.email) {
    return NextResponse.json({ error: 'Pas d\'email pour cet utilisateur' }, { status: 400 })
  }

  // Send reply email
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY non configuré' }, { status: 500 })
  }

  const resend = new Resend(resendApiKey)
  const fromAddress = process.env.EMAIL_FROM || 'Tloush <onboarding@resend.dev>'
  const adminReplyTo = process.env.ADMIN_EMAIL || user.email || undefined

  const categoryLabels: Record<string, string> = {
    bug: 'Bug', suggestion: 'Suggestion', question: 'Question', other: 'Message',
  }

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;margin:0;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;padding:24px;border:1px solid #e2e8f0">
    <div style="text-align:center;margin-bottom:20px">
      <h2 style="color:#0f172a;margin:0;font-size:20px;font-weight:700">Tloush</h2>
      <p style="color:#64748b;font-size:12px;margin:4px 0 0">Votre assistant financier en Israel</p>
    </div>

    <p style="color:#0f172a;font-size:14px;margin:0 0 16px">Bonjour,</p>
    <p style="color:#334155;font-size:14px;line-height:1.6;margin:0 0 16px">
      Merci pour votre ${categoryLabels[feedback.category] || 'message'}. Voici notre reponse :
    </p>

    <div style="background:#eff6ff;border-left:3px solid #2563eb;padding:12px 16px;border-radius:4px;margin-bottom:16px">
      <p style="margin:0;font-size:14px;color:#0f172a;white-space:pre-wrap;line-height:1.6">${reply.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
    </div>

    <div style="border-top:1px solid #e2e8f0;padding-top:12px;margin-top:16px">
      <p style="color:#94a3b8;font-size:11px;margin:0">Votre message original :</p>
      <p style="color:#94a3b8;font-size:12px;font-style:italic;margin:4px 0 0;white-space:pre-wrap">${feedback.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
    </div>

    <p style="color:#64748b;font-size:12px;margin:20px 0 0;text-align:center">
      L'equipe Tloush
    </p>
  </div>
</body></html>`

  try {
    await resend.emails.send({
      from: fromAddress,
      to: feedback.email,
      replyTo: adminReplyTo,
      subject: `Re: Votre ${categoryLabels[feedback.category] || 'message'} — Tloush`,
      html,
    })
  } catch (emailErr) {
    console.error('[admin/feedbacks] Email send failed:', emailErr)
    return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 })
  }

  // Update feedback: mark as resolved + save admin note
  await supabaseAdmin.from('feedbacks').update({
    status: 'resolved',
    admin_note: reply.trim(),
  }).eq('id', id)

  return NextResponse.json({ ok: true })
}
