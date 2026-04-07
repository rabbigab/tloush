import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/apiAuth'

// Change user plan
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id: userId } = await params
  const body = await req.json()
  const planId = body.plan_id

  if (!['free', 'solo', 'family'].includes(planId)) {
    return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Check if subscription exists
    const { data: existing } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (existing) {
      await supabaseAdmin
        .from('subscriptions')
        .update({
          plan_id: planId,
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
    } else {
      await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        })
    }

    return NextResponse.json({ success: true, plan_id: planId })
  } catch (err) {
    console.error('[Admin PATCH user plan]', err)
    return NextResponse.json({ error: 'Erreur lors du changement de plan' }, { status: 500 })
  }
}

// Delete user account
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth
  const { user } = auth

  const { id: userId } = await params

  // 3. Prevent self-deletion
  if (userId === user.id) {
    return NextResponse.json({ error: 'Impossible de supprimer votre propre compte' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // 4. Delete user's storage files
    const { data: docs } = await supabaseAdmin
      .from('documents')
      .select('file_path')
      .eq('user_id', userId)

    if (docs && docs.length > 0) {
      const paths = docs.map(d => d.file_path).filter(Boolean)
      if (paths.length > 0) {
        await supabaseAdmin.storage.from('documents').remove(paths)
      }
    }

    // 5. Delete user data from all tables
    await Promise.all([
      supabaseAdmin.from('documents').delete().eq('user_id', userId),
      supabaseAdmin.from('conversations').delete().eq('user_id', userId),
      supabaseAdmin.from('folders').delete().eq('user_id', userId),
      supabaseAdmin.from('recurring_expenses').delete().eq('user_id', userId),
      supabaseAdmin.from('usage_tracking').delete().eq('user_id', userId),
      supabaseAdmin.from('subscriptions').delete().eq('user_id', userId),
      supabaseAdmin.from('user_preferences').delete().eq('user_id', userId),
      supabaseAdmin.from('family_members').delete().eq('owner_id', userId),
      supabaseAdmin.from('reminder_log').delete().eq('user_id', userId),
    ])

    // 6. Delete auth user
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (error) {
      console.error('Error deleting auth user:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Admin DELETE user]', err)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
