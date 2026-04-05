-- =============================================
-- FIX : "Database error saving new user"
-- À exécuter dans Supabase > SQL Editor
-- =============================================
-- Ce fix corrige le trigger create_free_subscription qui peut échouer
-- à cause du search_path vide dans SECURITY DEFINER.

-- 1. Vérifier que la table subscriptions existe bien
-- (si elle n'existe pas, relancer supabase-subscriptions.sql d'abord)

-- 2. Recréer la fonction avec search_path explicite
CREATE OR REPLACE FUNCTION public.create_free_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_id, status, trial_start, trial_end)
  VALUES (NEW.id, 'free', 'active', NOW(), NOW() + INTERVAL '60 days')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Ne pas bloquer la création du user si l'insert échoue
    RAISE WARNING 'create_free_subscription failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 3. Recréer le trigger (drop + create pour être sûr)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_free_subscription();

-- =============================================
-- DIAGNOSTIC : pour voir ce qui bloque
-- =============================================

-- Liste TOUS les triggers sur auth.users (au cas où il y en ait un autre)
-- À exécuter séparément pour inspecter :
--
-- SELECT trigger_name, event_manipulation, action_statement
-- FROM information_schema.triggers
-- WHERE event_object_schema = 'auth' AND event_object_table = 'users';

-- Vérifier que la table subscriptions existe :
--
-- SELECT EXISTS (
--   SELECT FROM information_schema.tables
--   WHERE table_schema = 'public' AND table_name = 'subscriptions'
-- );
