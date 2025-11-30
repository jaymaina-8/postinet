"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import supabase from "@/lib/supabaseClient";

export default function TwitterCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Verifying Twitter authorization...");

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const storedState = sessionStorage.getItem("twitter_state");
    const codeVerifier = sessionStorage.getItem("twitter_code_verifier");

    if (!code || !state) {
      setStatus("Missing authorization parameters.");
      return;
    }

    if (!storedState || storedState !== state) {
      setStatus("Security check failed (state mismatch).");
      return;
    }

    if (!codeVerifier) {
      setStatus("Missing verifier. Please restart the connection flow.");
      return;
    }

    async function exchange() {
      setStatus("Finalizing connection...");
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setStatus("Please sign in again before connecting Twitter.");
        return;
      }

      const response = await fetch("/api/twitter/exchange", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          code,
          codeVerifier,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Unable to complete Twitter connection.";
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch (_) {
          /* ignore */
        }
        setStatus(errorMessage);
        return;
      }

      sessionStorage.removeItem("twitter_state");
      sessionStorage.removeItem("twitter_code_verifier");
      setStatus("Twitter account connected! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 1500);
    }

    exchange();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full rounded-lg border bg-white p-6 shadow-sm text-center">
        <p className="text-sm text-zinc-600">{status}</p>
      </div>
    </div>
  );
}


