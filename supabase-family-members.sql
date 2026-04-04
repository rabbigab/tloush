-- =============================================
-- TLOUSH V3 — Family Members (Plan Famille)
-- À exécuter dans Supabase > SQL Editor
-- Prérequis : supabase-subscriptions.sql déjà exécuté
-- =============================================

-- Table des membres de famille
CREATE TABLE family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,   -- propriétaire du plan famille
  member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,           -- NULL si invitation en attente
  member_email TEXT NOT NULL,                                            -- email du membre invité
  status TEXT NOT NULL DEFAULT 'pending',                                -- 'pending', 'active', 'removed'
  invite_token UUID DEFAULT gen_random_uuid(),                           -- token pour accepter l'invitation
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_id, member_email)
);

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Le propriétaire peut tout voir/gérer
CREATE POLICY "owner_manages_family" ON family_members
  FOR ALL USING (auth.uid() = owner_id);

-- Un membre peut voir sa propre entrée
CREATE POLICY "member_sees_own" ON family_members
  FOR SELECT USING (auth.uid() = member_id);

-- =============================================
-- Index
-- =============================================

CREATE INDEX idx_family_members_owner ON family_members(owner_id);
CREATE INDEX idx_family_members_member ON family_members(member_id);
CREATE INDEX idx_family_members_email ON family_members(member_email);
CREATE INDEX idx_family_members_token ON family_members(invite_token);

-- =============================================
-- Politique RLS pour usage_tracking : permettre au propriétaire
-- de voir l'usage de ses membres famille
-- =============================================

CREATE POLICY "owner_sees_family_usage" ON usage_tracking
  FOR SELECT USING (
    auth.uid() IN (
      SELECT owner_id FROM family_members
      WHERE member_id = usage_tracking.user_id
      AND status = 'active'
    )
  );
