import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FamilyClient from './FamilyClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Ma famille — Tloush',
  description: 'Gerez votre foyer et les documents partages avec votre famille.',
}

export default async function FamilyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/family')

  return <FamilyClient userEmail={user.email || ''} />
}
