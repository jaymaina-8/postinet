import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getYouTubeAuthUrl, validateYouTubeEnv } from '@/lib/youtube/oauth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET: Generate YouTube OAuth authorization URL
 * Returns the URL the user should be redirected to for YouTube OAuth
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate environment variables (will throw if missing)
    try {
      validateYouTubeEnv();
    } catch (envError: any) {
      return NextResponse.json(
        { error: envError.message || 'YouTube OAuth not configured' },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, '') || req.nextUrl.origin;

    // Get redirect URI from environment or construct from app URL
    const redirectUri = process.env.YOUTUBE_REDIRECT_URI;
    if (!redirectUri) {
      const fallbackRedirectUri = `${appUrl}/api/youtube/exchange`;
      
      // Try to use fallback, but warn if YOUTUBE_REDIRECT_URI is not set
      console.warn('YOUTUBE_REDIRECT_URI not set, using fallback:', fallbackRedirectUri);
      
      const authUrl = getYouTubeAuthUrl(fallbackRedirectUri);
      return NextResponse.json({ url: authUrl });
    }

    const codeVerifier = crypto.randomBytes(64).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    const state = crypto.randomBytes(16).toString('base64url');

    const authUrl = getYouTubeAuthUrl(redirectUri, {
      state,
      codeChallenge,
    });

    const response = NextResponse.json({ url: authUrl });
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/api/youtube/exchange',
      maxAge: 60 * 10,
    };

    response.cookies.set('youtube_oauth_state', state, cookieOptions);
    response.cookies.set('youtube_oauth_verifier', codeVerifier, cookieOptions);
    return response;
  } catch (error: any) {
    console.error('Error generating YouTube OAuth URL:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to generate YouTube OAuth URL',
      },
      { status: 500 }
    );
  }
}

























