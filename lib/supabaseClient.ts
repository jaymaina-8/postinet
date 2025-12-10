import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client configured with environment variables for project-wide access
 * Note: This is a legacy file - prefer using src/lib/supabaseClient.ts
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function createSupabaseClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey);
}

export default createClient(supabaseUrl, supabaseAnonKey);
