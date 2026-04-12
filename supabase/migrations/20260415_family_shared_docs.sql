-- =====================================================
-- Sprint 2 V4 — Family shared documents
-- =====================================================
-- Permet aux membres d'une famille de partager leurs documents
-- de maniere SELECTIVE (pas tout-ou-rien).

CREATE TABLE IF NOT EXISTS family_shared_documents (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id       UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  family_owner_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_by         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(document_id)
);

CREATE INDEX IF NOT EXISTS idx_fsd_owner ON family_shared_documents (family_owner_id);
CREATE INDEX IF NOT EXISTS idx_fsd_shared_by ON family_shared_documents (shared_by);

ALTER TABLE family_shared_documents ENABLE ROW LEVEL SECURITY;

-- Le proprietaire du foyer peut tout voir
CREATE POLICY "family_shared_docs_owner_access"
  ON family_shared_documents FOR SELECT
  USING (auth.uid() = family_owner_id);

-- Un membre actif peut voir les docs partages du meme foyer
CREATE POLICY "family_shared_docs_member_access"
  ON family_shared_documents FOR SELECT
  USING (
    auth.uid() IN (
      SELECT member_id FROM family_members
      WHERE owner_id = family_shared_documents.family_owner_id
        AND status = 'active'
    )
  );

-- Un utilisateur peut partager ses propres documents
CREATE POLICY "family_shared_docs_insert_own"
  ON family_shared_documents FOR INSERT
  WITH CHECK (auth.uid() = shared_by);

-- Un utilisateur peut arreter de partager ses propres documents
CREATE POLICY "family_shared_docs_delete_own"
  ON family_shared_documents FOR DELETE
  USING (auth.uid() = shared_by);

-- =====================================================
-- Extension de la RLS sur documents pour permettre
-- aux membres d'une famille de lire les docs partages
-- =====================================================

-- On garde la policy existante (user owns document) et on ajoute
-- une policy complementaire pour les docs partages avec la famille
CREATE POLICY "documents_family_read"
  ON documents FOR SELECT
  USING (
    -- Le user est membre actif d'un foyer dont le doc a ete partage
    id IN (
      SELECT document_id
      FROM family_shared_documents fsd
      WHERE
        -- Le user est le owner du foyer
        auth.uid() = fsd.family_owner_id
        OR
        -- Le user est un membre actif du foyer
        auth.uid() IN (
          SELECT member_id FROM family_members
          WHERE owner_id = fsd.family_owner_id
            AND status = 'active'
        )
    )
  );
