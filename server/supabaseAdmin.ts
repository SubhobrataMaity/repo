import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client that uses the SERVICE ROLE KEY.
 * This bypasses Row Level Security — NEVER expose this to the frontend.
 */
const supabaseUrl = process.env.VITE_SUPABASE_URL ?? '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    '[SupabaseAdmin] VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. ' +
      'Admin API routes will not function correctly.'
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    // Disable auto-refresh — this is a server client
    autoRefreshToken: false,
    persistSession: false,
  },
});
