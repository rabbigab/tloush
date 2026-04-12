-- =====================================================
-- Sprint 6 V4 — Automatic rights detector (MVP 10 regles)
-- =====================================================
-- Scan le profil utilisateur + ses documents pour detecter
-- les droits/aides non reclames.

CREATE TABLE IF NOT EXISTS detected_rights (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identification du droit (slug stable)
  right_slug       TEXT NOT NULL,
  right_title_fr   TEXT NOT NULL,
  right_description_fr TEXT NOT NULL,
  authority        TEXT NOT NULL,
  category         TEXT NOT NULL,

  -- Scoring
  confidence_score NUMERIC(3, 2) NOT NULL CHECK (confidence_score BETWEEN 0 AND 1),
  confidence_level TEXT NOT NULL CHECK (confidence_level IN ('high', 'medium', 'low')),

  -- Valeur potentielle
  estimated_value  NUMERIC(12, 2),
  value_unit       TEXT DEFAULT 'NIS/an',

  -- Source de detection
  source           TEXT NOT NULL CHECK (source IN ('profile', 'document', 'cross_ref')),
  source_doc_id    UUID REFERENCES documents(id) ON DELETE SET NULL,

  -- Status utilisateur
  status           TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'claimed', 'dismissed', 'verified')),
  status_note      TEXT,

  -- Action
  action_url       TEXT,
  action_label     TEXT,
  disclaimer       TEXT,

  -- Meta
  detected_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, right_slug)
);

CREATE INDEX IF NOT EXISTS idx_detected_rights_user_status ON detected_rights (user_id, status);
CREATE INDEX IF NOT EXISTS idx_detected_rights_confidence ON detected_rights (confidence_level);

ALTER TABLE detected_rights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "detected_rights_owner_all"
  ON detected_rights FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_detected_rights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_detected_rights_updated_at ON detected_rights;
CREATE TRIGGER trigger_detected_rights_updated_at
  BEFORE UPDATE ON detected_rights
  FOR EACH ROW
  EXECUTE FUNCTION update_detected_rights_updated_at();
