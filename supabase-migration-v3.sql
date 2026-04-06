-- ============================================================================
-- Tloush V3 — Migration complète
-- Exécuter dans Supabase Studio → SQL Editor → New Query → Run
-- ============================================================================

-- 1. Ajout des colonnes manquantes sur la table documents
-- (IF NOT EXISTS n'existe pas pour ALTER COLUMN, on utilise DO $$ block)
DO $$
BEGIN
  -- Colonne deadline (ajoutée Sprint 1)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='documents' AND column_name='deadline') THEN
    ALTER TABLE public.documents ADD COLUMN deadline DATE;
  END IF;

  -- Colonne folder_id (ajoutée Sprint 2)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='documents' AND column_name='folder_id') THEN
    ALTER TABLE public.documents ADD COLUMN folder_id UUID;
  END IF;

  -- Colonne action_completed_at (ajoutée Sprint 3)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='documents' AND column_name='action_completed_at') THEN
    ALTER TABLE public.documents ADD COLUMN action_completed_at TIMESTAMPTZ;
  END IF;
END $$;

-- 2. Table folders (Sprint 2)
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  auto_generated BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='folders' AND policyname='Users can manage own folders') THEN
    CREATE POLICY "Users can manage own folders" ON public.folders
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Foreign key documents → folders (si pas encore créée)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'documents_folder_id_fkey'
  ) THEN
    ALTER TABLE public.documents
      ADD CONSTRAINT documents_folder_id_fkey
      FOREIGN KEY (folder_id) REFERENCES public.folders(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Table recurring_expenses (Sprint 2)
CREATE TABLE IF NOT EXISTS public.recurring_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  category TEXT,
  amount NUMERIC,
  frequency TEXT DEFAULT 'monthly',
  last_seen_date DATE,
  document_ids UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='recurring_expenses' AND policyname='Users can manage own expenses') THEN
    CREATE POLICY "Users can manage own expenses" ON public.recurring_expenses
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 4. Table usage_tracking (Sprint 0)
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period TEXT NOT NULL, -- format: '2026-04'
  documents_analyzed INTEGER DEFAULT 0,
  assistant_messages INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, period)
);

ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='usage_tracking' AND policyname='Users can manage own usage') THEN
    CREATE POLICY "Users can manage own usage" ON public.usage_tracking
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 5. Table family_members (Sprint 0)
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, active, revoked
  invited_at TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ
);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='family_members' AND policyname='Owners can manage family') THEN
    CREATE POLICY "Owners can manage family" ON public.family_members
      FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='family_members' AND policyname='Members can view own membership') THEN
    CREATE POLICY "Members can view own membership" ON public.family_members
      FOR SELECT USING (auth.uid() = member_id);
  END IF;
END $$;

-- 6. Table subscriptions (Sprint 0) — au cas où
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_id TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='subscriptions' AND policyname='Users can view own subscription') THEN
    CREATE POLICY "Users can view own subscription" ON public.subscriptions
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='subscriptions' AND policyname='Users can update own subscription') THEN
    CREATE POLICY "Users can update own subscription" ON public.subscriptions
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='subscriptions' AND policyname='Users can insert own subscription') THEN
    CREATE POLICY "Users can insert own subscription" ON public.subscriptions
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 7. Trigger signup (avec fix search_path)
CREATE OR REPLACE FUNCTION public.create_free_subscription()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_id, status, trial_start, trial_end)
  VALUES (NEW.id, 'free', 'active', NOW(), NOW() + INTERVAL '60 days')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'create_free_subscription failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Recréer le trigger au cas où
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_free_subscription();

-- 8. Index utiles
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder_id ON public.documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_deadline ON public.documents(deadline) WHERE deadline IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_user_id ON public.recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON public.folders(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_period ON public.usage_tracking(user_id, period);

-- ============================================================================
-- FIN — Tout est idempotent, peut être exécuté plusieurs fois sans risque.
-- ============================================================================
