-- =============================================
-- TLOUSH V3 — Subscriptions & Quotas
-- À exécuter dans Supabase > SQL Editor
-- =============================================

-- Table des abonnements
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan_id TEXT NOT NULL DEFAULT 'free',             -- 'free', 'solo', 'family'
  status TEXT NOT NULL DEFAULT 'active',            -- 'active', 'canceled', 'past_due', 'expired'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  trial_start TIMESTAMPTZ DEFAULT NOW(),
  trial_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '60 days'),
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des compteurs d'usage mensuel
CREATE TABLE usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  period TEXT NOT NULL,                              -- ex: '2026-04' (année-mois)
  documents_analyzed INTEGER DEFAULT 0,
  assistant_messages INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period)
);

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_subscription" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_own_usage" ON usage_tracking
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- Index
-- =============================================

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_usage_tracking_user_period ON usage_tracking(user_id, period);

-- =============================================
-- Fonction : créer automatiquement un abonnement gratuit à l'inscription
-- =============================================

CREATE OR REPLACE FUNCTION create_free_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (user_id, plan_id, status, trial_start, trial_end)
  VALUES (NEW.id, 'free', 'active', NOW(), NOW() + INTERVAL '60 days');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_free_subscription();
