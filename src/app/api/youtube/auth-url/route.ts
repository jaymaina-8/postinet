import { NextRequest, NextResponse } from 'next/server';
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

    const authUrl = getYouTubeAuthUrl(redirectUri);
    return NextResponse.json({ url: authUrl });
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

























