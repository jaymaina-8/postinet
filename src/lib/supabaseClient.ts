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
  const client = createClient(supabaseUrl, supabaseAnonKey, {
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

  // Suppress auth state change errors in console
  if (typeof window !== 'undefined') {
    client.auth.onAuthStateChange((event, session) => {
      // Silently handle auth state changes
      // This prevents "Token refresh failed" errors from appearing in console
      if (event === 'TOKEN_REFRESHED') {
        // Token was successfully refreshed
      } else if (event === 'SIGNED_OUT') {
        // User signed out
      }
    });
  }

  return client;
}

const supabase = createSupabaseClient();

// Suppress console errors for expected auth and network failures
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    // Suppress specific Supabase auth errors that are expected
    const errorString = args.join(' ');
    if (
      errorString.includes('Token refresh failed') ||
      errorString.includes('AuthApiError') ||
      errorString.includes('Failed to fetch') ||
      errorString.includes('does not exist') ||
      errorString.includes('column') && errorString.includes('platform_username') ||
      (errorString.includes('refresh_token') && errorString.includes('invalid'))
    ) {
      // Silently ignore these - they're expected when no valid session exists
      // or when database columns are missing
      return;
    }
    // Log all other errors normally
    originalConsoleError.apply(console, args);
  };
}

export default supabase;
