import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'

// POST: Accept a family invitation (auto-match by email)
export async function POST() {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { user, supabase } = auth

    const email = user.email?.toLowerCase()
    if (!email) {
      return NextResponse.json({ error: 'Email non disponible' }, { status: 400 })
    }

    // Find pending invitation for this email
    const { data: invitation } = await supabase
      .from('family_members')
      .select('id, owner_id')
      .eq('member_email', email)
      .eq('status', 'pending')
      .single()

    if (!invitation) {
      return NextResponse.json(
        { error: 'Aucune invitation en attente.' },
        { status: 404 }
      )
    }

    // Accept the invitation
    const { error } = await supabase
      .from('family_members')
      .update({
        member_id: user.id,
        status: 'active',
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitation.id)

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de l\'acceptation.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, ownerId: invitation.owner_id })
  } catch (err) {
    console.error('[/api/family/join POST]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// GET: Check if the current user has a pending family invitation
export async function GET() {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { user, supabase } = auth

    const email = user.email?.toLowerCase()
    if (!email) {
      return NextResponse.json({ hasPendingInvite: false })
    }

    const { data: invitation } = await supabase
      .from('family_members')
      .select('id, owner_id')
      .eq('member_email', email)
      .eq('status', 'pending')
      .single()

    return NextResponse.json({
      hasPendingInvite: !!invitation,
      invitationId: invitation?.id || null,
    })
  } catch (err) {
    console.error('[/api/family/join GET]', err)
    return NextResponse.json({ hasPendingInvite: false })
  }
}
