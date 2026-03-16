import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client that uses the SERVICE ROLE KEY.
 * This bypasses Row Level Security — NEVER expose this to the frontend.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://dummy.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key';

if (supabaseUrl === 'https://dummy.supabase.co' || serviceRoleKey === 'dummy_key') {
  console.warn(
    '[SupabaseAdmin] VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. ' +
      'Admin API routes will not function correctly. Please add them in Vercel settings.'
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    // Disable auto-refresh — this is a server client
    autoRefreshToken: false,
    persistSession: false,
  },
});
