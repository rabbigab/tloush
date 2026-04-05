import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/apiAuth'
import { getSubscription } from '@/lib/subscription'
import { stripe } from '@/lib/stripe'

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { user, supabase } = auth

    // 0. Annuler l'abonnement Stripe actif si existant (avant suppression DB)
    try {
      const sub = await getSubscription(supabase, user.id)
      if (sub.stripeSubscriptionId) {
        await stripe.subscriptions.cancel(sub.stripeSubscriptionId)
        console.log(`[account/delete] Stripe subscription ${sub.stripeSubscriptionId} cancelled`)
      }
    } catch (stripeErr) {
      // Non-bloquant : on continue la suppression même si Stripe échoue
      console.warn('[account/delete] Stripe cancellation failed (non-blocking):', stripeErr)
    }

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

    // 4. Supprimer les données personnelles restantes (RGPD — droit à l'oubli)
    await supabase.from('subscriptions').delete().eq('user_id', user.id)
    await supabase.from('usage_tracking').delete().eq('user_id', user.id)
    await supabase.from('user_preferences').delete().eq('user_id', user.id)
    await supabase.from('recurring_expenses').delete().eq('user_id', user.id)

    // 5. Supprimer l'utilisateur Auth (nécessite le service role)
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
