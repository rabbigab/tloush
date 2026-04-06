import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReferralClient from './ReferralClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Parrainage — Tloush',
  description: 'Parrainez vos amis et gagnez des analyses gratuites et des mois offerts.',
}

export default async function ReferralPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  return <ReferralClient />
}
