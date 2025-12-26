import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { PLATFORMS } from '@/lib/platforms';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import {
  validateFacebookEnv,
  getFacebookProfile,
  getFacebookPages,
  getLongLivedToken,
} from '@/lib/facebook/oauth';

function getAppUrl(req: NextRequest) {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl) return envUrl.replace(/\/$/, '');
  return req.nextUrl.origin;
}

/**
 * GET: Handle Facebook OAuth callback
 * Exchanges authorization code for access token and stores it in the database
 */
export async function GET(req: NextRequest) {
  try {
    const appUrl = getAppUrl(req);
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

    // If this route is used as the Supabase OAuth redirect target (PKCE),
    // exchange the code for a session and set auth cookies on the redirect response.
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      console.warn('[FB_OAUTH] Failed to exchange code for session; redirecting auth_required');
      response.headers.set(
        'Location',
        new URL('/dashboard/accounts?facebook_error=auth_required', appUrl).toString()
      );
      return response;
    }
    console.log('[FB_OAUTH] Successful session restore via PKCE callback');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.warn('[FB_OAUTH] Missing authenticated user in callback; redirecting auth_required');
      response.headers.set(
        'Location',
        new URL('/dashboard/accounts?facebook_error=auth_required', appUrl).toString()
      );
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

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const providerToken = session?.provider_token;
    if (!providerToken) {
      console.warn('[FB_OAUTH] Session missing provider_token; redirecting auth_required');
      response.headers.set(
        'Location',
        new URL('/dashboard/accounts?facebook_error=auth_required', appUrl).toString()
      );
      return response;
    }

    // Get long-lived token (for stable Page posting)
    let longLivedToken;
    try {
      longLivedToken = await getLongLivedToken(providerToken);
    } catch (llTokenError) {
      console.warn('Failed to get long-lived token, using short-lived:', llTokenError);
      longLivedToken = { access_token: providerToken, token_type: 'bearer' };
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
