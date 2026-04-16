-- =====================================================
-- Sprint V4.2 — Ajout du champ is_7octobre_victim
-- =====================================================
-- Permet d'identifier les victimes (ou famille de) des événements du
-- 7 octobre 2023 et de la guerre Kharvot Barzel pour les aides
-- spécifiques (sources 16 du glossaire) :
-- - maanak_sal_shikum_nifgaei_7_octobre (grant + panier réhab)
-- - kitzvat_mishpakha_nifgaei_peulot_eyva (pension famille victimes civiles)
-- - siyua_tipulim_miluim (soutien thérapeutique)
--
-- Le rights detector bloquera toutes les aides avec
-- `requires_7octobre_victim: true` si ce champ est false.
-- Booléen auto-déclaré (pas de vérification documentaire à ce stade) :
-- la validation officielle relève de Misrad HaBitahon / BL Peulot Eyva.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS is_7octobre_victim BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN user_profiles.is_7octobre_victim IS
  'Victime (ou famille de) des événements du 7 octobre 2023 / guerre Kharvot Barzel. Auto-déclaré, sans vérification documentaire.';
