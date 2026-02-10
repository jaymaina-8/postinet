"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import supabase from "@/lib/supabaseClient";

/**
 * OAuth callback: Supabase redirects here after Google (or other provider) sign-in.
 * PKCE: we exchange the code for a session, then redirect to onboarding or dashboard.
 * Google client ID/secret are configured in Supabase Dashboard only; never in code.
 * In Supabase: Authentication → URL Configuration → Redirect URLs must include:
 *   https://your-domain.com/auth/callback and http://localhost:3000/auth/callback
 */
function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get("code");
      const next = searchParams.get("next") ?? "/dashboard";

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("Auth callback error:", error);
          setStatus("error");
          return;
        }
      }
      // If no code, Supabase may have put tokens in the URL hash (detectSessionInUrl).
      // getSession() will pick them up; give it a moment.
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus("error");
        return;
      }

      const { data: profile } = await supabase
        .from("user_profile")
        .select("onboarded")
        .eq("id", session.user.id)
        .single();

      if (!profile?.onboarded) {
        router.replace("/onboarding");
      } else {
        router.replace(next);
      }
    }

    handleCallback();
  }, [router, searchParams]);

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="text-center">
          <p className="text-zinc-400">Sign-in failed or link expired.</p>
          <a href="/auth/login" className="mt-4 inline-block text-emerald-400 hover:underline">
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
      <p>Signing you in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        <p>Loading…</p>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
