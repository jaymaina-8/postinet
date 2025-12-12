import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { PLATFORMS } from '@/lib/platforms';
import { 
  exchangeFacebookCode, 
  exchangeForLongLivedToken,
  fetchUserPages,
  validateFacebookEnv,
  type FacebookPage 
} from '@/lib/facebook/oauth';

/**
 * Facebook OAuth Exchange Route
 * 
 * This route handles the full Facebook OAuth server-side flow:
 * 1. Exchange authorization code for short-lived user token
 * 2. Exchange short-lived token for long-lived user token (~60 days)
 * 3. Fetch Facebook Pages the user manages
 * 4. Store Page access token + Page ID + Page Name in Supabase
 * 5. Redirect to /dashboard?facebook=connected
 * 
 * Production URLs:
 * - App URL: https://www.postinet.pro
 * - API callback: https://www.postinet.pro/api/facebook/exchange
 * - Local dev callback: http://localhost:3000/api/facebook/exchange
 */

async function resolveUser(req: NextRequest) {
  // Try to get token from Authorization header first
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]?.trim();
    if (token) {
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && data?.user) {
        return data.user;
      }
    }
  }

  // Try to get user from cookies (for OAuth callback flow)
  const cookies = req.cookies;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;

  // Extract project ref from Supabase URL
  const projectRef = supabaseUrl.split('//')[1]?.split('.')[0];
  if (!projectRef) return null;

  // Check for Supabase auth cookie
  const authCookie = cookies.get(`sb-${projectRef}-auth-token`);
  if (authCookie) {
    try {
      const session = JSON.parse(authCookie.value);
      const token = session?.access_token;
      if (token) {
        const { data, error } = await supabaseAdmin.auth.getUser(token);
        if (!error && data?.user) {
          return data.user;
        }
      }
    } catch {
      // Cookie parsing failed
    }
  }

  return null;
}

/**
 * GET: Handle Facebook OAuth callback
 * Exchanges authorization code for access token and stores it in the database
 * 
 * Flow:
 * 1. Extract code from URL query params
 * 2. Exchange code for short-lived user token
 * 3. Exchange short-lived token for long-lived user token
 * 4. Fetch user's Facebook Pages
 * 5. Select first page (or return list for future UI selection)
 * 6. Store Page access token in Supabase connected_accounts
 * 7. Redirect to /dashboard?facebook=connected
 */
