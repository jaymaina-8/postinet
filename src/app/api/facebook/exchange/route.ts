import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { PLATFORMS } from '@/lib/platforms';
import {
  exchangeFacebookCode,
  getFacebookPages,
  getFacebookProfile,
  getLongLivedToken,
  validateFacebookEnv,
} from '@/lib/facebook/oauth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, '') || req.nextUrl.origin;
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

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

    try {
      validateFacebookEnv();
    } catch (envError: any) {
      console.error('Facebook OAuth environment validation failed:', envError);
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      dashboardUrl.searchParams.set('facebook_error', 'Server configuration error');
      return NextResponse.redirect(dashboardUrl);
    }

    let redirectUri = process.env.FACEBOOK_REDIRECT_URI?.trim();
    if (!redirectUri) {
      redirectUri = `${appUrl}/api/facebook/exchange`;
      console.warn('FACEBOOK_REDIRECT_URI not set, using fallback:', redirectUri);
    }

    let tokenResponse = await exchangeFacebookCode(code, redirectUri);
    try {
      tokenResponse = await getLongLivedToken(tokenResponse.access_token);
    } catch (tokenError) {
      console.warn('Failed to upgrade Facebook token to long-lived token:', tokenError);
    }

    const userAccessToken = tokenResponse.access_token;
    const expiresAt = tokenResponse.expires_in
      ? Date.now() + tokenResponse.expires_in * 1000
      : null;

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      dashboardUrl.searchParams.set('facebook_error', 'User authentication required. Please log in again.');
      return NextResponse.redirect(dashboardUrl);
    }

    let platformUserId: string | null = null;
    let platformUsername: string | null = null;
    try {
      const profileData = await getFacebookProfile(userAccessToken);
      platformUserId = profileData.id || null;
      platformUsername = profileData.name || null;
    } catch (profileError) {
      console.warn('Failed to fetch Facebook profile:', profileError);
    }

    let pages;
    try {
      pages = await getFacebookPages(userAccessToken);
    } catch (pagesError) {
      console.error('Failed to fetch Facebook Pages:', pagesError);
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      dashboardUrl.searchParams.set('facebook_error', 'Failed to fetch Facebook Pages. Please try again.');
      return NextResponse.redirect(dashboardUrl);
    }

    if (!pages?.length) {
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      dashboardUrl.searchParams.set(
        'facebook_error',
        'No Facebook Pages found. Please create a Page and try again.'
      );
      return NextResponse.redirect(dashboardUrl);
    }

    const selectedPage = pages[0];
    if (!selectedPage.access_token) {
      const dashboardUrl = new URL('/dashboard/accounts', appUrl);
      dashboardUrl.searchParams.set('facebook_error', 'Facebook Page token missing. Please try again.');
      return NextResponse.redirect(dashboardUrl);
    }

    const { data: existingConnection } = await supabaseAdmin
      .from('connected_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', PLATFORMS.FACEBOOK)
      .single();

    const connectionPayloadBase = {
      access_token: userAccessToken,
      refresh_token: null,
      expires_at: expiresAt,
      platform_username: platformUsername,
      facebook_page_id: selectedPage.id,
      facebook_page_name: selectedPage.name,
      facebook_page_access_token: selectedPage.access_token,
    };

    const connectionPayloadWithUserId = {
      ...connectionPayloadBase,
      platform_user_id: platformUserId,
    };

    const isMissingPlatformUserIdColumn = (message: string | undefined) =>
      !!message &&
      (message.includes("platform_user_id") ||
        message.includes("schema cache") ||
        message.toLowerCase().includes("does not exist"));

    if (existingConnection) {
      const { error: updateError } = await supabaseAdmin
        .from('connected_accounts')
        .update(connectionPayloadWithUserId)
        .eq('id', existingConnection.id);

      if (updateError && isMissingPlatformUserIdColumn(updateError.message)) {
        const { error: retryError } = await supabaseAdmin
          .from('connected_accounts')
          .update(connectionPayloadBase)
          .eq('id', existingConnection.id);
        if (retryError) {
          throw retryError;
        }
      } else if (updateError) {
        throw updateError;
      }
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('connected_accounts')
        .insert({
          user_id: user.id,
          platform: PLATFORMS.FACEBOOK,
          ...connectionPayloadWithUserId,
        });

      if (insertError && isMissingPlatformUserIdColumn(insertError.message)) {
        const { error: retryError } = await supabaseAdmin
          .from('connected_accounts')
          .insert({
            user_id: user.id,
            platform: PLATFORMS.FACEBOOK,
            ...connectionPayloadBase,
          });
        if (retryError) {
          throw retryError;
        }
      } else if (insertError) {
        throw insertError;
      }
    }

    const dashboardUrl = new URL('/dashboard/accounts', appUrl);
    dashboardUrl.searchParams.set('facebook', 'connected');
    return NextResponse.redirect(dashboardUrl);
  } catch (error: any) {
    console.error('Facebook OAuth exchange error:', error);
    const dashboardUrl = new URL('/dashboard/accounts', process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, '') || req.nextUrl.origin);
    dashboardUrl.searchParams.set('facebook_error', error.message || 'Failed to complete Facebook OAuth');
    return NextResponse.redirect(dashboardUrl);
  }
}
