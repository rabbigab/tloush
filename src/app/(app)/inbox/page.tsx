import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InboxClient from './InboxClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Mon inbox',
  description: 'Vos documents israéliens analysés en français avec alertes visuelles.',
}

export default async function InboxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [documentsRes, foldersRes] = await Promise.all([
    supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('folders')
      .select('id, name')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('name', { ascending: true }),
  ])

  return <InboxClient documents={documentsRes.data || []} folders={foldersRes.data || []} userEmail={user.email || ''} />
}
