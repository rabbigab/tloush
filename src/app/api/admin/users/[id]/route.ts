import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Auth check
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // 2. Admin check
  if (!ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

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
