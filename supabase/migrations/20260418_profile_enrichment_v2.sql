-- =====================================================
-- Sprint V4.1 — Enrichissement profil utilisateur
-- =====================================================
-- Ajout de champs permettant de detecter un maximum d'aides israeliennes
-- Base sur recherche web des baremes officiels BL, Tax Authority,
-- Misrad HaKlita, Misrad HaShikun avril 2026.

-- Genre (pour calcul precis des points de credit mere/pere)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other'));

-- Date de naissance (pour retraite, allocations age, etc.)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Conjoint — infos separees (cas couple avec un seul profil)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS spouse_gender TEXT CHECK (spouse_gender IN ('male', 'female', 'other'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS spouse_aliyah_year INTEGER CHECK (spouse_aliyah_year >= 1948 AND spouse_aliyah_year <= 2100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS spouse_monthly_income INTEGER CHECK (spouse_monthly_income >= 0);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS spouse_employment_status TEXT;

-- Service militaire / reserviste
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS served_in_idf BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS military_discharge_year INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_combat_veteran BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_active_reservist BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS miluim_days_current_year INTEGER DEFAULT 0;

-- Education
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS education_level TEXT CHECK (education_level IN (
  'none', 'high_school', 'vocational', 'ba', 'ma', 'phd', 'other'
));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_current_student BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS institution_name TEXT;

-- Situation speciale / sante
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_holocaust_survivor BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_caregiver BOOLEAN DEFAULT FALSE;  -- s'occupe d'un proche dependant
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chronic_illness BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS has_mobility_limitation BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS has_disabled_child BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_bereaved_family BOOLEAN DEFAULT FALSE;  -- famille endeuillee IDF/terror

-- Financier / dettes
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS household_income_monthly INTEGER;  -- revenu foyer combine
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_income_supplement_eligible BOOLEAN DEFAULT FALSE;  -- hashlamat hachnasa
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS has_mortgage BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS has_public_housing BOOLEAN DEFAULT FALSE;  -- diur tziburi

-- Logement detail
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS home_size_sqm INTEGER;  -- pour arnona
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS municipality TEXT;  -- mairie specifique pour baremes arnona

-- Enfants detail
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS children_with_disabilities INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS children_in_daycare INTEGER DEFAULT 0;

-- Allocations en cours (pour eviter de les "redetecter")
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS receives_kitsbat_yeladim BOOLEAN DEFAULT NULL;  -- null = unknown
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS receives_old_age_pension BOOLEAN DEFAULT NULL;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS receives_disability_pension BOOLEAN DEFAULT NULL;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS receives_income_support BOOLEAN DEFAULT NULL;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS receives_rental_assistance BOOLEAN DEFAULT NULL;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS receives_ulpan BOOLEAN DEFAULT NULL;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS receives_shoah_benefits BOOLEAN DEFAULT NULL;

-- Index pour requetes
CREATE INDEX IF NOT EXISTS idx_user_profiles_birth_date ON user_profiles (birth_date) WHERE birth_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_active_reservist ON user_profiles (is_active_reservist) WHERE is_active_reservist = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_profiles_shoah ON user_profiles (is_holocaust_survivor) WHERE is_holocaust_survivor = TRUE;
