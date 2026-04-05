-- Sprint 2: Dossiers vivants + Dépenses récurrentes
-- Run this in Supabase SQL editor

-- ============================================================
-- 1. FOLDERS TABLE (dossiers vivants)
-- ============================================================
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'active',
  icon TEXT,
  color TEXT,
  auto_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS folders_user_id_idx ON folders(user_id);
CREATE INDEX IF NOT EXISTS folders_category_idx ON folders(user_id, category);

ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own folders" ON folders;
CREATE POLICY "Users can view own folders" ON folders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own folders" ON folders;
CREATE POLICY "Users can insert own folders" ON folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own folders" ON folders;
CREATE POLICY "Users can update own folders" ON folders
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own folders" ON folders;
CREATE POLICY "Users can delete own folders" ON folders
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 2. Add folder_id to documents
-- ============================================================
ALTER TABLE documents ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS documents_folder_id_idx ON documents(folder_id);

-- ============================================================
-- 3. RECURRING EXPENSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS recurring_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  category TEXT,
  amount NUMERIC(10, 2),
  currency TEXT DEFAULT 'ILS',
  frequency TEXT,
  last_seen_date DATE,
  next_expected_date DATE,
  document_ids JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS recurring_expenses_user_id_idx ON recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS recurring_expenses_status_idx ON recurring_expenses(user_id, status);
CREATE INDEX IF NOT EXISTS recurring_expenses_provider_idx ON recurring_expenses(user_id, provider_name);

ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own recurring_expenses" ON recurring_expenses;
CREATE POLICY "Users can view own recurring_expenses" ON recurring_expenses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recurring_expenses" ON recurring_expenses;
CREATE POLICY "Users can insert own recurring_expenses" ON recurring_expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recurring_expenses" ON recurring_expenses;
CREATE POLICY "Users can update own recurring_expenses" ON recurring_expenses
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own recurring_expenses" ON recurring_expenses;
CREATE POLICY "Users can delete own recurring_expenses" ON recurring_expenses
  FOR DELETE USING (auth.uid() = user_id);
