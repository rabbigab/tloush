import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LegalWatchClient from './LegalWatchClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Veille legale — Admin Tloush',
  robots: { index: false, follow: false },
}

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

export default async function LegalWatchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/admin/legal-watch')

  if (!ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
    redirect('/dashboard')
  }

  return <LegalWatchClient />
}
