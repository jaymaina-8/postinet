import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { PLATFORMS } from '@/lib/platforms';
import {
  exchangeFacebookCode,
  validateFacebookEnv,
  getFacebookProfile,
  getFacebookPages,
  getLongLivedToken,
} from '@/lib/facebook/oauth';

async function resolveUser(req: NextRequest) {
  // Try to get token from Authorization header first
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]?.trim();
    if (token) {
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && data?.user) {
        console.log('User resolved from Authorization header');
        return data.user;
      }
    }
  }

  // Try to get user from cookies (for OAuth callback flow)
  const cookies = req.cookies;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL not set');
    return null;
  }

  // Extract project ref from Supabase URL
  const projectRef = supabaseUrl.split('//')[1]?.split('.')[0];
  if (!projectRef) {
    console.error('Could not extract project ref from Supabase URL');
    return null;
  }

  // Log all available cookies for debugging
  const allCookies = cookies.getAll();
  console.log('Available cookies:', allCookies.map(c => c.name));

  // Check for Supabase auth cookie - try multiple formats
  const cookieNames = [
    `sb-${projectRef}-auth-token`,
    `sb-${projectRef}-auth-token-code-verifier`,
  ];

  for (const cookieName of cookieNames) {
    const authCookie = cookies.get(cookieName);
    if (authCookie) {
      console.log(`Found cookie: ${cookieName}`);
      try {
        // The cookie value might be base64 encoded or JSON
        let cookieValue = authCookie.value;
        
        // Try to parse as JSON first
        let session;
        try {
          session = JSON.parse(cookieValue);
        } catch {
          // Try base64 decode
          try {
            const decoded = Buffer.from(cookieValue, 'base64').toString('utf-8');
            session = JSON.parse(decoded);
          } catch {
            console.log(`Cookie ${cookieName} is not valid JSON or base64`);
            continue;
          }
        }
        
        const token = session?.access_token;
        if (token) {
          const { data, error } = await supabaseAdmin.auth.getUser(token);
          if (!error && data?.user) {
            console.log('User resolved from cookie:', cookieName);
            return data.user;
          } else {
            console.log('Token from cookie invalid:', error?.message);
          }
        }
      } catch (e) {
        console.error(`Error parsing cookie ${cookieName}:`, e);
      }
    }
  }

  console.log('Could not resolve user from any source');
  return null;
}

/**
 * GET: Handle Facebook OAuth callback
 * Exchanges authorization code for access token and stores it in the database
 */
export async function GET(req: NextRequest) {
  try {
    // Get authorization code from query params
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors from Facebook
    if (error) {
      console.error('Facebook OAuth error:', { error, errorDescription });
      const dashboardUrl = new URL('/dashboard/accounts', req.nextUrl.origin);
      dashboardUrl.searchParams.set('facebook_error', errorDescription || error);
      return NextResponse.redirect(dashboardUrl);
    }

    if (!code) {
      const dashboardUrl = new URL('/dashboard/accounts', req.nextUrl.origin);
      dashboardUrl.searchParams.set('facebook_error', 'Missing authorization code');
      return NextResponse.redirect(dashboardUrl);
    }

    // Validate environment variables
    try {
      validateFacebookEnv();
    } catch (envError: unknown) {
      console.error('Facebook OAuth environment validation failed:', envError);
      const dashboardUrl = new URL('/dashboard/accounts', req.nextUrl.origin);
      dashboardUrl.searchParams.set('facebook_error', 'Server configuration error');
      return NextResponse.redirect(dashboardUrl);
    }

    // Get redirect URI from environment or construct from request
    let redirectUri = process.env.FACEBOOK_REDIRECT_URI;
    if (!redirectUri) {
      const origin = req.headers.get('origin') || req.nextUrl.origin;
      redirectUri = `${origin}/api/facebook/exchange`;
      console.warn('FACEBOOK_REDIRECT_URI not set, using fallback:', redirectUri);
    }

    // Exchange code for access token
    let tokenResponse;
    try {
      tokenResponse = await exchangeFacebookCode(code, redirectUri);
    } catch (tokenError: unknown) {
      console.error('Token exchange error:', tokenError);
      const dashboardUrl = new URL('/dashboard/accounts', req.nextUrl.origin);
      const message = tokenError instanceof Error ? tokenError.message : 'Unknown error';
      dashboardUrl.searchParams.set('facebook_error', `Failed to exchange authorization code: ${message}`);
      return NextResponse.redirect(dashboardUrl);
    }

    // Get long-lived token
    let longLivedToken;
    try {
      longLivedToken = await getLongLivedToken(tokenResponse.access_token);
    } catch (llTokenError) {
      console.warn('Failed to get long-lived token, using short-lived:', llTokenError);
      longLivedToken = tokenResponse;
    }

    // Get user from session
    const user = await resolveUser(req);
    
    if (!user) {
      const dashboardUrl = new URL('/dashboard/accounts', req.nextUrl.origin);
      dashboardUrl.searchParams.set('facebook_error', 'User authentication required. Please ensure you are logged in.');
      return NextResponse.redirect(dashboardUrl);
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

    // Redirect to dashboard with success parameter
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    return NextResponse.redirect(`${appUrl}/dashboard/accounts?facebook=connected`);
  } catch (error: unknown) {
    console.error('Facebook OAuth exchange error:', error);
    const dashboardUrl = new URL('/dashboard/accounts', req.nextUrl.origin);
    const message = error instanceof Error ? error.message : 'Failed to complete Facebook OAuth';
    dashboardUrl.searchParams.set('facebook_error', message);
    return NextResponse.redirect(dashboardUrl);
  }
}
