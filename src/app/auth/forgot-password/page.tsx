"use client";

import { useState } from "react";
import Link from "next/link";
import supabase from "@/lib/supabaseClient";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSent(false);
    const redirectTo = `${(process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || (typeof window !== "undefined" ? window.location.origin : ""))}/auth/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <AuthPageShell
      quote="Postinet makes scheduling and publishing feel effortless. One less thing to worry about."
      authorHandle="@team_postinet"
    >
      <h1 className="text-2xl font-semibold text-white">Reset password</h1>
      <p className="text-zinc-400 mt-1 mb-8">Enter your email and we&apos;ll send you a link to reset your password.</p>

      {sent ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-200 font-medium">Check your email</p>
          <p className="text-sm text-emerald-200/90 mt-1">
            We&apos;ve sent a password reset link to <strong>{email}</strong>. Click the link in the email to set a new password.
          </p>
          <Link
            href="/auth/login"
            className="inline-block mt-4 text-sm text-emerald-400 hover:text-emerald-300 font-medium underline"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
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
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
          >
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}

      <p className="text-sm text-zinc-400 mt-6">
        Remember your password?{" "}
        <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300 font-medium underline">
          Sign in
        </Link>
      </p>
    </AuthPageShell>
  );
}
