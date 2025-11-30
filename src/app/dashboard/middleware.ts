import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export async function middleware(request: NextRequest) {
  // Supabase stores the access token in a cookie
  // The cookie name pattern is: sb-<project-ref>-auth-token
  const projectRef = supabaseUrl.split('//')[1].split('.')[0];
  
  // Try to find the access token in cookies
  // Supabase may store it in different cookie formats
  let accessToken: string | undefined;
  
  // Check for the standard Supabase cookie
  const authCookie = request.cookies.get(`sb-${projectRef}-auth-token`);
  if (authCookie) {
    try {
      const session = JSON.parse(authCookie.value);
      accessToken = session?.access_token;
    } catch {
      // Cookie might not be JSON
    }
  }
  
  // Also check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    accessToken = authHeader.substring(7);
  }

  // If no token found, allow the request through - client-side will handle auth
  // The dashboard layout will check auth and redirect if needed
  if (!accessToken) {
    return NextResponse.next();
  }

  // Create Supabase client and verify user
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

  if (!user || userError) {
    return NextResponse.next(); // Let client-side handle redirect
  }

  // Check onboarding status
  const { data: profile } = await supabase
    .from('user_profile')
    .select('onboarded')
    .eq('id', user.id)
    .single();
    
  // If not onboarded, redirect to onboarding
  if (!profile?.onboarded) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"]
};
