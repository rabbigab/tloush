# Runbook — Migrations Supabase avant merge des lots 2/3/4

> **But** : appliquer les 4 migrations requises par les PRs #14/#15/#16/#17 sur l'environnement Supabase de prod (+ staging si dispo) **avant** de merger la cascade de lots.
>
> **Sans ces migrations**, les endpoints suivants tomberont en erreur 500 après merge :
> - `/api/rights-detector` (table `detected_rights` manquante)
> - `/experts` (table `experts_waitlist` manquante)
> - `/annuaire/inscription` (colonnes `consent_public` / `consent_cgv` manquantes)

---

## Étape 0 — Accéder au SQL Editor Supabase

1. Ouvrir https://supabase.com/dashboard
2. Se connecter avec le compte propriétaire du projet `tloush`
3. Sélectionner le projet `tloush` (prod)
4. Menu gauche → **SQL Editor** (icône `</> SQL`)
5. **+ New query** en haut à droite

> ⚠️ Si un environnement de **staging** existe, faire les migrations dessus en premier et valider, puis répéter sur prod. Sinon, appliquer directement sur prod en **vérifiant le nom du projet en haut à gauche** avant chaque requête.

---

## Étape 1 — `20260417_rights_detector.sql`

### Localisation
- Repo local : `supabase/migrations/20260417_rights_detector.sql`
- GitHub : https://github.com/rabbigab/tloush/blob/main/supabase/migrations/20260417_rights_detector.sql

