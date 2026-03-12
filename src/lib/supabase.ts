import { createClient } from '@supabase/supabase-js';

// Vite exposes VITE_* env vars via import.meta.env (typed in src/env.d.ts)
const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. ' +
      'Public data fetching will not work — using static fallback data. ' +
      'Add these to your .env file to connect to Supabase.'
  );
}

// Only create the client when credentials are present to avoid a fatal
// "Invalid URL" error that crashes the entire React app.
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ─── Types matching our DB schema ────────────────────────────────────────────

export interface Project {
  id: string;
  title: string;
  description: string;
  slug: string;
  folder_name: string;
  cover_image: string;
  show_in_work_page: boolean;
  show_in_selected_work: boolean;
  display_order: number;
  created_at: string;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  image_path: string;
  image_order: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  created_at: string;
}

export interface Journal {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  password_hash: string;
}

// ─── Public data fetchers ─────────────────────────────────────────────────────
// Each fetcher returns an empty array (not null) when Supabase is not configured
// so the public site always renders using its static fallback data.

/** Fetch projects shown on the homepage Selected Work section */
export async function fetchSelectedWorkProjects(): Promise<Project[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('show_in_selected_work', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[Supabase] fetchSelectedWorkProjects error:', error.message);
    return [];
  }
  return data ?? [];
}

/** Fetch projects shown on the Work page */
export async function fetchWorkPageProjects(): Promise<Project[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('show_in_work_page', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[Supabase] fetchWorkPageProjects error:', error.message);
    return [];
  }
  return data ?? [];
}

/** Fetch all FAQs ordered by display_order */
export async function fetchFAQs(): Promise<FAQ[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('faq')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[Supabase] fetchFAQs error:', error.message);
    return [];
  }
  return data ?? [];
}
