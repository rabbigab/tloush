-- =====================================================
-- Sprint 1 V4 — Admin monitoring
-- =====================================================
-- Observabilite : perf, couts Claude, erreurs.

-- 1. Ajout de colonnes de tracking sur documents
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS tokens_in INTEGER,
  ADD COLUMN IF NOT EXISTS tokens_out INTEGER,
  ADD COLUMN IF NOT EXISTS duration_ms INTEGER,
  ADD COLUMN IF NOT EXISTS error_code TEXT,
  ADD COLUMN IF NOT EXISTS model_used TEXT,
  ADD COLUMN IF NOT EXISTS cost_usd NUMERIC(10, 6);

CREATE INDEX IF NOT EXISTS idx_documents_error_code ON documents (error_code) WHERE error_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_duration ON documents (duration_ms) WHERE duration_ms IS NOT NULL;

-- 2. Table error_log pour les erreurs serveur
CREATE TABLE IF NOT EXISTS error_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  endpoint      TEXT NOT NULL,
  error_code    TEXT,
  error_message TEXT NOT NULL,
  stack_trace   TEXT,
  severity      TEXT NOT NULL DEFAULT 'error' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  resolved      BOOLEAN DEFAULT FALSE,
  resolved_note TEXT,
  occurrence_count INTEGER DEFAULT 1,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_error_log_severity_created ON error_log (severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_log_endpoint ON error_log (endpoint);
CREATE INDEX IF NOT EXISTS idx_error_log_resolved ON error_log (resolved);

ALTER TABLE error_log ENABLE ROW LEVEL SECURITY;

-- Seul le service_role peut ecrire dans error_log (lectures admin via API dediee)
CREATE POLICY "error_log_service_insert"
  ON error_log FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "error_log_service_update"
  ON error_log FOR UPDATE
  USING (auth.role() = 'service_role');

-- 3. Table claude_usage pour tracker les appels Claude
CREATE TABLE IF NOT EXISTS claude_usage (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  document_id  UUID REFERENCES documents(id) ON DELETE SET NULL,
  route        TEXT NOT NULL,
  model        TEXT NOT NULL,
  tokens_in    INTEGER NOT NULL DEFAULT 0,
  tokens_out   INTEGER NOT NULL DEFAULT 0,
  cache_read_tokens INTEGER DEFAULT 0,
  cache_write_tokens INTEGER DEFAULT 0,
  duration_ms  INTEGER,
  cost_usd     NUMERIC(10, 6) NOT NULL DEFAULT 0,
  success      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claude_usage_created ON claude_usage (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_claude_usage_user ON claude_usage (user_id);
CREATE INDEX IF NOT EXISTS idx_claude_usage_route ON claude_usage (route);

ALTER TABLE claude_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "claude_usage_service_insert"
  ON claude_usage FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- 4. Vue agregat journalier (simule une materialized view qu'on refresh via cron si necessaire)
CREATE OR REPLACE VIEW admin_daily_stats AS
SELECT
  DATE(created_at) AS day,
  route,
  COUNT(*) AS total_calls,
  COUNT(*) FILTER (WHERE success = TRUE) AS success_count,
  COUNT(*) FILTER (WHERE success = FALSE) AS error_count,
  SUM(tokens_in) AS total_tokens_in,
  SUM(tokens_out) AS total_tokens_out,
  SUM(cost_usd) AS total_cost_usd,
  AVG(duration_ms) FILTER (WHERE duration_ms IS NOT NULL) AS avg_duration_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms) AS p50_duration_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) AS p95_duration_ms
FROM claude_usage
GROUP BY DATE(created_at), route;