### Effet
- Crée la table `detected_rights` (stocke les droits détectés par l'IA par utilisateur)
- Ajoute 2 index : `idx_detected_rights_user_status`, `idx_detected_rights_confidence`
- Active RLS + policy "owner_all" (chaque user voit uniquement ses propres droits)
- Crée le trigger `trigger_detected_rights_updated_at` (auto-maj de `updated_at`)

### SQL à coller

```sql
CREATE TABLE IF NOT EXISTS detected_rights (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  right_slug       TEXT NOT NULL,
  right_title_fr   TEXT NOT NULL,
  right_description_fr TEXT NOT NULL,
  authority        TEXT NOT NULL,
  category         TEXT NOT NULL,
  confidence_score NUMERIC(3, 2) NOT NULL CHECK (confidence_score BETWEEN 0 AND 1),
  confidence_level TEXT NOT NULL CHECK (confidence_level IN ('high', 'medium', 'low')),
  estimated_value  NUMERIC(12, 2),
  value_unit       TEXT DEFAULT 'NIS/an',
  source           TEXT NOT NULL CHECK (source IN ('profile', 'document', 'cross_ref')),
  source_doc_id    UUID REFERENCES documents(id) ON DELETE SET NULL,
  status           TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'claimed', 'dismissed', 'verified')),
  status_note      TEXT,
  action_url       TEXT,
  action_label     TEXT,
  disclaimer       TEXT,
  detected_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, right_slug)
);

CREATE INDEX IF NOT EXISTS idx_detected_rights_user_status ON detected_rights (user_id, status);
CREATE INDEX IF NOT EXISTS idx_detected_rights_confidence ON detected_rights (confidence_level);

ALTER TABLE detected_rights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "detected_rights_owner_all"
  ON detected_rights FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_detected_rights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_detected_rights_updated_at ON detected_rights;
CREATE TRIGGER trigger_detected_rights_updated_at
  BEFORE UPDATE ON detected_rights
  FOR EACH ROW
  EXECUTE FUNCTION update_detected_rights_updated_at();
```

### Vérification

```sql
SELECT COUNT(*) FROM detected_rights;
-- Attendu : 0 (table créée, vide)

SELECT COUNT(*) FROM pg_policies WHERE tablename = 'detected_rights';
-- Attendu : 1 (la policy "detected_rights_owner_all")
```

---

## Étape 2 — `20260418_profile_enrichment_v2.sql`

### Localisation
- Repo local : `supabase/migrations/20260418_profile_enrichment_v2.sql`
- GitHub : https://github.com/rabbigab/tloush/blob/main/supabase/migrations/20260418_profile_enrichment_v2.sql

### Effet
Enrichit la table `user_profiles` existante avec **~35 colonnes** pour améliorer la détection de droits : genre, date naissance, infos conjoint, service militaire, éducation, handicaps, revenus foyer, logement, enfants, allocations déjà perçues.

**100% additive** (que des `ADD COLUMN IF NOT EXISTS`) — aucun risque sur les données existantes.

### SQL à coller

```sql
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS spouse_gender TEXT CHECK (spouse_gender IN ('male', 'female', 'other'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS spouse_aliyah_year INTEGER CHECK (spouse_aliyah_year >= 1948 AND spouse_aliyah_year <= 2100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS spouse_monthly_income INTEGER CHECK (spouse_monthly_income >= 0);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS spouse_employment_status TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS served_in_idf BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS military_discharge_year INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_combat_veteran BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_active_reservist BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS miluim_days_current_year INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS education_level TEXT CHECK (education_level IN ('none', 'high_school', 'vocational', 'ba', 'ma', 'phd', 'other'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_current_student BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS institution_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_holocaust_survivor BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_caregiver BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chronic_illness BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS has_mobility_limitation BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS has_disabled_child BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_bereaved_family BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS household_income_monthly INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_income_supplement_eligible BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS has_mortgage BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS has_public_housing BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS home_size_sqm INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS municipality TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS children_with_disabilities INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS children_in_daycare INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS receives_kitsbat_yeladim BOOLEAN DEFAULT NULL;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS receives_old_age_pension BOOLEAN DEFAULT NULL;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS receives_disability_pension BOOLEAN DEFAULT NULL;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS receives_income_support BOOLEAN DEFAULT NULL;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS receives_rental_assistance BOOLEAN DEFAULT NULL;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS receives_ulpan BOOLEAN DEFAULT NULL;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS receives_shoah_benefits BOOLEAN DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_birth_date ON user_profiles (birth_date) WHERE birth_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_active_reservist ON user_profiles (is_active_reservist) WHERE is_active_reservist = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_profiles_shoah ON user_profiles (is_holocaust_survivor) WHERE is_holocaust_survivor = TRUE;
```

### Vérification

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_profiles'
  AND column_name IN ('birth_date', 'gender', 'served_in_idf', 'is_holocaust_survivor', 'household_income_monthly')
ORDER BY column_name;
-- Attendu : 5 lignes (birth_date, gender, household_income_monthly, is_holocaust_survivor, served_in_idf)
```

---

## Étape 3 — `20260419_experts_waitlist.sql`

### Localisation
- Repo local : `supabase/migrations/20260419_experts_waitlist.sql`
- GitHub : https://github.com/rabbigab/tloush/blob/main/supabase/migrations/20260419_experts_waitlist.sql

### Effet
- Crée la table `experts_waitlist` (pour capturer les emails sur `/experts`)
- Index unique `(lower(email), category)` — empêche les doublons
- RLS activée + policy "users_read_own_waitlist"

### SQL à coller

```sql
CREATE TABLE IF NOT EXISTS experts_waitlist (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL,
  category        TEXT CHECK (category IN ('comptable', 'avocat', 'any')),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source          TEXT DEFAULT 'experts_page',
  ip_hash         TEXT,
  user_agent      TEXT,
  notified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS experts_waitlist_email_category_key
  ON experts_waitlist (LOWER(email), COALESCE(category, 'any'));

CREATE INDEX IF NOT EXISTS experts_waitlist_created_at_idx
  ON experts_waitlist (created_at DESC);

CREATE INDEX IF NOT EXISTS experts_waitlist_user_id_idx
  ON experts_waitlist (user_id)
  WHERE user_id IS NOT NULL;

ALTER TABLE experts_waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_waitlist" ON experts_waitlist;
CREATE POLICY "users_read_own_waitlist" ON experts_waitlist
  FOR SELECT
  USING (auth.uid() = user_id);

COMMENT ON TABLE experts_waitlist IS
  'Waitlist /experts — emails collectes en attendant l''annuaire francophone.';
```

### Vérification

```sql
SELECT COUNT(*) FROM experts_waitlist;
-- Attendu : 0 (table créée, vide)
```

---

## Étape 4 — `20260420_provider_applications_consent.sql`

### Localisation
- Repo local : `supabase/migrations/20260420_provider_applications_consent.sql`
- GitHub : https://github.com/rabbigab/tloush/blob/main/supabase/migrations/20260420_provider_applications_consent.sql

### Effet
Ajoute 3 colonnes à `provider_applications` + contrainte de cohérence :
- `consent_public` BOOLEAN (consentement publication fiche)
- `consent_cgv` BOOLEAN (consentement CGV)
- `consent_given_at` TIMESTAMPTZ (timestamp)

### SQL à coller

```sql
ALTER TABLE provider_applications
  ADD COLUMN IF NOT EXISTS consent_public BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS consent_cgv BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS consent_given_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS provider_applications_consent_given_at_idx
  ON provider_applications (consent_given_at)
  WHERE consent_given_at IS NOT NULL;

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
```

### Vérification

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'provider_applications'
  AND column_name IN ('consent_public', 'consent_cgv', 'consent_given_at')
ORDER BY column_name;
-- Attendu : 3 lignes exactement
```

---

## Étape 5 — Vérification globale

Une seule query après avoir fait les 4 étapes :

```sql
SELECT 'detected_rights' AS check_name, EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_name = 'detected_rights'
) AS ok
UNION ALL
SELECT 'user_profiles.birth_date', EXISTS (
  SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'birth_date'
)
UNION ALL
SELECT 'experts_waitlist', EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_name = 'experts_waitlist'
)
UNION ALL
SELECT 'provider_applications.consent_public', EXISTS (
  SELECT 1 FROM information_schema.columns WHERE table_name = 'provider_applications' AND column_name = 'consent_public'
);
```

**Résultat attendu** : 4 lignes, toutes avec `ok = true`.

Si une seule ligne est `false`, **ne pas merger** — identifier quelle migration a échoué et la rejouer.

---

## Étape 6 — Revenir ici pour "go merge"

Quand les 4 lignes sont `true` :

1. Coller le résultat de la query de vérification dans le chat (pour trace).
2. Écrire **"go merge"**.

Ensuite on merge dans l'ordre **PR #14 → #15 → #16 → #17**.

---

## Troubleshooting

| Erreur SQL | Cause probable | Action |
|---|---|---|
| `relation "documents" does not exist` | FK cassée — la table `documents` n'existe pas | Vérifier qu'une migration antérieure a créé `documents` (chercher dans `supabase/migrations/*` les anciennes migrations) |
| `relation "user_profiles" does not exist` | Table absente | Appliquer d'abord la migration qui crée `user_profiles` (`20260413_user_profiles.sql`) |
| `relation "provider_applications" does not exist` | Table absente | Appliquer d'abord la migration qui crée `provider_applications` |
| `policy "xxx" already exists` | Migration rejouée | Ignorable (idempotent grâce aux `DROP ... IF EXISTS`) |
| `column "xxx" already exists` | Migration rejouée | Ignorable (les `ADD COLUMN IF NOT EXISTS` sont no-op) |
| Autre | — | Coller le message d'erreur exact dans le chat pour debug |

---

## Résumé ultra-court

1. SQL Editor Supabase → New query
2. Coller successivement les 4 blocs SQL (étapes 1 à 4)
3. Lancer la query de vérif globale (étape 5)
4. Si 4 × `true` → revenir ici avec "go merge"
