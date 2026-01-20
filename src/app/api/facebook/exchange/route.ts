import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET: Handle Facebook OAuth callback for Supabase linkIdentity flow
 * 
 * This route completes the PKCE OAuth flow by calling exchangeCodeForSession.
 * It is used when linking Facebook as an identity to an existing user account.
 * 
 * IMPORTANT: This is an identity-linking flow, NOT a login flow.
 * - Do NOT check auth state before exchange
 * - Do NOT use signInWithOAuth
 * - Always call exchangeCodeForSession unconditionally
 */
export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[FB_OAUTH] Missing Supabase environment variables');
    return NextResponse.redirect('https://postinet.pro/dashboard?error=facebook_oauth');
  }

  // Create Supabase client with cookie handling for the response
  // Redirect to /dashboard on success (accounts page will show success based on linked identity)
  const successUrl = 'https://postinet.pro/dashboard';
  const response = NextResponse.redirect(successUrl);
  
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll().map(({ name, value }) => ({ name, value })),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Exchange the authorization code for a session
  // This MUST be called unconditionally - do NOT check auth state first
  const { error } = await supabase.auth.exchangeCodeForSession(req.url);

  if (error) {
    console.error('Facebook OAuth exchange error:', error);
    return NextResponse.redirect('https://postinet.pro/dashboard?error=facebook_oauth');
  }

  return response;
}
