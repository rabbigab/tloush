import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

/**
 * /analyze etait l'ancien flow d'analyse de fiches de paie, base sur
 * un OCR simule (simulateOcrExtraction dans src/data/mockPayroll.ts).
 * Le vrai flow d'analyse est /scanner qui appelle /api/scan pour une
 * extraction reelle via IA.
 *
 * /analyze redirige vers /scanner pour conserver les liens historiques
 * (droits, footer, history, emails). Une fois que tous les liens
 * internes auront ete mis a jour, cette route pourra etre supprimee.
 */
export default function AnalyzePage() {
  redirect('/scanner')
}
