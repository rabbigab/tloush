import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

/**
 * L'inbox a ete integre au dashboard.
 * /inbox redirige vers /dashboard pour les anciens liens.
 */
export default function InboxPage() {
  redirect('/dashboard')
}
