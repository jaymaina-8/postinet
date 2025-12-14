import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { PLATFORMS } from '@/lib/platforms';
import { exchangeYouTubeCode, validateYouTubeEnv, getYouTubeProfile } from '@/lib/youtube/oauth';

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
 * GET: Handle YouTube OAuth callback
 * Exchanges authorization code for access token and stores it in the database
 */
export async function GET(req: NextRequest) {
  try {
    // Get authorization code from query params
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors from Google
    if (error) {
      console.error('YouTube OAuth error:', { error, errorDescription });
      const dashboardUrl = new URL('/dashboard', req.nextUrl.origin);
      dashboardUrl.searchParams.set('youtube_error', errorDescription || error);
      return NextResponse.redirect(dashboardUrl);
    }

    if (!code) {
      const dashboardUrl = new URL('/dashboard', req.nextUrl.origin);
      dashboardUrl.searchParams.set('youtube_error', 'Missing authorization code');
      return NextResponse.redirect(dashboardUrl);
    }

    // Validate environment variables (will throw if missing)
    try {
      validateYouTubeEnv();
    } catch (envError: any) {
      console.error('YouTube OAuth environment validation failed:', envError);
      const dashboardUrl = new URL('/dashboard', req.nextUrl.origin);
      dashboardUrl.searchParams.set('youtube_error', 'Server configuration error');
      return NextResponse.redirect(dashboardUrl);
    }

    // Get redirect URI from environment or construct from request
    let redirectUri = process.env.YOUTUBE_REDIRECT_URI;
    if (!redirectUri) {
      // Fallback: construct from request origin
      const origin = req.headers.get('origin') || req.nextUrl.origin;
      redirectUri = `${origin}/api/youtube/exchange`;
      console.warn('YOUTUBE_REDIRECT_URI not set, using fallback:', redirectUri);
    }

    // Exchange code for access token
    let tokenResponse;
    try {
      tokenResponse = await exchangeYouTubeCode(code, redirectUri);
    } catch (tokenError: any) {
      console.error('Token exchange error:', tokenError);
      const dashboardUrl = new URL('/dashboard', req.nextUrl.origin);
      dashboardUrl.searchParams.set('youtube_error', `Failed to exchange authorization code: ${tokenError.message}`);
      return NextResponse.redirect(dashboardUrl);
    }

    // Get user from session
    const user = await resolveUser(req);
    
    if (!user) {
      const dashboardUrl = new URL('/dashboard', req.nextUrl.origin);
      dashboardUrl.searchParams.set('youtube_error', 'User authentication required. Please ensure you are logged in.');
      return NextResponse.redirect(dashboardUrl);
    }

    // Calculate expiration timestamp
    const expiresAt = tokenResponse.expires_in
      ? Date.now() + tokenResponse.expires_in * 1000
      : null;

    // Get user's YouTube profile info
    let platformUserId: string | null = null;
    let platformUsername: string | null = null;

    try {
      const profileData = await getYouTubeProfile(tokenResponse.access_token);
      platformUserId = profileData.id || null;
      platformUsername = profileData.name || null;
    } catch (profileError) {
      // Non-critical error - we can still store the token without profile info
      console.warn('Failed to fetch YouTube profile:', profileError);
    }

    // Store or update the connection in the database
    const { data: existingConnection } = await supabaseAdmin
      .from('connected_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', PLATFORMS.YOUTUBE)
      .single();

    if (existingConnection) {
      // Update existing connection
      const { error: updateError } = await supabaseAdmin
        .from('connected_accounts')
        .update({
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token,
          expires_at: expiresAt,
          platform_user_id: platformUserId,
          platform_username: platformUsername,
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
          platform: PLATFORMS.YOUTUBE,
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token,
          expires_at: expiresAt,
          platform_user_id: platformUserId,
          platform_username: platformUsername,
        });

      if (insertError) {
        throw insertError;
      }
    }

    // Redirect to dashboard with success parameter
    const dashboardUrl = new URL('/dashboard', req.nextUrl.origin);
    dashboardUrl.searchParams.set('youtube_connected', 'true');
    return NextResponse.redirect(dashboardUrl);
  } catch (error: any) {
    console.error('YouTube OAuth exchange error:', error);
    const dashboardUrl = new URL('/dashboard', req.nextUrl.origin);
    dashboardUrl.searchParams.set('youtube_error', error.message || 'Failed to complete YouTube OAuth');
    return NextResponse.redirect(dashboardUrl);
  }
}



















