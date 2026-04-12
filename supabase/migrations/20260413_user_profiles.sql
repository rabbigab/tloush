-- =====================================================
-- Sprint 0 V4 — Profil utilisateur enrichi
-- =====================================================
-- Debloque les features tax refund, miluim, rights detector
-- qui necessitent le contexte personnel de l'utilisateur.

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Situation familiale
  marital_status     TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed', 'separated')),
  spouse_user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  children_count     INTEGER DEFAULT 0 CHECK (children_count >= 0 AND children_count <= 20),
  children_birth_dates DATE[] DEFAULT '{}',

  -- Alyah / immigration
  aliyah_year        INTEGER CHECK (aliyah_year >= 1948 AND aliyah_year <= 2100),
  country_of_origin  TEXT,
  israeli_citizen    BOOLEAN DEFAULT true,

  -- Situation professionnelle
  employment_status  TEXT CHECK (employment_status IN ('employed', 'self_employed', 'unemployed', 'student', 'retired', 'reservist', 'parental_leave')),
  employer_sector    TEXT,
  monthly_income     INTEGER CHECK (monthly_income >= 0),

  -- Sante
  disability_level   INTEGER CHECK (disability_level BETWEEN 0 AND 100),
  kupat_holim        TEXT CHECK (kupat_holim IN ('clalit', 'maccabi', 'meuhedet', 'leumit')),

  -- Logement
  city               TEXT,
  housing_status     TEXT CHECK (housing_status IN ('renter', 'owner', 'living_with_family', 'other')),

  -- Meta
  profile_completion_pct INTEGER DEFAULT 0 CHECK (profile_completion_pct BETWEEN 0 AND 100),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les requetes frequentes
CREATE INDEX IF NOT EXISTS idx_user_profiles_aliyah ON user_profiles (aliyah_year) WHERE aliyah_year IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_employment ON user_profiles (employment_status) WHERE employment_status IS NOT NULL;

-- RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_profile_select"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_own_profile_insert"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_own_profile_update"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users_own_profile_delete"
  ON user_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER trigger_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();
