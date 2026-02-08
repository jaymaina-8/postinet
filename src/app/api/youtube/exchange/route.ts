import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { PLATFORMS } from '@/lib/platforms';
import { validateYouTubeEnv } from '@/lib/youtube/oauth';
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

    const redirectUri = `${appUrl}/api/youtube/exchange`;
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim() || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() || '';
    const hasClientId = Boolean(clientId);
    const hasClientSecret = Boolean(clientSecret);
    console.log('[YouTube OAuth] redirect_uri=', redirectUri);
    console.log('[YouTube OAuth] env GOOGLE_CLIENT_ID set?', hasClientId);
    console.log('[YouTube OAuth] env GOOGLE_CLIENT_SECRET set?', hasClientSecret);

    if (!hasClientId || !hasClientSecret) {
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      dashboardUrl.searchParams.set('youtube_error', 'unauthorized');
      return NextResponse.redirect(dashboardUrl);
    }

    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: params.toString(),
    });

    const tokenData = await tokenResponse.json().catch(() => ({}));
    if (!tokenResponse.ok) {
      console.error('[YouTube OAuth] token exchange failed', {
        status: tokenResponse.status,
        body: tokenData,
      });
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      dashboardUrl.searchParams.set('youtube_error', 'unauthorized');
      return NextResponse.redirect(dashboardUrl);
    }

    if (!tokenData?.access_token) {
      console.error('[YouTube OAuth] token response missing access_token', tokenData);
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      dashboardUrl.searchParams.set('youtube_error', 'unauthorized');
      return NextResponse.redirect(dashboardUrl);
    }

    const tokenResponseData = tokenData as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };

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
    const expiresAt = tokenResponseData.expires_in
      ? Date.now() + tokenResponseData.expires_in * 1000
      : null;

    // Get user's YouTube profile info
    const channelInfo = await fetchYouTubeChannel(tokenResponseData.access_token);

    const { data: existingAccount } = await supabaseAdmin
      .from('platform_accounts')
      .select('id, refresh_token')
      .eq('user_id', user.id)
      .eq('platform', PLATFORMS.YOUTUBE)
      .eq('platform_account_id', channelInfo.id)
      .maybeSingle();

    const refreshToken = tokenResponseData.refresh_token || existingAccount?.refresh_token;
    if (!refreshToken) {
      throw new Error('Missing YouTube refresh token. Please re-authorize and grant consent.');
    }

    const payload = {
      user_id: user.id,
      platform: PLATFORMS.YOUTUBE,
      platform_account_id: channelInfo.id,
      display_name: channelInfo.title,
      refresh_token: refreshToken,
      access_token: tokenResponseData.access_token,
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
    return NextResponse.redirect(dashboardUrl);
  } catch (error: any) {
    console.error('YouTube OAuth exchange error:', error);
    const dashboardUrl = new URL('/dashboard/accounts', process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, '') || req.nextUrl.origin);
    dashboardUrl.searchParams.set('youtube_error', 'unauthorized');
    return NextResponse.redirect(dashboardUrl);
  }
}



















