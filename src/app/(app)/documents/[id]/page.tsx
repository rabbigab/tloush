import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import DocumentDetailClient from './DocumentDetailClient'

export const metadata = {
  title: 'Détail du document',
}

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: document } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!document) notFound()

  // Generate signed URL for the original file (valid 1 hour)
  let originalUrl: string | null = null
  if (document.file_path) {
    const { data: signedData } = await supabase.storage
      .from('documents')
      .createSignedUrl(document.file_path, 3600)
    originalUrl = signedData?.signedUrl || null
  }

  return <DocumentDetailClient document={document} originalUrl={originalUrl} />
}
