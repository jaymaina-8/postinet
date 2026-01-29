import { NextRequest, NextResponse } from 'next/server';
import { getFacebookAuthUrl } from '@/lib/facebook/oauth';

/**
 * GET: Generate Facebook OAuth authorization URL
 * Returns the URL for the client to redirect to for Facebook OAuth
 */
export async function GET(req: NextRequest) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, '') || req.nextUrl.origin;
    let redirectUri = process.env.FACEBOOK_REDIRECT_URI?.trim();
    if (!redirectUri) {
      redirectUri = `${appUrl}/api/facebook/exchange`;
    }
    
    // Generate Facebook OAuth URL with direct Facebook OAuth (not Supabase)
    // This bypasses Supabase's PKCE state management to avoid conflicts with existing sessions
    const authUrl = getFacebookAuthUrl(redirectUri);
    
    return NextResponse.json({ url: authUrl });
  } catch (error: unknown) {
    console.error('Failed to generate Facebook OAuth URL:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate OAuth URL';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
