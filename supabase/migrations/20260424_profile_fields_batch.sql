-- =====================================================
-- Sprint V4.2 — Enrichissement profil, lot 2
-- =====================================================
-- Ajoute 3 champs pour activer plus d'aides du glossaire :
-- 1. discharge_date       : date précise de démobilisation IDF
--                           (remplace conceptuellement military_discharge_year
--                            pour les aides à fenêtre temporelle post-service)
-- 2. city_priority_zone   : zone de priorité nationale (A/B/C) utilisée pour
--                           crédits fiscaux périphérie + baremes arnona
-- 3. is_landlord          : loueur d'un bien résidentiel → aides fiscales
--                           loueurs (petur_mas_shkhirat_dira, yivua_meshek_bayit)
--
-- Note : receives_kitzvat_zikna (glossaire) est volontairement NON ajouté
-- car déjà couvert par receives_old_age_pension (ajouté en
-- 20260418_profile_enrichment_v2.sql) — les aides du glossaire qui
-- requièrent "receives_kitzvat_zikna" seront mappées sur le champ existant.

-- 1. Date précise de démobilisation
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS discharge_date DATE;

COMMENT ON COLUMN user_profiles.discharge_date IS
  'Date précise de démobilisation IDF. Utilisée pour les aides à fenêtre post-service (rav_kav_discharged_soldier +12 mois, nekudot_zikui_khayalim_meshukrarim +36 mois, ptor_bituakh_khayalim_meshukrarim +2 mois).';

-- 2. Zone de priorité nationale (Misrad HaPnim / Tax Authority)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS city_priority_zone TEXT
  CHECK (city_priority_zone IS NULL OR city_priority_zone IN ('a', 'b', 'c'));

COMMENT ON COLUMN user_profiles.city_priority_zone IS
  'Zone de priorité nationale : a (haute priorité, Negev/Galil/Eilat), b (priorité intermédiaire), c (priorité basse). NULL si non-périphérique ou inconnu. Débloque zikuy_mas_priferia + certains baremes arnona majorés.';

-- 3. Loueur d'un bien résidentiel
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_landlord BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN user_profiles.is_landlord IS
  'Possède un bien immobilier résidentiel qu''il loue. Débloque petur_mas_shkhirat_dira (exonération impôt loyers ≤ 67 500 NIS/an) et yivua_meshek_bayit.';
