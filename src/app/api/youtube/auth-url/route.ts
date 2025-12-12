import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeAuthUrl, validateYouTubeEnv } from '@/lib/youtube/oauth';

async function resolveUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1]?.trim();
  if (!token) return null;
  
  // Import supabaseAdmin dynamically to avoid circular dependencies
  const supabaseAdmin = (await import('@/lib/supabaseAdmin')).default;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    return null;
  }
  return data.user;
}

/**
 * GET: Generate YouTube OAuth authorization URL
 * Returns the URL the user should be redirected to for YouTube OAuth
 */
export async function GET(req: NextRequest) {
  try {
    const user = await resolveUser(req);
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

    // Get redirect URI from environment or construct from request
    const redirectUri = process.env.YOUTUBE_REDIRECT_URI;
    if (!redirectUri) {
      // Fallback: construct from request origin
      const origin = req.headers.get('origin') || req.nextUrl.origin;
      const fallbackRedirectUri = `${origin}/api/youtube/exchange`;
      
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











