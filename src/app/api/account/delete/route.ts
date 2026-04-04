import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/apiAuth'

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { user, supabase } = auth

    // 1. Supprimer tous les fichiers du Storage
    const { data: files } = await supabase.storage
      .from('documents')
      .list(user.id)

    if (files && files.length > 0) {
      const paths = files.map(f => `${user.id}/${f.name}`)
      await supabase.storage.from('documents').remove(paths)
    }

    // 2. Supprimer les données DB (cascade via FK pour conversations + messages)
    await supabase.from('documents').delete().eq('user_id', user.id)
    await supabase.from('conversations').delete().eq('user_id', user.id)

    // 3. Nettoyer family_members (invitations envoyées + memberships)
    await supabase.from('family_members').delete().eq('owner_id', user.id)
    await supabase.from('family_members').update({ member_id: null, status: 'removed' }).eq('member_id', user.id)

    // 3. Supprimer l'utilisateur Auth (nécessite le service role)
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    await adminClient.auth.admin.deleteUser(user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/account/delete]', err)
    return NextResponse.json({ error: 'Erreur lors de la suppression du compte' }, { status: 500 })
  }
}
