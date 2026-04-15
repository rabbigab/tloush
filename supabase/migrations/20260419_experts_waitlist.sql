-- =====================================================
-- /experts waitlist — persistance des inscriptions
-- =====================================================
-- Avant ce fix, le formulaire de waitlist sur /experts simulait une
-- soumission (await new Promise) sans rien sauvegarder. Cette table
-- capture les emails des utilisateurs interesses par l'annuaire
-- d'experts francophones (comptables, avocats), avec categorie
-- optionnelle et metadata legere.

CREATE TABLE IF NOT EXISTS experts_waitlist (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL,
  category        TEXT CHECK (category IN ('comptable', 'avocat', 'any')),
  -- user_id nullable: la page /experts est publique (listee dans
  -- PUBLIC_ROUTES du middleware), un visiteur non connecte peut
  -- s'inscrire a la waitlist
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source          TEXT DEFAULT 'experts_page',
  ip_hash         TEXT,
  user_agent      TEXT,
  notified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Un meme email ne doit pas apparaitre plusieurs fois pour la meme categorie
CREATE UNIQUE INDEX IF NOT EXISTS experts_waitlist_email_category_key
  ON experts_waitlist (LOWER(email), COALESCE(category, 'any'));

CREATE INDEX IF NOT EXISTS experts_waitlist_created_at_idx
  ON experts_waitlist (created_at DESC);

CREATE INDEX IF NOT EXISTS experts_waitlist_user_id_idx
  ON experts_waitlist (user_id)
  WHERE user_id IS NOT NULL;

-- RLS: seules les fonctions server-side (service_role) peuvent lire/ecrire.
-- L'API route /api/experts/waitlist utilise le service role key.
ALTER TABLE experts_waitlist ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs connectes peuvent voir uniquement leurs propres entrees
DROP POLICY IF EXISTS "users_read_own_waitlist" ON experts_waitlist;
CREATE POLICY "users_read_own_waitlist" ON experts_waitlist
  FOR SELECT
  USING (auth.uid() = user_id);

COMMENT ON TABLE experts_waitlist IS
  'Waitlist /experts — emails collectes en attendant l''annuaire francophone.';
