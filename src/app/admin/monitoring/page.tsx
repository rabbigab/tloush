import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MonitoringClient from './MonitoringClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Monitoring — Admin Tloush',
  robots: { index: false, follow: false },
}

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

export default async function MonitoringPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/admin/monitoring')

  const isEnvAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')
  if (!isEnvAdmin) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    if (!profile?.is_admin) redirect('/dashboard')
  }

  return <MonitoringClient />
}
