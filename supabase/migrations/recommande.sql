-- =====================================================
-- Tloush Recommande — Migration SQL
-- Date: 2026-04-09
-- =====================================================

-- 1. Table prestataires
CREATE TABLE IF NOT EXISTS providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  photo_url TEXT,
  category TEXT NOT NULL,
  specialties TEXT[] DEFAULT '{}',
  service_areas TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{fr,he}',
  description TEXT,
  years_experience INTEGER,
  osek_number TEXT,
  is_referenced BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'delisted')),
  average_rating NUMERIC(2,1) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table contacts (tracking des numeros deverrouilles)
CREATE TABLE IF NOT EXISTS provider_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE NOT NULL,
  whatsapp_opted_in BOOLEAN DEFAULT false,
  followup_sent_at TIMESTAMPTZ,
  followup_reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider_id)
);

-- 3. Table avis
CREATE TABLE IF NOT EXISTS provider_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES provider_contacts(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  provider_response TEXT,
  provider_responded_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'published', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider_id)
);

-- 4. Table photos de realisations
CREATE TABLE IF NOT EXISTS provider_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table demandes d'inscription prestataire
CREATE TABLE IF NOT EXISTS provider_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  category TEXT NOT NULL,
  specialties TEXT[] DEFAULT '{}',
  service_areas TEXT[] DEFAULT '{}',
  description TEXT,
  osek_number TEXT,
  tz_photo_url TEXT,
  reference_name TEXT,
  reference_phone TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'contacted', 'referenced', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- =====================================================
-- Index
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_providers_category ON providers(category) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_providers_service_areas ON providers USING GIN(service_areas);
CREATE INDEX IF NOT EXISTS idx_providers_status ON providers(status);
CREATE INDEX IF NOT EXISTS idx_provider_contacts_user ON provider_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_contacts_followup ON provider_contacts(created_at)
  WHERE followup_sent_at IS NULL AND whatsapp_opted_in = true;
CREATE INDEX IF NOT EXISTS idx_provider_reviews_provider ON provider_reviews(provider_id)
  WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_provider_applications_status ON provider_applications(status);

-- =====================================================
-- Triggers
-- =====================================================

-- updated_at automatique
CREATE OR REPLACE FUNCTION update_provider_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER providers_updated_at
  BEFORE UPDATE ON providers
  FOR EACH ROW EXECUTE FUNCTION update_provider_updated_at();

-- Recalcul automatique du rating apres insert/update d'un avis
CREATE OR REPLACE FUNCTION recalculate_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE providers SET
    average_rating = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM provider_reviews
      WHERE provider_id = NEW.provider_id AND status = 'published'
    ), 0),
    total_reviews = (
      SELECT COUNT(*) FROM provider_reviews
      WHERE provider_id = NEW.provider_id AND status = 'published'
    )
  WHERE id = NEW.provider_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_rating_on_review
  AFTER INSERT OR UPDATE ON provider_reviews
  FOR EACH ROW EXECUTE FUNCTION recalculate_provider_rating();

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_applications ENABLE ROW LEVEL SECURITY;

-- providers : lecture publique (actifs), admin manage all
CREATE POLICY "providers_public_read" ON providers
  FOR SELECT USING (status = 'active');

-- provider_contacts : utilisateur voit/cree les siens
CREATE POLICY "contacts_select_own" ON provider_contacts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "contacts_insert_own" ON provider_contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- provider_reviews : lecture publique (publies), creation par user
CREATE POLICY "reviews_public_read" ON provider_reviews
  FOR SELECT USING (status = 'published');
CREATE POLICY "reviews_insert_own" ON provider_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update_own" ON provider_reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- provider_photos : lecture publique
CREATE POLICY "photos_public_read" ON provider_photos
  FOR SELECT USING (true);

-- provider_applications : insert public, lecture admin seulement
CREATE POLICY "applications_insert_public" ON provider_applications
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- Bucket Storage pour les photos prestataires
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('provider-photos', 'provider-photos', true)
ON CONFLICT (id) DO NOTHING;
