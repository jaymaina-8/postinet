"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import supabase from "@/lib/supabaseClient";
import { getSafeNext } from "@/lib/auth-utils";

/**
 * OAuth callback: Supabase redirects here after Google (or other provider) sign-in.
 * PKCE: Supabase client with detectSessionInUrl handles the code exchange automatically.
 * We only call getSession() to ensure session is hydrated, then redirect.
 * Do NOT call exchangeCodeForSession - it violates the PKCE-safe flow.
 */
function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    async function handleCallback() {
      const next = getSafeNext(searchParams.get("next"), "/dashboard");

      // PKCE: detectSessionInUrl parses the redirect URL and completes the exchange.
      // Give the client a moment to hydrate; then getSession() returns the session.
      let { data: { session }, error } = await supabase.auth.getSession();

      // Retry once after a short delay (mobile Safari/Chrome may need more time)
      if (!session && !error) {
        await new Promise((r) => setTimeout(r, 300));
        const retry = await supabase.auth.getSession();
        session = retry.data.session;
        error = retry.error;
      }

      if (process.env.NODE_ENV === "development") {
        if (session) {
          console.log("[auth] oauth callback: session present");
        } else {
          console.log("[auth] oauth callback: missing session", error?.message ?? "");
        }
      }

      if (error || !session) {
        setStatus("error");
        return;
      }

      const { data: profile } = await supabase
        .from("user_profile")
        .select("onboarded")
        .eq("id", session.user.id)
        .single();

      if (!profile?.onboarded) {
        router.replace(`/onboarding?next=${encodeURIComponent(next)}`);
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
          <a
            href="/auth/login?error=oauth_callback"
            className="mt-4 inline-block text-emerald-400 hover:underline"
          >
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
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
          <p>Loading…</p>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