export async function GET(req: NextRequest) {
  try {
    // Get authorization code from query params
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorReason = searchParams.get('error_reason');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors from Facebook
    if (error) {
      console.error('Facebook OAuth error:', { error, errorReason, errorDescription });
      const dashboardUrl = new URL('/dashboard', req.nextUrl.origin);
      dashboardUrl.searchParams.set('facebook_error', errorDescription || errorReason || error);
      return NextResponse.redirect(dashboardUrl);
    }

    if (!code) {
      console.error('Facebook OAuth: Missing authorization code');
      const dashboardUrl = new URL('/dashboard', req.nextUrl.origin);
      dashboardUrl.searchParams.set('facebook_error', 'Missing authorization code');
      return NextResponse.redirect(dashboardUrl);
    }

    // Validate environment variables (will throw if missing)
    try {
      validateFacebookEnv();
    } catch (envError: unknown) {
      const errorMessage = envError instanceof Error ? envError.message : 'Unknown error';
      console.error('Facebook OAuth environment validation failed:', errorMessage);
      const dashboardUrl = new URL('/dashboard', req.nextUrl.origin);
      dashboardUrl.searchParams.set('facebook_error', 'Server configuration error');
      return NextResponse.redirect(dashboardUrl);
    }

    // Get redirect URI from environment or construct from request
    let redirectUri = process.env.FACEBOOK_REDIRECT_URI;
    if (!redirectUri) {
      // Fallback: construct from request origin
      const origin = req.headers.get('origin') || req.nextUrl.origin;
      redirectUri = `${origin}/api/facebook/exchange`;
      console.warn('FACEBOOK_REDIRECT_URI not set, using fallback:', redirectUri);
    }

    // Step 1: Exchange code for short-lived user token
    console.log('Step 1: Exchanging authorization code for short-lived token...');
    let shortLivedToken;
    try {
      shortLivedToken = await exchangeFacebookCode(code, redirectUri);
      console.log('Short-lived token obtained successfully');
    } catch (tokenError: unknown) {
      const errorMessage = tokenError instanceof Error ? tokenError.message : 'Unknown error';
      console.error('Token exchange error:', errorMessage);
      const dashboardUrl = new URL('/dashboard', req.nextUrl.origin);
      dashboardUrl.searchParams.set('facebook_error', `Failed to exchange authorization code: ${errorMessage}`);
      return NextResponse.redirect(dashboardUrl);
    }

    // Step 2: Exchange short-lived token for long-lived user token
    console.log('Step 2: Exchanging for long-lived token...');
    let longLivedToken;
    try {
      longLivedToken = await exchangeForLongLivedToken(shortLivedToken.access_token);
      console.log('Long-lived token obtained successfully');
    } catch (exchangeError: unknown) {
      const errorMessage = exchangeError instanceof Error ? exchangeError.message : 'Unknown error';
      console.error('Long-lived token exchange error:', errorMessage);
      // Fall back to short-lived token if long-lived exchange fails
      console.warn('Falling back to short-lived token');
      longLivedToken = shortLivedToken;
    }

    // Get user from session
    const user = await resolveUser(req);
    
    if (!user) {
      console.error('Facebook OAuth: User authentication required');
      const dashboardUrl = new URL('/dashboard', req.nextUrl.origin);
      dashboardUrl.searchParams.set('facebook_error', 'User authentication required. Please ensure you are logged in.');
      return NextResponse.redirect(dashboardUrl);
    }

    // Calculate expiration timestamp
    const expiresAt = longLivedToken.expires_in
      ? Date.now() + longLivedToken.expires_in * 1000
      : null;

    // Get user's Facebook profile info (optional, for storing username)
    let platformUserId: string | null = null;
    let platformUsername: string | null = null;

    try {
      const graphApiVersion = process.env.FACEBOOK_GRAPH_API_VERSION || 'v19.0';
      const profileResponse = await fetch(
        `https://graph.facebook.com/${graphApiVersion}/me?access_token=${longLivedToken.access_token}&fields=id,name`
      );
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        platformUserId = profileData.id || null;
        platformUsername = profileData.name || null;
        console.log(`Facebook profile: ${platformUsername} (${platformUserId})`);
      }
    } catch (profileError) {
      // Non-critical error - we can still store the token without profile info
      console.warn('Failed to fetch Facebook profile:', profileError);
    }

    // Step 3: Fetch user's Facebook Pages
    console.log('Step 3: Fetching Facebook Pages...');
    let facebookPageId: string | null = null;
    let facebookPageName: string | null = null;
    let facebookPageAccessToken: string | null = null;
    let allPages: FacebookPage[] = [];

    try {
      allPages = await fetchUserPages(longLivedToken.access_token);
      
      if (allPages.length > 0) {
        // Step 4: Select the first page (or return list for future UI selection)
        const selectedPage = allPages[0];
        
        // Validate page has required fields
        if (selectedPage.id && selectedPage.name && selectedPage.access_token) {
          facebookPageId = selectedPage.id;
          facebookPageName = selectedPage.name;
          facebookPageAccessToken = selectedPage.access_token;
          
          console.log(`Selected Facebook Page: ${facebookPageName} (${facebookPageId})`);
          
          // Log all available pages for future UI selection
          if (allPages.length > 1) {
            console.log(`User has ${allPages.length} pages available:`);
            allPages.forEach((page, index) => {
              console.log(`  ${index + 1}. ${page.name} (${page.id})`);
            });
          }
        } else {
          console.warn('Selected page missing required fields:', selectedPage);
        }
      } else {
        console.warn('User has no Facebook Pages. Posting will not be available.');
      }
    } catch (pagesError: unknown) {
      const errorMessage = pagesError instanceof Error ? pagesError.message : 'Unknown error';
      // Non-critical error - user token is still stored, but Page posting won't work
      console.warn('Error fetching Facebook Pages:', errorMessage);
    }

    // Step 5: Store or update the connection in Supabase
    console.log('Step 5: Storing connection in database...');
    const { data: existingConnection } = await supabaseAdmin
      .from('connected_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', PLATFORMS.FACEBOOK)
      .single();

    const connectionData = {
      access_token: longLivedToken.access_token,
      expires_at: expiresAt,
      platform_user_id: platformUserId,
      platform_username: platformUsername,
      facebook_page_id: facebookPageId,
      facebook_page_name: facebookPageName,
      facebook_page_access_token: facebookPageAccessToken,
    };

    if (existingConnection) {
      // Update existing connection
      const { error: updateError } = await supabaseAdmin
        .from('connected_accounts')
        .update(connectionData)
        .eq('id', existingConnection.id);

      if (updateError) {
        console.error('Failed to update connection:', updateError);
        throw updateError;
      }
      console.log('Updated existing Facebook connection');
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
        console.error('Failed to insert connection:', insertError);
        throw insertError;
      }
      console.log('Created new Facebook connection');
    }

    // Step 6: Redirect to dashboard with success parameter
    console.log('Facebook OAuth flow completed successfully');
    const dashboardUrl = new URL('/dashboard', req.nextUrl.origin);
    dashboardUrl.searchParams.set('facebook', 'connected');
    return NextResponse.redirect(dashboardUrl);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to complete Facebook OAuth';
    console.error('Facebook OAuth exchange error:', error);
    const dashboardUrl = new URL('/dashboard', req.nextUrl.origin);
    dashboardUrl.searchParams.set('facebook_error', errorMessage);
    return NextResponse.redirect(dashboardUrl);
  }
}
