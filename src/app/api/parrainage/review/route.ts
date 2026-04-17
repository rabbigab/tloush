import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { randomBytes } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorise.' }, { status: 401 })
    }

    // Admin check
    const adminSupabase = getAdminClient()
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Non autorise.' }, { status: 403 })
    }

    const body = await req.json()
    const { share_id, action } = body as { share_id: string; action: 'approve' | 'reject' }

    if (!share_id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Parametres invalides.' }, { status: 400 })
    }

    if (action === 'approve') {
      const promoCode = `TLOUSH-FB-${randomBytes(3).toString('hex').toUpperCase()}`

      const { error } = await adminSupabase
        .from('social_shares')
        .update({
          status: 'approved',
          promo_code: promoCode,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq('id', share_id)
        .eq('status', 'pending')

      if (error) {
        console.error('[parrainage/review] approve error:', error)
        return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
      }

      return NextResponse.json({ ok: true, promo_code: promoCode })
    }

    // Reject
    const { error } = await adminSupabase
      .from('social_shares')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq('id', share_id)
      .eq('status', 'pending')

    if (error) {
      console.error('[parrainage/review] reject error:', error)
      return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[parrainage/review]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
