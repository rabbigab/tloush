import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MiluimClient from './MiluimClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Miluim',
  description: 'Suivez vos periodes de miluim et estimez votre compensation Bituach Leumi.',
}

export default async function MiluimPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/miluim')

  return <MiluimClient />
}
