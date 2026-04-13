import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RightsDetectorClient from './RightsDetectorClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Mes droits detectes — Tloush',
  description: 'Decouvrez les droits et aides auxquels vous avez potentiellement droit.',
}

export default async function RightsDetectorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/rights-detector')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('profile_completion_pct')
    .eq('user_id', user.id)
    .maybeSingle()

  // Seuil relache : des qu'un profil existe (meme a 0%), on laisse acceder
  // au detecteur. Le scan retourne les benefices sans conditions + ceux qui
  // matchent le peu de donnees disponibles, et incite a completer le profil.
  return <RightsDetectorClient profileComplete={!!profile} />
}
