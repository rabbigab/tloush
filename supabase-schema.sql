-- =============================================
-- TLOUSH V3 — Schéma de base de données
-- À exécuter dans Supabase > SQL Editor
-- =============================================

-- Table des documents (inbox)
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,          -- chemin dans Supabase Storage
  file_type TEXT NOT NULL,          -- 'pdf', 'image'
  document_type TEXT NOT NULL DEFAULT 'unknown',  -- 'payslip', 'official_letter', 'contract', 'tax', 'other'
  status TEXT NOT NULL DEFAULT 'pending',         -- 'pending', 'analyzed', 'error'
  is_urgent BOOLEAN DEFAULT false,
  analysis_data JSONB,              -- résultat complet de l'extraction Claude
  summary_fr TEXT,                  -- résumé en français (2-3 lignes)
  action_required BOOLEAN DEFAULT false,
  action_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  analyzed_at TIMESTAMPTZ,
  period TEXT                       -- ex: 'Avril 2025' pour les fiches de paie
);

-- Table des conversations avec l'assistant
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des messages
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Sécurité Row Level Security (RLS)
-- Chaque utilisateur ne voit QUE ses données
-- =============================================

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Politiques documents
CREATE POLICY "users_own_documents" ON documents
  FOR ALL USING (auth.uid() = user_id);

-- Politiques conversations
CREATE POLICY "users_own_conversations" ON conversations
  FOR ALL USING (auth.uid() = user_id);

-- Politiques messages (via conversation)
CREATE POLICY "users_own_messages" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- =============================================
-- Storage bucket pour les documents
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- Politique storage : chaque user accède à son dossier
CREATE POLICY "users_own_storage" ON storage.objects
  FOR ALL USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- Index pour les performances
-- =============================================

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
