-- =====================================================
-- Sprint 3 V4 — Miluim tracker
-- =====================================================
-- Tracking des periodes de reserve militaire + compensation Bituach Leumi

CREATE TABLE IF NOT EXISTS miluim_periods (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Dates et duree
  start_date            DATE NOT NULL,
  end_date              DATE NOT NULL,
  days_count            INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,

  -- Context
  unit                  TEXT,
  service_type          TEXT CHECK (service_type IN ('regular', 'emergency', 'training', 'other')),
  tzav_document_id      UUID REFERENCES documents(id) ON DELETE SET NULL,
  notes                 TEXT,

  -- Compensation
  daily_compensation    NUMERIC(10, 2),
  total_compensation    NUMERIC(12, 2),
  employer_reimbursed   BOOLEAN DEFAULT FALSE,
  bl_reimbursed         BOOLEAN DEFAULT FALSE,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_miluim_user_date ON miluim_periods (user_id, start_date DESC);

ALTER TABLE miluim_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "miluim_owner_all"
  ON miluim_periods FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_miluim_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_miluim_updated_at ON miluim_periods;
CREATE TRIGGER trigger_miluim_updated_at
  BEFORE UPDATE ON miluim_periods
  FOR EACH ROW
  EXECUTE FUNCTION update_miluim_updated_at();
