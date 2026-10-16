import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  || '';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create client if env vars are set
export const supabase = supabaseUrl && supabaseAnon
  ? createClient(supabaseUrl, supabaseAnon)
  : null;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnon);
