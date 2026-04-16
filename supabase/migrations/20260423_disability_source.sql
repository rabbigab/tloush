-- =====================================================
-- Sprint V4.2 — Ajout du champ disability_source
-- =====================================================
-- Précise l'origine de l'invalidité déclarée (disability_level > 0),
-- pour discriminer les aides entre :
-- - idf     : invalide de Tsahal (Nakhei Tsahal) → aides Misrad HaBitahon
--             (tagmul_basissi_nakhei_tsahal, TOKA, hanakha_arnona_nakhim...)
-- - work    : accident du travail → aides BL Nifgaei Avoda
-- - general : invalidité générale → aides BL Nakhut Klalit + arnona_disability
--
-- Le rights detector bloquera les aides "IDF invalides"
-- (required_disability_source = 'idf') si ce champ est différent.
--
-- Champ NULLable : un profil sans invalidité (disability_level = 0/null)
-- n'a pas besoin de préciser la source.

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS disability_source TEXT
  CHECK (disability_source IS NULL OR disability_source IN ('idf', 'work', 'general'));

COMMENT ON COLUMN user_profiles.disability_source IS
  'Origine de l''invalidité : idf (Nakhei Tsahal), work (accident travail), general (Nakhut Klalit). NULL si pas d''invalidité reconnue.';
