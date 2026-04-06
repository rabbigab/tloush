import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FoldersClient from './FoldersClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dossiers',
  description: 'Vos documents regroupés automatiquement par émetteur.',
}

export default async function FoldersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: folders } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('name', { ascending: true })

  const { data: documents } = await supabase
    .from('documents')
    .select('id, folder_id, document_type, file_name, created_at, is_urgent, action_required, action_completed_at, summary_fr')
    .eq('user_id', user.id)
    .not('folder_id', 'is', null)
    .order('created_at', { ascending: false })

  return <FoldersClient folders={folders || []} documents={documents || []} />
}
