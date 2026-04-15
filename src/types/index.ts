// ============================================================
// TLOUSH -- Types & Interfaces centraux
// ============================================================
//
// Note: les types lies a l'ancien flow /analyze (PayrollDocument,
// UserContext, FinalReport, AnalysisFlag, etc.) ont ete supprimes
// en P2.6 lorsque le graphe de code associe (mockPayroll,
// analysisStore, reportBuilder, ruleEngine, questionnaireLogic,
// /analyze, /results, /history, components/report/*, components/
// questionnaire/*, components/extraction/*) a ete nettoye.
//
// Pour l'historique : ce flow etait base sur un OCR simule
// (simulateOcrExtraction) et affichait des donnees fictives aux
// utilisateurs. Le vrai flow d'analyse est /scanner (voir
// src/app/scanner/page.tsx) qui appelle /api/scan avec extraction
// IA reelle.

/** Document as stored in DB and used across app views (inbox, dashboard, assistant). */
export interface AppDocument {
  id: string
  file_name: string
  file_type: string
  document_type: string
  status: string
  is_urgent: boolean
  summary_fr: string | null
  action_required: boolean
  action_description: string | null
  period: string | null
  analysis_data?: Record<string, unknown>
  created_at: string
  file_path?: string | null
  folder_id?: string | null
  deadline?: string | null
  action_completed_at?: string | null
}
