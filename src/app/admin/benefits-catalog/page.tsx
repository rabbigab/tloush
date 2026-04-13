import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BenefitsCatalogClient from './BenefitsCatalogClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Catalogue de benefices — Admin Tloush',
  robots: { index: false, follow: false },
}

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

export default async function BenefitsCatalogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/admin/benefits-catalog')

  if (!ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
    redirect('/dashboard')
  }

  return <BenefitsCatalogClient />
}
