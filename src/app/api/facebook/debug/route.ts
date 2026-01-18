import { NextRequest, NextResponse } from 'next/server';

/**
 * GET: Debug endpoint to check Facebook OAuth configuration
 * This helps diagnose configuration issues
 */
export async function GET(req: NextRequest) {
  try {
    const config = {
      hasAppId: !!process.env.FACEBOOK_APP_ID,
      hasAppSecret: !!process.env.FACEBOOK_APP_SECRET,
      appIdLength: process.env.FACEBOOK_APP_ID?.length || 0,
      appSecretLength: process.env.FACEBOOK_APP_SECRET?.length || 0,
      // Show first 4 chars of App ID for verification (safe to expose)
      appIdPrefix: process.env.FACEBOOK_APP_ID?.substring(0, 4) || 'N/A',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'N/A',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'N/A',
    };

    return NextResponse.json({
      status: 'ok',
      config,
      message: 'Facebook OAuth configuration check',
    });
  } catch (error: unknown) {
    console.error('Debug endpoint error:', error);
    const message = error instanceof Error ? error.message : 'Debug check failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
