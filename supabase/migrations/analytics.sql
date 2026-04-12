-- =====================================================
-- Tloush — Analytics visiteurs (site-wide)
-- Date: 2026-04-09
-- =====================================================

-- Table des vues de page
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT, -- hash de l'IP pour compter les visiteurs uniques sans stocker l'IP
  country TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT, -- anonyme, genere cote client et stocke dans localStorage
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_user ON page_views(user_id);

-- RLS : insertion publique (pour tracker), lecture admin uniquement
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_views_public_insert" ON page_views
  FOR INSERT WITH CHECK (true);

-- Pas de policy SELECT publique : seul le service_role key (admin) peut lire
