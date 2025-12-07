import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client configured with environment variables for project-wide access
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please add it to your .env.local file.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Please add it to your .env.local file.'
  );
}

// Custom fetch wrapper to handle network errors gracefully
const customFetch = async (url: string | URL | Request, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error: any) {
    // Suppress "Failed to fetch" errors during token refresh
    // These are common when the session is invalid or network is unavailable
    if (error?.message === 'Failed to fetch' || error?.name === 'TypeError') {
      // Check if this is a token refresh request
      const urlString = typeof url === 'string' ? url : url instanceof URL ? url.toString() : url.url;
      if (urlString?.includes('/auth/v1/token') || urlString?.includes('/auth/v1/verify')) {
        // Silently handle token refresh failures - they're expected when session is invalid
        return new Response(
          JSON.stringify({ error: 'Token refresh failed' }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }
    // Re-throw other errors
    throw error;
  }
};

export function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'supabase.auth.token',
    },
    global: {
      fetch: customFetch,
    },
  });
}

const supabase = createSupabaseClient();

export default supabase;
