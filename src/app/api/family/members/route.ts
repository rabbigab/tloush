import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { getSubscription } from '@/lib/subscription'
import { Resend } from 'resend'

// GET: List family members (for the owner)
export async function GET() {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { user, supabase } = auth

    const sub = await getSubscription(supabase, user.id)

    // Check if user has family plan
    if (sub.planId !== 'family') {
      return NextResponse.json({ members: [], maxMembers: 1, planId: sub.planId })
    }

    const { data: members } = await supabase
      .from('family_members')
      .select('id, member_email, member_id, status, invited_at, accepted_at')
      .eq('owner_id', user.id)
      .in('status', ['pending', 'active'])
      .order('created_at', { ascending: true })

    return NextResponse.json({
      members: members || [],
      maxMembers: sub.plan.limits.maxMembers,
      planId: sub.planId,
    })
  } catch (err) {
    console.error('[/api/family/members GET]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST: Invite a new family member
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { user, supabase } = auth

    const sub = await getSubscription(supabase, user.id)

    if (sub.planId !== 'family') {
      return NextResponse.json(
        { error: 'Le plan Famille est requis pour inviter des membres.' },
        { status: 403 }
      )
    }

    if (sub.status !== 'active') {
      return NextResponse.json(
        { error: 'Votre abonnement n\'est pas actif.' },
        { status: 403 }
      )
    }

    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Can't invite yourself
    if (normalizedEmail === user.email?.toLowerCase()) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous inviter vous-même.' },
        { status: 400 }
      )
    }

    // Check member limit (maxMembers includes the owner, so members = maxMembers - 1)
    const { count } = await supabase
      .from('family_members')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user.id)
      .in('status', ['pending', 'active'])

    const maxInvites = sub.plan.limits.maxMembers - 1 // -1 for the owner
    if ((count || 0) >= maxInvites) {
      return NextResponse.json(
        { error: `Vous avez atteint la limite de ${maxInvites} membres.` },
        { status: 400 }
      )
    }

    // Check if already invited
    const { data: existing } = await supabase
      .from('family_members')
      .select('id, status')
      .eq('owner_id', user.id)
      .eq('member_email', normalizedEmail)
      .single()

    if (existing && existing.status !== 'removed') {
      return NextResponse.json(
        { error: 'Ce membre est déjà invité.' },
        { status: 400 }
      )
    }

    // If previously removed, re-invite
    if (existing && existing.status === 'removed') {
      const { error } = await supabase
        .from('family_members')
        .update({
          status: 'pending',
          member_id: null,
          invite_token: crypto.randomUUID(),
          invited_at: new Date().toISOString(),
          accepted_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (error) {
        return NextResponse.json({ error: 'Erreur lors de l\'invitation.' }, { status: 500 })
      }
    } else {
      // Create new invitation
      const { error } = await supabase
        .from('family_members')
        .insert({
          owner_id: user.id,
          member_email: normalizedEmail,
          status: 'pending',
        })

      if (error) {
        return NextResponse.json({ error: 'Erreur lors de l\'invitation.' }, { status: 500 })
      }
    }

    // Send invitation email
    await sendInvitationEmail(normalizedEmail, user.email || 'un membre Tloush')

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/family/members POST]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

async function sendInvitationEmail(to: string, inviterEmail: string) {
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    console.warn('[family] RESEND_API_KEY not set, skipping invitation email')
    return
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tloush.com'
  const resend = new Resend(resendApiKey)

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;margin:0;padding:0">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:24px">
      <h1 style="color:#2563eb;font-size:24px;margin:0">Tloush</h1>
    </div>

    <div style="background:white;border-radius:16px;border:1px solid #e2e8f0;padding:24px;margin-bottom:16px">
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:40px;margin-bottom:12px">&#128106;</div>
        <h2 style="font-size:18px;color:#0f172a;margin:0 0 8px 0">Vous êtes invité(e) au plan Famille</h2>
        <p style="font-size:14px;color:#64748b;margin:0">
          <strong>${inviterEmail}</strong> vous invite à rejoindre son plan Famille sur Tloush.
        </p>
      </div>

      <div style="background:#f0f9ff;border-radius:12px;padding:16px;margin-bottom:20px">
        <p style="font-size:14px;color:#0369a1;margin:0 0 8px 0;font-weight:600">Ce que vous obtenez :</p>
        <ul style="font-size:13px;color:#334155;margin:0;padding-left:20px;line-height:1.8">
          <li>Analyses de documents administratifs israéliens</li>
          <li>Assistant IA pour vos questions</li>
          <li>Traduction de messages en hébreu</li>
          <li>Historique d'un an</li>
        </ul>
      </div>

      <div style="text-align:center">
        <a href="${siteUrl}/auth/register" style="display:inline-block;background:#2563eb;color:white;text-decoration:none;padding:12px 32px;border-radius:12px;font-weight:600;font-size:14px">
          Créer mon compte et rejoindre
        </a>
        <p style="font-size:12px;color:#94a3b8;margin:12px 0 0 0">
          Déjà un compte ? <a href="${siteUrl}/auth/login" style="color:#2563eb">Connectez-vous</a> puis acceptez l'invitation depuis votre profil.
        </p>
      </div>
    </div>

    <div style="text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0">
      <p style="font-size:11px;color:#94a3b8;margin:0">
        Tloush aide les francophones en Israël à comprendre leurs documents administratifs.<br>
        <a href="${siteUrl}" style="color:#2563eb">En savoir plus</a>
      </p>
    </div>
  </div>
</body>
</html>`

  try {
    await resend.emails.send({
      from: `Tloush <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
      to,
      subject: `${inviterEmail} vous invite sur Tloush (Plan Famille)`,
      html,
    })
  } catch (err) {
    console.error('[family] Failed to send invitation email:', err)
  }
}

// DELETE: Remove a family member
export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { user, supabase } = auth

    const { memberId } = await req.json()
    if (!memberId) {
      return NextResponse.json({ error: 'ID membre requis' }, { status: 400 })
    }

    // Owner can remove members
    const { error } = await supabase
      .from('family_members')
      .update({
        status: 'removed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)
      .eq('owner_id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/family/members DELETE]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
