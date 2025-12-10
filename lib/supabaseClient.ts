import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client configured with environment variables for project-wide access
 * Note: This is a legacy file - prefer using src/lib/supabaseClient.ts
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Lazy-initialized client instance
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      // Create with placeholder for build time
      supabaseInstance = createClient(
        'https://placeholder.supabase.co',
        'placeholder-key',
        { auth: { persistSession: false } }
      );
    } else {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    }
  }
  return supabaseInstance;
}

export function createSupabaseClient(): SupabaseClient {
  return getSupabaseClient();
}

// Export a proxy that lazily initializes the client
const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient];
  },
});

export default supabase;
