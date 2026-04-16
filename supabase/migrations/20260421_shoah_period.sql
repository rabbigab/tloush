-- =====================================================
-- Sprint V4.2 — Ajout du champ shoah_period
-- =====================================================
-- Permet de discriminer les bénéficiaires Shoah pour orienter vers
-- les bonnes aides :
-- - pre_1953  : immigrés avant 1953 (tagmul_niztolei_shoah_vatik)
-- - post_1953 : immigrés après 1953 (gmala_niztolei_shoah_misrad_haotzer)
-- - ex_urss   : survivants ex-URSS/Roumanie (kitzva_keren_sif2_claims)
--
-- Ce champ est complémentaire à is_holocaust_survivor (booléen déjà
-- existant en 20260418_profile_enrichment_v2.sql).
-- Si is_holocaust_survivor = false, shoah_period doit rester NULL.

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS shoah_period TEXT
  CHECK (shoah_period IS NULL OR shoah_period IN ('pre_1953', 'post_1953', 'ex_urss'));

COMMENT ON COLUMN user_profiles.shoah_period IS
  'Période d''éligibilité aux aides Shoah : pre_1953 (immigrés avant 1953), post_1953, ex_urss (via Keren Sif 2). NULL si non-survivant ou période inconnue.';
