import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { PLATFORMS } from '@/lib/platforms';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import {
  exchangeFacebookCode,
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
      return NextResponse.redirect(dashboardUrl);
    }

    if (!code) {
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      dashboardUrl.searchParams.set('facebook_error', 'Missing authorization code');
      return NextResponse.redirect(dashboardUrl);
    }

    // Enforce authentication immediately. The server must restore the session from cookies.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      dashboardUrl.searchParams.set('facebook_error', 'Server configuration error');
      return NextResponse.redirect(dashboardUrl);
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => cookieStore.getAll().map(({ name, value }) => ({ name, value })),
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.warn('[FB_OAUTH] Missing authenticated user in callback; redirecting auth_required');
      return NextResponse.redirect(
        new URL('/dashboard/accounts?facebook_error=auth_required', appUrl)
      );
    }

    // Validate environment variables
    try {
      validateFacebookEnv();
    } catch (envError: unknown) {
      console.error('Facebook OAuth environment validation failed:', envError);
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      dashboardUrl.searchParams.set('facebook_error', 'Server configuration error');
      return NextResponse.redirect(dashboardUrl);
    }

    // Prefer configured redirect URI; otherwise build it from NEXT_PUBLIC_APP_URL.
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI || `${appUrl}/api/facebook/exchange`;

    // Exchange code for access token
    let tokenResponse;
    try {
      tokenResponse = await exchangeFacebookCode(code, redirectUri);
    } catch (tokenError: unknown) {
      console.error('Token exchange error:', tokenError);
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      const message = tokenError instanceof Error ? tokenError.message : 'Unknown error';
      dashboardUrl.searchParams.set('facebook_error', `Failed to exchange authorization code: ${message}`);
      return NextResponse.redirect(dashboardUrl);
    }
    console.log('[FB_OAUTH] Token exchange succeeded');

    // Get long-lived token
    let longLivedToken;
    try {
      longLivedToken = await getLongLivedToken(tokenResponse.access_token);
    } catch (llTokenError) {
      console.warn('Failed to get long-lived token, using short-lived:', llTokenError);
      longLivedToken = tokenResponse;
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
    console.log('[FB_OAUTH] connected_accounts upsert succeeded');

    // Final successful redirect must always be consistent (UI trigger only; not auth).
    return NextResponse.redirect(new URL('/dashboard/accounts?facebook=connected', appUrl));
  } catch (error: unknown) {
    console.error('Facebook OAuth exchange error:', error);
    const dashboardUrl = new URL('/dashboard/accounts', getAppUrl(req));
    const message = error instanceof Error ? error.message : 'Failed to complete Facebook OAuth';
    dashboardUrl.searchParams.set('facebook_error', message);
    return NextResponse.redirect(dashboardUrl);
  }
}
