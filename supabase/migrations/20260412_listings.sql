-- =====================================================
-- Aggregateur immobilier — Schema Supabase
-- =====================================================

-- Table principale des annonces
CREATE TABLE IF NOT EXISTS listings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source        TEXT NOT NULL CHECK (source IN ('yad2', 'facebook')),
  source_id     TEXT NOT NULL,
  source_url    TEXT NOT NULL,
  listing_type  TEXT NOT NULL CHECK (listing_type IN ('rent', 'sale')),
  property_type TEXT NOT NULL DEFAULT 'apartment',

  -- Localisation
  city          TEXT NOT NULL,
  neighborhood  TEXT,
  street        TEXT,
  address_full  TEXT,
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,

  -- Details
  price         INTEGER,
  currency      TEXT NOT NULL DEFAULT 'ILS',
  rooms         REAL,
  floor         INTEGER,
  total_floors  INTEGER,
  size_sqm      REAL,
  balcony_sqm   REAL,
  parking       BOOLEAN,
  elevator      BOOLEAN,
  air_conditioning BOOLEAN,
  furnished     BOOLEAN,
  accessible    BOOLEAN,

  -- Dates
  entry_date    DATE,
  published_at  TIMESTAMPTZ,
  scraped_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Contenu
  title         TEXT,
  description   TEXT,
  images        TEXT[] DEFAULT '{}',
  contact_name  TEXT,
  contact_phone TEXT,

  -- Meta
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Contrainte d'unicite par source
  UNIQUE (source, source_id)
);

-- Index pour les requetes frequentes
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings (city);
CREATE INDEX IF NOT EXISTS idx_listings_type ON listings (listing_type);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings (price);
CREATE INDEX IF NOT EXISTS idx_listings_rooms ON listings (rooms);
CREATE INDEX IF NOT EXISTS idx_listings_active ON listings (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_listings_source ON listings (source);
CREATE INDEX IF NOT EXISTS idx_listings_scraped ON listings (scraped_at DESC);

-- Index geospatial (pour les requetes par zone)
CREATE INDEX IF NOT EXISTS idx_listings_geo ON listings (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Table de logs de scraping
CREATE TABLE IF NOT EXISTS scraping_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source         TEXT NOT NULL,
  started_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at    TIMESTAMPTZ,
  total_scraped  INTEGER DEFAULT 0,
  new_listings   INTEGER DEFAULT 0,
  updated_listings INTEGER DEFAULT 0,
  errors         TEXT[] DEFAULT '{}',
  status         TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed'))
);

-- RLS: lectures publiques, ecritures reservees au service role
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Listings are publicly readable"
  ON listings FOR SELECT
  USING (true);

CREATE POLICY "Only service role can insert listings"
  ON listings FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Only service role can update listings"
  ON listings FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "Scraping logs are publicly readable"
  ON scraping_logs FOR SELECT
  USING (true);

CREATE POLICY "Only service role can manage scraping logs"
  ON scraping_logs FOR ALL
  USING (auth.role() = 'service_role');

-- Fonction updated_at automatique
CREATE OR REPLACE FUNCTION update_listings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_listings_updated_at();
