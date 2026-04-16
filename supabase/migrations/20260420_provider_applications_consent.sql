-- =====================================================
-- RGPD consentement pour /annuaire/inscription (audit #16)
-- =====================================================
-- La table provider_applications recoit les demandes d'inscription
-- a l'annuaire. Avant ce fix, aucun consentement n'etait collecte
-- alors que l'inscription publie des donnees personnelles (nom,
-- telephone, ville, description) sur une fiche indexee par les
-- moteurs de recherche -> necessite consentement explicite au
-- titre du RGPD art. 6.1.a + 7.

ALTER TABLE provider_applications
  ADD COLUMN IF NOT EXISTS consent_public BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS consent_cgv BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS consent_given_at TIMESTAMPTZ;

-- Index sur consent_given_at pour pouvoir purger les demandes non
-- consenties si necessaire (fallback RGPD : droit a l'effacement)
CREATE INDEX IF NOT EXISTS provider_applications_consent_given_at_idx
  ON provider_applications (consent_given_at)
  WHERE consent_given_at IS NOT NULL;

-- Contrainte : on ne devrait jamais avoir consent_given_at renseigne
-- si l'un des deux consentements est faux. L'API doit refuser
-- la soumission avant d'arriver a la DB, mais garde-fou defensif.
ALTER TABLE provider_applications
  DROP CONSTRAINT IF EXISTS provider_applications_consent_coherent;
ALTER TABLE provider_applications
  ADD CONSTRAINT provider_applications_consent_coherent
  CHECK (
    consent_given_at IS NULL
    OR (consent_public = TRUE AND consent_cgv = TRUE)
  );

COMMENT ON COLUMN provider_applications.consent_public IS
  'Consentement explicite a la publication publique de la fiche (RGPD art. 6.1.a)';
COMMENT ON COLUMN provider_applications.consent_cgv IS
  'Consentement explicite aux CGV et a la politique de confidentialite';
COMMENT ON COLUMN provider_applications.consent_given_at IS
  'Timestamp de la soumission avec consentement valide';
