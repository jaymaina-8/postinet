import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client configured with environment variables for project-wide access
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}
export default createClient(supabaseUrl, supabaseAnonKey);
