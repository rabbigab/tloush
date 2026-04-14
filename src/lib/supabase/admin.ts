import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Lazy singleton admin client — created on first request, NOT at module load.
 * This prevents build failures when env vars are not available at compile time.
 */
let _adminClient: SupabaseClient | null = null

export function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _adminClient
}
