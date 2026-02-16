"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";

/**
 * OAuth callback: Supabase redirects here after Google (or other provider) sign-in.
 * PKCE: Supabase client with detectSessionInUrl handles the code exchange automatically.
 * We only call getSession() to ensure session is hydrated, then redirect.
 * Do NOT call exchangeCodeForSession - it violates the PKCE-safe flow.
 */
function CallbackContent() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      if (process.env.NODE_ENV === "development") {
        console.log("[auth] oauth callback href:", window.location.href);
      }

      // PKCE: detectSessionInUrl parses the redirect URL and completes the exchange.
      // Give the client a moment to hydrate; then getSession() returns the session.
      let {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      // Retry once after a short delay (mobile Safari/Chrome may need more time)
      if (!session && !error) {
        await new Promise((r) => setTimeout(r, 300));
        const retry = await supabase.auth.getSession();
        session = retry.data.session;
        error = retry.error;
      }

      if (process.env.NODE_ENV === "development") {
        console.log("[auth] oauth callback session present?", Boolean(session), error?.message ?? "");
      }

      if (error || !session) {
        router.replace("/login?error=oauth_failed");
        return;
      }

      router.replace("/dashboard");
    }

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
      <p>Finishing sign-in…</p>
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
