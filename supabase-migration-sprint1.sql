-- =============================================
-- TLOUSH V3 — Migration Sprint 1
-- Deadlines, rappels, actions completees
-- A executer dans Supabase > SQL Editor
-- =============================================

-- 1. Ajouter colonne deadline aux documents
ALTER TABLE documents ADD COLUMN IF NOT EXISTS deadline DATE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS action_completed_at TIMESTAMPTZ;

-- Index pour les requetes de deadlines
CREATE INDEX IF NOT EXISTS idx_documents_deadline ON documents(deadline)
  WHERE deadline IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_documents_action_required ON documents(action_required)
  WHERE action_required = true;

-- 2. Table de log des rappels envoyes (eviter doublons)
CREATE TABLE IF NOT EXISTS reminder_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('7_days', '2_days', 'due_today')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, reminder_type)
);

ALTER TABLE reminder_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_reminders" ON reminder_log
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reminder_log_document ON reminder_log(document_id);

-- 3. Mettre a jour les documents existants : extraire deadline de analysis_data
-- Cette requete parse le champ key_info.deadline et essaie de le convertir en DATE
-- Elle ne touchera que les documents qui ont un deadline texte mais pas encore de deadline DATE
UPDATE documents
SET deadline = CASE
  -- Format JJ/MM/AAAA
  WHEN analysis_data->'key_info'->>'deadline' ~ '^\d{2}/\d{2}/\d{4}$'
  THEN TO_DATE(analysis_data->'key_info'->>'deadline', 'DD/MM/YYYY')
  -- Format DD.MM.YYYY
  WHEN analysis_data->'key_info'->>'deadline' ~ '^\d{2}\.\d{2}\.\d{4}$'
  THEN TO_DATE(analysis_data->'key_info'->>'deadline', 'DD.MM.YYYY')
  -- Format YYYY-MM-DD
  WHEN analysis_data->'key_info'->>'deadline' ~ '^\d{4}-\d{2}-\d{2}$'
  THEN TO_DATE(analysis_data->'key_info'->>'deadline', 'YYYY-MM-DD')
  ELSE NULL
END
WHERE deadline IS NULL
  AND analysis_data->'key_info'->>'deadline' IS NOT NULL
  AND analysis_data->'key_info'->>'deadline' != 'null'
  AND analysis_data->'key_info'->>'deadline' != '';
