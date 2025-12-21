import { NextRequest, NextResponse } from 'next/server';
import { getFacebookAuthUrl, validateFacebookEnv } from '@/lib/facebook/oauth';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/auth-helpers-nextjs';

function getAppUrl(req: NextRequest) {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl) return envUrl.replace(/\/$/, '');
  return req.nextUrl.origin;
}

/**
 * GET: Generate Facebook OAuth authorization URL
 * Returns the URL the user should be redirected to for Facebook OAuth
 */
export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Enforce authentication BEFORE starting OAuth.
    // This must restore the session from cookies on the server.
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => cookieStore.getAll().map(({ name, value }) => ({ name, value })),
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const appUrl = getAppUrl(req);
      return NextResponse.redirect(new URL('/auth/login', appUrl));
    }

    // Validate environment variables (will throw if missing)
    try {
      validateFacebookEnv();
    } catch (envError: unknown) {
      const message = envError instanceof Error ? envError.message : 'Facebook OAuth not configured';
      return NextResponse.json(
        { error: message },
        { status: 500 }
      );
    }

    // Prefer configured redirect URI; otherwise build it from NEXT_PUBLIC_APP_URL.
    const appUrl = getAppUrl(req);
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI || `${appUrl}/api/facebook/exchange`;
    const authUrl = getFacebookAuthUrl(redirectUri);
    return NextResponse.json({ url: authUrl });
  } catch (error: unknown) {
    console.error('Error generating Facebook OAuth URL:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate Facebook OAuth URL';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
