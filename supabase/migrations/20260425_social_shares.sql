-- ============================================================
-- social_shares — Parrainage via partage sur groupes Facebook
-- ============================================================
-- Feature "1 mois gratuit si tu postes dans un groupe FB francophone"
-- Flow : user poste sur FB → soumet l'URL → admin valide →
-- code promo Stripe genere et envoye par email.
--
-- Contrainte : 1 seul partage par utilisateur (UNIQUE user_id).
-- Cap global de 200 codes distribues, verifie cote API.

CREATE TABLE IF NOT EXISTS social_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_url TEXT NOT NULL,
  group_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  promo_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  UNIQUE (user_id)
);

-- Index pour les requetes admin (listing par status)
CREATE INDEX IF NOT EXISTS idx_social_shares_status ON social_shares(status);

-- RLS : les utilisateurs voient uniquement leur propre ligne
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own share"
  ON social_shares FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own share"
  ON social_shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les admins (via service_role_key) ont acces complet — pas besoin
-- de policy specifique car le client admin utilise getAdminClient().
