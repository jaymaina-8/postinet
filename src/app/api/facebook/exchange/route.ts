import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { PLATFORMS } from '@/lib/platforms';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import {
  validateFacebookEnv,
  getFacebookProfile,
  getFacebookPages,
  getLongLivedToken,
  exchangeFacebookCode,
} from '@/lib/facebook/oauth';

function getAppUrl(req: NextRequest) {
  // Use hardcoded production URL to ensure consistent redirects
  // This prevents redirect issues when OAuth callback completes
  return 'https://postinet.pro';
}

/**
 * GET: Handle Facebook OAuth callback
 * Exchanges authorization code for access token and stores it in the database
 */
export async function GET(req: NextRequest) {
  try {
    const appUrl = getAppUrl(req);
    // Always redirect to /dashboard after successful OAuth (never /login)
    // This preserves the user's authenticated session
    // Redirect to /dashboard explicitly as required
    const successRedirect = new URL('/dashboard/accounts?facebook=connected', appUrl);
    const response = NextResponse.redirect(successRedirect);

    // Get authorization code from query params
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors from Facebook
    if (error) {
      console.error('Facebook OAuth error:', { error, errorDescription });
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      dashboardUrl.searchParams.set('facebook_error', errorDescription || error);
      response.headers.set('Location', dashboardUrl.toString());
      return response;
    }

    if (!code) {
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      dashboardUrl.searchParams.set('facebook_error', 'Missing authorization code');
      response.headers.set('Location', dashboardUrl.toString());
      return response;
    }

    // Enforce authentication immediately. The server must restore the session from cookies.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      dashboardUrl.searchParams.set('facebook_error', 'Server configuration error');
      response.headers.set('Location', dashboardUrl.toString());
      return response;
    }

    // Create Supabase client to get current user session
    const cookieStore = await cookies();
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

    // Get the current authenticated user from the existing session
    // This is a direct Facebook OAuth flow, not Supabase OAuth, so we don't exchange code for session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error('[FB_OAUTH] User not authenticated - must be logged in to connect Facebook');
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      dashboardUrl.searchParams.set('facebook_error', 'You must be logged in to connect Facebook. Please log in and try again.');
      response.headers.set('Location', dashboardUrl.toString());
      return response;
    }
    
    console.log('[FB_OAUTH] User authenticated:', { userId: user.id, email: user.email });

    // Exchange Facebook authorization code for access token (direct Facebook OAuth)
    const redirectUri = 'https://postinet.pro/api/facebook/exchange';
    let facebookToken;
    try {
      facebookToken = await exchangeFacebookCode(code, redirectUri);
      console.log('[FB_OAUTH] Successfully exchanged Facebook code for access token');
    } catch (exchangeError) {
      console.error('[FB_OAUTH] Failed to exchange Facebook code:', exchangeError);
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      const message = exchangeError instanceof Error ? exchangeError.message : 'Failed to connect Facebook';
      dashboardUrl.searchParams.set('facebook_error', message);
      response.headers.set('Location', dashboardUrl.toString());
      return response;
    }

    // Validate environment variables
    try {
      validateFacebookEnv();
    } catch (envError: unknown) {
      console.error('Facebook OAuth environment validation failed:', envError);
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      dashboardUrl.searchParams.set('facebook_error', 'Server configuration error');
      response.headers.set('Location', dashboardUrl.toString());
      return response;
    }

    // Get long-lived token (for stable Page posting)
    let longLivedToken;
    try {
      longLivedToken = await getLongLivedToken(facebookToken.access_token);
      console.log('[FB_OAUTH] Successfully obtained long-lived Facebook token');
    } catch (llTokenError) {
      console.warn('[FB_OAUTH] Failed to get long-lived token, using short-lived:', llTokenError);
      longLivedToken = { access_token: facebookToken.access_token, token_type: 'bearer' };
    }

    // Calculate expiration timestamp
    const expiresAt = longLivedToken.expires_in
      ? Date.now() + longLivedToken.expires_in * 1000
      : null;

    // Get user's Facebook profile info
    let platformUserId: string | null = null;
    let platformUsername: string | null = null;

    try {
      const profileData = await getFacebookProfile(longLivedToken.access_token);
      platformUserId = profileData.id || null;
      platformUsername = profileData.name || null;
    } catch (profileError) {
      console.warn('Failed to fetch Facebook profile:', profileError);
    }

    // Get user's Facebook Pages
    let pages: Awaited<ReturnType<typeof getFacebookPages>> = [];
    let selectedPage = null;

    try {
      pages = await getFacebookPages(longLivedToken.access_token);
      if (pages.length > 0) {
        // Select the first page by default
        selectedPage = pages[0];
      }
    } catch (pagesError) {
      console.warn('Failed to fetch Facebook pages:', pagesError);
    }

    // Store or update the connection in the database
    const { data: existingConnection } = await supabaseAdmin
      .from('connected_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', PLATFORMS.FACEBOOK)
      .single();

    const connectionData = {
      access_token: longLivedToken.access_token,
      refresh_token: null,
      expires_at: expiresAt,
      platform_user_id: platformUserId,
      platform_username: platformUsername,
      facebook_page_id: selectedPage?.id || null,
      facebook_page_name: selectedPage?.name || null,
      facebook_page_access_token: selectedPage?.access_token || null,
    };

    if (existingConnection) {
      // Update existing connection
      const { error: updateError } = await supabaseAdmin
        .from('connected_accounts')
        .update(connectionData)
        .eq('id', existingConnection.id);

      if (updateError) {
        throw updateError;
      }
    } else {
      // Create new connection
      const { error: insertError } = await supabaseAdmin
        .from('connected_accounts')
        .insert({
          user_id: user.id,
          platform: PLATFORMS.FACEBOOK,
          ...connectionData,
        });

      if (insertError) {
        throw insertError;
      }
    }
    console.log('[FB_OAUTH] Page token storage success', {
      userId: user.id,
      pageId: selectedPage?.id || null,
    });

    // Final successful redirect must always be consistent (UI trigger only; not auth).
    return response;
  } catch (error: unknown) {
    console.error('Facebook OAuth exchange error:', error);
    const dashboardUrl = new URL('/dashboard/accounts', getAppUrl(req));
    const message = error instanceof Error ? error.message : 'Failed to complete Facebook OAuth';
    dashboardUrl.searchParams.set('facebook_error', message);
    return NextResponse.redirect(dashboardUrl);
  }
}
