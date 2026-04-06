import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export const metadata = {
  title: 'Mon profil',
  description: 'Gérez votre compte, vos préférences de notification et vos données.',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { count: documentCount } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return (
    <ProfileClient
      email={user.email || ''}
      displayName={user.user_metadata?.display_name || ''}
      firstName={user.user_metadata?.first_name || ''}
      lastName={user.user_metadata?.last_name || ''}
      employerName={user.user_metadata?.employer_name || ''}
      createdAt={user.created_at}
      documentCount={documentCount || 0}
    />
  )
}
