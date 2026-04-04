import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { getSubscription } from '@/lib/subscription'

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

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

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

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/family/members POST]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
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
