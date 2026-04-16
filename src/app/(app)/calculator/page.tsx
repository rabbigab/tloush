import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

/**
 * /calculator était l'ancien flow de simulation brut/net dans la zone
 * authentifiée. /calculateurs/brut-net (public) est désormais la route
 * canonique : même logique de calcul (via src/lib/israeliPayroll.ts),
 * meilleure URL SEO, pas d'auth requise.
 *
 * Cette route est conservée comme redirect 307 pour ne pas casser les
 * bookmarks / liens emails historiques. Peut être supprimée dans une
 * passe de nettoyage future si le dashboard ne la référence plus.
 *
 * Reference : docs/audits/technical-mapping.md #17.
 */
export default function CalculatorPage() {
  redirect('/calculateurs/brut-net')
}
