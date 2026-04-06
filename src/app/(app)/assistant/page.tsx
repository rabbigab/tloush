import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AssistantClient from './AssistantClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Assistant IA',
  description: 'Posez vos questions en français sur vos documents israéliens. Assistant IA contextuel.',
}

interface Props {
  searchParams: Promise<{ doc?: string }>
}

export default async function AssistantPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const params = await searchParams
  const docId = params.doc

  let document = null
  if (docId) {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('id', docId)
      .eq('user_id', user.id)
      .single()
    document = data
  }

  const { data: allDocs } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <AssistantClient
      currentDocument={document}
      allDocuments={allDocs || []}
      userEmail={user.email || ''}
    />
  )
}
