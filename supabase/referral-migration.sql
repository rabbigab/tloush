-- =========================================================
-- TLOUSH V3 — Referral System Tables
-- Execute in Supabase Studio > SQL Editor
-- =========================================================

-- 1. Referrals tracking table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  referred_upgraded boolean DEFAULT false,
  upgraded_at timestamptz,
  created_at timestamptz DEFAULT now(),

  CONSTRAINT unique_referred UNIQUE (referred_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);

-- RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own referrals"
  ON referrals FOR SELECT
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "Service role can manage referrals"
  ON referrals FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. Referral bonuses tracking table
CREATE TABLE IF NOT EXISTS referral_bonuses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bonus_analyses integer DEFAULT 0,
  free_months_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT unique_user_bonus UNIQUE (user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_referral_bonuses_user ON referral_bonuses(user_id);

-- RLS
ALTER TABLE referral_bonuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own bonuses"
  ON referral_bonuses FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage bonuses"
  ON referral_bonuses FOR ALL
  USING (true)
  WITH CHECK (true);
