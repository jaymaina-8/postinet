"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import supabase from "@/lib/supabaseClient";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { ContinueWithGoogleButton } from "@/components/auth/ContinueWithGoogleButton";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  async function handleGoogleSignUp() {
    setGoogleLoading(true);
    setError("");
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "";
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (oauthError) {
      setError(oauthError.message || "Google sign-in failed.");
      setGoogleLoading(false);
      return;
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNeedsConfirmation(false);
    setResendSuccess(false);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${(process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || window.location.origin)}/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data?.user) {
      if (!data.session && data.user) {
        setNeedsConfirmation(true);
        setError("Please check your email to confirm your account before continuing.");
        setLoading(false);
        return;
      }
      router.push("/onboarding");
    } else {
      setError("Signup failed. Please try again.");
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
      quote="Very impressed by Postinet's growth. For new creators and small teams, they've gone from 'promising' to 'standard' in remarkably short order."
      authorHandle="@social_creator"
    >
      <h1 className="text-2xl font-semibold text-white">Get started</h1>
      <p className="text-zinc-400 mt-1 mb-8">Create a new account</p>

      <ContinueWithGoogleButton
        onClick={handleGoogleSignUp}
        loading={googleLoading}
      />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-zinc-950 px-3 text-sm text-zinc-500">or</span>
        </div>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
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
        <PasswordInput
          id="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="••••••••"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        {needsConfirmation && (
          <div className="space-y-3 p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
            <div className="text-sm font-semibold text-emerald-200">Check your email</div>
            <p className="text-sm text-emerald-200/90">
              We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white border-0"
              onClick={handleResendConfirmation}
              disabled={resendLoading || !email}
            >
              {resendLoading ? "Sending…" : resendSuccess ? "✓ Email sent!" : "Resend confirmation email"}
            </Button>
            {resendSuccess && (
              <p className="text-xs text-emerald-400">Confirmation email sent. Check your inbox.</p>
            )}
          </div>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
        >
          {loading ? "Signing up…" : "Sign up"}
        </Button>
      </form>

      <p className="text-sm text-zinc-400 mt-6">
        Have an account?{" "}
        <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300 font-medium underline">
          Sign in
        </Link>
      </p>
    </AuthPageShell>
  );
}
