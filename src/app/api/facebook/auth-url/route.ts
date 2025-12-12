import { NextRequest, NextResponse } from 'next/server';
import { getFacebookAuthUrl, checkFacebookConfig, getFacebookAuthUrlWithRedirect } from '@/lib/facebook';

/**
 * Facebook OAuth Authorization URL Route
 * 
 * Returns the URL the user should be redirected to for Facebook OAuth.
 * 
 * Production URLs:
 * - App URL: https://www.postinet.pro
 * - API callback: https://www.postinet.pro/api/facebook/exchange
 * - Local dev callback: http://localhost:3000/api/facebook/exchange
 */

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
 * GET: Generate Facebook OAuth authorization URL
 * Returns the URL the user should be redirected to for Facebook OAuth
 */
export async function GET(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate environment variables
    const config = checkFacebookConfig();
    if (!config.isConfigured) {
      console.error('Facebook OAuth not configured. Missing:', config.missing.join(', '));
      return NextResponse.json(
        { error: `Facebook OAuth not configured. Missing: ${config.missing.join(', ')}` },
        { status: 500 }
      );
    }

    // Get redirect URI from environment or construct from request
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI;
    if (!redirectUri) {
      // Fallback: construct from request origin
      const origin = req.headers.get('origin') || req.nextUrl.origin;
      const fallbackRedirectUri = `${origin}/api/facebook/exchange`;
      
      // Try to use fallback, but warn if FACEBOOK_REDIRECT_URI is not set
      console.warn('FACEBOOK_REDIRECT_URI not set, using fallback:', fallbackRedirectUri);
      
      const authUrl = getFacebookAuthUrlWithRedirect(fallbackRedirectUri);
      return NextResponse.json({ authUrl });
    }

    const authUrl = getFacebookAuthUrl();
    return NextResponse.json({ authUrl });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate Facebook OAuth URL';
    console.error('Error generating Facebook OAuth URL:', error);
    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

