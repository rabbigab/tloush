import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

/**
 * /documents (base route) : pas de page index autonome — la liste des
 * documents est affichee dans le dashboard. Cette redirection evite un
 * 404 pour les liens historiques qui pointaient vers /documents.
 *
 * Sous-routes actives:
 *   - /documents/[id] (detail d'un document)
 */
export default function DocumentsIndexPage() {
  redirect('/dashboard')
}
