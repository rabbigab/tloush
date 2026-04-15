import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

/**
 * /analyze etait l'ancien flow d'analyse base sur un OCR simule
 * (simulateOcrExtraction dans mockPayroll.ts). Toute cette chaine
 * (analyze -> store -> results -> history) a ete supprimee en P2.6.
 *
 * Le vrai flow d'analyse est /scanner qui appelle /api/scan (extraction
 * IA reelle). Cette route est conservee uniquement pour rediriger les
 * liens historiques (emails, bookmarks) vers /scanner.
 */
export default function AnalyzePage() {
  redirect('/scanner')
}
