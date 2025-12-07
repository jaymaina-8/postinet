import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { PLATFORMS } from '@/lib/platforms';
import { exchangeFacebookCode, validateFacebookEnv } from '@/lib/facebook/oauth';

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
      const dashboardUrl = new URL('/dashboard', req.nextUrl.origin);
      dashboardUrl.searchParams.set('facebook_error', 'Missing authorization code');
      return NextResponse.redirect(dashboardUrl);
    }

    // Validate environment variables (will throw if missing)
    try {
      validateFacebookEnv();
    } catch (envError: any) {
      console.error('Facebook OAuth environment validation failed:', envError);
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

    // Exchange code for access token
    let tokenResponse;
    try {
      tokenResponse = await exchangeFacebookCode(code, redirectUri);
    } catch (tokenError: any) {
      console.error('Token exchange error:', tokenError);
      const dashboardUrl = new URL('/dashboard', req.nextUrl.origin);
      dashboardUrl.searchParams.set('facebook_error', `Failed to exchange authorization code: ${tokenError.message}`);
      return NextResponse.redirect(dashboardUrl);
    }

    // Get user from session (we'll need to pass this via state or session)
    // For now, we'll try to get it from a cookie or session
    // In a production app, you'd typically pass user_id via state parameter
    // For this implementation, we'll require the user to be authenticated via header
    const user = await resolveUser(req);
    
    if (!user) {
      // If no user in header, try to get from session cookie
      // This is a fallback - ideally state parameter should include user_id
      const dashboardUrl = new URL('/dashboard', req.nextUrl.origin);
      dashboardUrl.searchParams.set('facebook_error', 'User authentication required. Please ensure you are logged in.');
      return NextResponse.redirect(dashboardUrl);
    }

    // Calculate expiration timestamp
    const expiresAt = tokenResponse.expires_in
      ? Date.now() + tokenResponse.expires_in * 1000
      : null;

    // Get user's Facebook profile info (optional, for storing username)
    let platformUserId: string | null = null;
    let platformUsername: string | null = null;

    try {
      const profileResponse = await fetch(
        `https://graph.facebook.com/v19.0/me?access_token=${tokenResponse.access_token}&fields=id,name`
      );
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        platformUserId = profileData.id || null;
        platformUsername = profileData.name || null;
      }
    } catch (profileError) {
      // Non-critical error - we can still store the token without profile info
      console.warn('Failed to fetch Facebook profile:', profileError);
    }

    // Fetch user's Facebook Pages
    let facebookPageId: string | null = null;
    let facebookPageName: string | null = null;
    let facebookPageAccessToken: string | null = null;

    try {
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${tokenResponse.access_token}`
      );
      
      if (pagesResponse.ok) {
        const pagesData = await pagesResponse.json();
        
        if (pagesData.data && pagesData.data.length > 0) {
          // For now, automatically select the first page
          // TODO: Add UI for page selection when multiple pages exist
          const selectedPage = pagesData.data[0];
          facebookPageId = selectedPage.id || null;
          facebookPageName = selectedPage.name || null;
          facebookPageAccessToken = selectedPage.access_token || null;
          
          console.log(`Selected Facebook Page: ${facebookPageName} (${facebookPageId})`);
          
          // If multiple pages, log them for future UI selection
          if (pagesData.data.length > 1) {
            console.log(`User has ${pagesData.data.length} pages. Currently using first page.`);
          }
        } else {
          console.warn('User has no Facebook Pages. Posting will not be available.');
        }
      } else {
        const errorData = await pagesResponse.json();
        console.warn('Failed to fetch Facebook Pages:', errorData);
      }
    } catch (pagesError) {
      // Non-critical error - user token is still stored, but Page posting won't work
      console.warn('Error fetching Facebook Pages:', pagesError);
    }

    // Store or update the connection in the database
    const { data: existingConnection } = await supabaseAdmin
      .from('connected_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', PLATFORMS.FACEBOOK)
      .single();

    if (existingConnection) {
      // Update existing connection
      const { error: updateError } = await supabaseAdmin
        .from('connected_accounts')
        .update({
          access_token: tokenResponse.access_token,
          expires_at: expiresAt,
          platform_user_id: platformUserId,
          platform_username: platformUsername,
          facebook_page_id: facebookPageId,
          facebook_page_name: facebookPageName,
          facebook_page_access_token: facebookPageAccessToken,
        })
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
          access_token: tokenResponse.access_token,
          expires_at: expiresAt,
          platform_user_id: platformUserId,
          platform_username: platformUsername,
          facebook_page_id: facebookPageId,
          facebook_page_name: facebookPageName,
          facebook_page_access_token: facebookPageAccessToken,
        });

      if (insertError) {
        throw insertError;
      }
    }

    // Redirect to dashboard with success parameter
    const dashboardUrl = new URL('/dashboard', req.nextUrl.origin);
    dashboardUrl.searchParams.set('facebook_connected', 'true');
    return NextResponse.redirect(dashboardUrl);
  } catch (error: any) {
    console.error('Facebook OAuth exchange error:', error);
    const dashboardUrl = new URL('/dashboard', req.nextUrl.origin);
    dashboardUrl.searchParams.set('facebook_error', error.message || 'Failed to complete Facebook OAuth');
    return NextResponse.redirect(dashboardUrl);
  }
}

