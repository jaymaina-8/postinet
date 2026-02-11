"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import supabase from "@/lib/supabaseClient";
import { getRedirectUrl, isGoogleOAuthDisabled } from "@/lib/auth-utils";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { ContinueWithGoogleButton } from "@/components/auth/ContinueWithGoogleButton";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "oauth_callback") {
      setError("Google sign-in failed or session expired. Please try again.");
    }
  }, [searchParams]);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError("");
    const redirectTo = getRedirectUrl("/auth/callback");
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (oauthError) {
      if (process.env.NODE_ENV === "development") {
        console.error("[auth] Google OAuth error:", oauthError.message);
      }
      setError(oauthError.message || "Google sign-in failed.");
      setGoogleLoading(false);
      return;
    }
    // OAuth will redirect away; no success state needed
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNeedsConfirmation(false);
    setResendSuccess(false);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes("Email not confirmed") || error.message.includes("email_not_confirmed")) {
        setNeedsConfirmation(true);
        setError("");
      } else {
        setError(error.message || "Invalid login credentials");
      }
      setLoading(false);
      return;
    }

    if (data?.user) {
      const { data: profile } = await supabase
        .from("user_profile")
        .select("onboarded")
        .eq("id", data.user.id)
        .single();

      if (!profile?.onboarded) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } else {
      setError("Login failed. Please try again.");
    }
    setLoading(false);
  }

  async function handleResendConfirmation() {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setResendLoading(true);
    setResendSuccess(false);
    setError("");
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${(process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || window.location.origin)}/dashboard`,
      },
    });
    setResendLoading(false);
    if (error) setError(error.message);
    else setResendSuccess(true);
  }

  return (
    <AuthPageShell
      quote="Where has Postinet been all my life? Scheduling and publishing in one place — finally."
      authorHandle="@postinet_fan"
    >
      <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
      <p className="text-zinc-400 mt-1 mb-8">Sign in to your account</p>

      <ContinueWithGoogleButton
        onClick={handleGoogleSignIn}
        loading={googleLoading}
        disabled={isGoogleOAuthDisabled()}
      />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-zinc-950 px-3 text-sm text-zinc-500">or</span>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-white">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full rounded-lg border border-zinc-600 bg-zinc-800/80 px-3 py-2.5 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="password" className="block text-sm font-medium text-white shrink-0">
            Password
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors shrink-0"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        {needsConfirmation && (
          <div className="space-y-3 p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
            <div className="text-sm font-semibold text-amber-200">Email confirmation required</div>
            <div className="text-sm text-amber-200/90 space-y-3">
              <p>
                Check your inbox for a confirmation link, or use the Supabase Dashboard to confirm the user.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50"
                onClick={handleResendConfirmation}
                disabled={resendLoading || !email}
              >
                {resendLoading ? "Sending…" : resendSuccess ? "✓ Email sent!" : "Resend confirmation email"}
              </Button>
              {resendSuccess && (
                <p className="text-xs text-emerald-400">Confirmation email sent. Check your inbox.</p>
              )}
              <p className="text-xs pt-2 border-t border-amber-500/20">
                Can&apos;t access email?{" "}
                <Link href="/auth/signup" className="underline font-medium">Create a new account</Link> (confirmation may be disabled).
              </p>
            </div>
          </div>
        )}
        <Button
          type="submit"
          variant="outline"
          disabled={loading}
          className="w-full h-11 rounded-lg border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 font-medium"
        >
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-sm text-zinc-400 mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-emerald-400 hover:text-emerald-300 font-medium underline">
          Sign up
        </Link>
      </p>
    </AuthPageShell>
  );
}
