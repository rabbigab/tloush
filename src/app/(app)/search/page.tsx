import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SearchClient from './SearchClient'

export const metadata = {
  title: 'Recherche',
  description: 'Rechercher dans tous vos documents.',
}

export default async function SearchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return <SearchClient />
}
