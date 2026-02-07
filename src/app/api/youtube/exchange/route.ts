import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { PLATFORMS } from '@/lib/platforms';
import { exchangeYouTubeCode, validateYouTubeEnv } from '@/lib/youtube/oauth';
import { fetchYouTubeChannel } from '@/lib/youtube/client';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET: Handle YouTube OAuth callback
 * Exchanges authorization code for access token and stores it in the database
 */
export async function GET(req: NextRequest) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, '') || req.nextUrl.origin;

    // Get authorization code from query params
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const state = searchParams.get('state');

    // Handle OAuth errors from Google
    if (error) {
      console.error('YouTube OAuth error:', { error, errorDescription });
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      dashboardUrl.searchParams.set('youtube_error', errorDescription || error);
      return NextResponse.redirect(dashboardUrl);
    }

    if (!code) {
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      dashboardUrl.searchParams.set('youtube_error', 'Missing authorization code');
      return NextResponse.redirect(dashboardUrl);
    }

    // Validate environment variables (will throw if missing)
    try {
      validateYouTubeEnv();
    } catch (envError: any) {
      console.error('YouTube OAuth environment validation failed:', envError);
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      dashboardUrl.searchParams.set('youtube_error', 'Server configuration error');
      return NextResponse.redirect(dashboardUrl);
    }

    // Get redirect URI from environment or construct from request
    let redirectUri = process.env.YOUTUBE_REDIRECT_URI;
    if (!redirectUri) {
      // Fallback: construct from app URL
      redirectUri = `${appUrl}/api/youtube/exchange`;
      console.warn('YOUTUBE_REDIRECT_URI not set, using fallback:', redirectUri);
    }

    const storedState = req.cookies.get('youtube_oauth_state')?.value;
    const codeVerifier = req.cookies.get('youtube_oauth_verifier')?.value;

    if (!storedState || !state || storedState !== state) {
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      dashboardUrl.searchParams.set('youtube_error', 'Invalid OAuth state. Please try again.');
      return NextResponse.redirect(dashboardUrl);
    }

    if (!codeVerifier) {
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      dashboardUrl.searchParams.set('youtube_error', 'Missing OAuth verifier. Please try again.');
      return NextResponse.redirect(dashboardUrl);
    }

    // Exchange code for access token
    let tokenResponse;
    try {
      tokenResponse = await exchangeYouTubeCode(code, redirectUri, codeVerifier);
    } catch (tokenError: any) {
      console.error('Token exchange error:', tokenError);
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      dashboardUrl.searchParams.set('youtube_error', `Failed to exchange authorization code: ${tokenError.message}`);
      return NextResponse.redirect(dashboardUrl);
    }

    // Get user from Supabase session cookies (no Authorization header / no manual cookie parsing)
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      dashboardUrl.searchParams.set('youtube_error', 'User authentication required. Please ensure you are logged in.');
      return NextResponse.redirect(dashboardUrl);
    }

    // Calculate expiration timestamp
    const expiresAt = tokenResponse.expires_in
      ? Date.now() + tokenResponse.expires_in * 1000
      : null;

    // Get user's YouTube profile info
    const channelInfo = await fetchYouTubeChannel(tokenResponse.access_token);

    const { data: existingAccount } = await supabaseAdmin
      .from('platform_accounts')
      .select('id, refresh_token')
      .eq('user_id', user.id)
      .eq('platform', PLATFORMS.YOUTUBE)
      .eq('platform_account_id', channelInfo.id)
      .maybeSingle();

    const refreshToken = tokenResponse.refresh_token || existingAccount?.refresh_token;
    if (!refreshToken) {
      throw new Error('Missing YouTube refresh token. Please re-authorize and grant consent.');
    }

    const payload = {
      user_id: user.id,
      platform: PLATFORMS.YOUTUBE,
      platform_account_id: channelInfo.id,
      display_name: channelInfo.title,
      refresh_token: refreshToken,
      access_token: tokenResponse.access_token,
      token_expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    };

    if (existingAccount) {
      const { error: updateError } = await supabaseAdmin
        .from('platform_accounts')
        .update(payload)
        .eq('id', existingAccount.id);
      if (updateError) {
        throw updateError;
      }
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('platform_accounts')
        .insert(payload);
      if (insertError) {
        throw insertError;
      }
    }

    // Redirect to accounts page with success parameter
    const dashboardUrl = new URL('/dashboard/accounts', appUrl);
    dashboardUrl.searchParams.set('youtube', 'connected');
    const response = NextResponse.redirect(dashboardUrl);
    response.cookies.set('youtube_oauth_state', '', { path: '/api/youtube/exchange', maxAge: 0 });
    response.cookies.set('youtube_oauth_verifier', '', { path: '/api/youtube/exchange', maxAge: 0 });
    return response;
  } catch (error: any) {
    console.error('YouTube OAuth exchange error:', error);
    const dashboardUrl = new URL('/dashboard/accounts', process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, '') || req.nextUrl.origin);
    dashboardUrl.searchParams.set('youtube_error', error.message || 'Failed to complete YouTube OAuth');
    return NextResponse.redirect(dashboardUrl);
  }
}



















