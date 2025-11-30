import { NextRequest, NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";

const twitterClientId = process.env.TWITTER_CLIENT_ID;
const twitterClientSecret = process.env.TWITTER_CLIENT_SECRET;
const twitterRedirectUri =
  process.env.TWITTER_REDIRECT_URI || process.env.NEXT_PUBLIC_TWITTER_REDIRECT_URI;

function missingEnv() {
  return !twitterClientId || !twitterClientSecret || !twitterRedirectUri;
}

export async function POST(req: NextRequest) {
  if (missingEnv()) {
    return NextResponse.json(
      { error: "Twitter OAuth environment variables are not configured." },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing Supabase session." }, { status: 401 });
  }
  const supabaseAccessToken = authHeader.split(" ")[1]?.trim();
  if (!supabaseAccessToken) {
    return NextResponse.json({ error: "Invalid Supabase session." }, { status: 401 });
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(supabaseAccessToken);
  if (userError || !userData?.user) {
    return NextResponse.json({ error: "Unable to resolve Supabase user." }, { status: 401 });
  }

  const { code, codeVerifier } = await req.json();

  if (!code || !codeVerifier) {
    return NextResponse.json({ error: "Missing authorization code or verifier." }, { status: 400 });
  }

  const tokenParams = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    client_id: twitterClientId!,
    redirect_uri: twitterRedirectUri!,
    code_verifier: codeVerifier,
  });

  const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${twitterClientId}:${twitterClientSecret}`).toString(
        "base64"
      )}`,
    },
    body: tokenParams.toString(),
  });

  if (!tokenResponse.ok) {
    const details = await tokenResponse.text();
    return NextResponse.json(
      { error: "Twitter token exchange failed.", details },
      { status: tokenResponse.status }
    );
  }

  const tokenData = await tokenResponse.json();
  const expiresAt = tokenData.expires_in
    ? Math.floor(Date.now() / 1000) + tokenData.expires_in
    : null;

  let twitterProfile: any = null;
  try {
    const profileResponse = await fetch("https://api.twitter.com/2/users/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    if (profileResponse.ok) {
      twitterProfile = await profileResponse.json();
    }
  } catch (error) {
    console.error("Failed to fetch Twitter profile", error);
  }

  const { error: upsertError } = await supabaseAdmin.from("connected_accounts").upsert(
    {
      user_id: userData.user.id,
      platform: "twitter",
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt,
      platform_user_id: twitterProfile?.data?.id || null,
      platform_username: twitterProfile?.data?.username || null,
      created_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,platform",
    }
  );

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    profile: twitterProfile?.data || null,
  });
}


