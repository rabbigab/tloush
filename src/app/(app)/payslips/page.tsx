import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

/**
 * /payslips (base route) : aucune page autonome n'existe — les fiches
 * de paie sont affichees dans le dashboard (onglet documents filtre
 * par document_type='payslip'). Cette redirection evite un 404 pour
 * les liens externes / emails historiques qui pointaient vers /payslips.
 *
 * Sous-routes actives:
 *   - /payslips/annual (comparatif annuel)
 */
export default function PayslipsIndexPage() {
  redirect('/dashboard')
}
