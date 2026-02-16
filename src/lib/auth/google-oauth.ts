"use client";

import supabase from "@/lib/supabaseClient";

const PROD_CALLBACK_URL = "https://postinet.pro/auth/callback";

function getGoogleOAuthRedirectTo(): string {
  // Requirement: canonical Postinet URL in prod; localhost callback in local dev.
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return `${window.location.origin}/auth/callback`;
    }
  }
  return PROD_CALLBACK_URL;
}

export async function startGoogleOAuth(): Promise<{ error?: string }> {
  if (!supabase) {
    return { error: "Auth is not configured." };
  }

  const redirectTo = getGoogleOAuthRedirectTo();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (error) {
    return { error: error.message || "Google sign-in failed." };
  }

  // OAuth redirects away on success.
  return {};
}

