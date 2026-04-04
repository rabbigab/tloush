import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'

// POST: Leave a family plan (member action)
export async function POST() {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { user, supabase } = auth

    const { error } = await supabase
      .from('family_members')
      .update({
        status: 'removed',
        updated_at: new Date().toISOString(),
      })
      .eq('member_id', user.id)
      .eq('status', 'active')

    if (error) {
      return NextResponse.json({ error: 'Erreur lors du départ.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/family/leave POST]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
