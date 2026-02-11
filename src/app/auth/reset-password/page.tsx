"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import supabase from "@/lib/supabaseClient";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"verifying" | "form" | "done" | "error">("verifying");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function verify() {
      let tokenHash = searchParams.get("token_hash");
      let type = searchParams.get("type");
      if (!tokenHash && typeof window !== "undefined" && window.location.hash) {
        const params = new URLSearchParams(window.location.hash.replace("#", ""));
        tokenHash = tokenHash || params.get("token_hash") || params.get("access_token");
        type = type || params.get("type") || "recovery";
      }
      if (type === "recovery" && tokenHash) {
        const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
        if (error) {
          setError(error.message);
          setStep("error");
          return;
        }
        setStep("form");
        return;
      }
      setStep("error");
    }
    verify();
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep("done");
    setTimeout(() => router.replace("/auth/login"), 2000);
  }

  if (step === "verifying") {
    return (
      <AuthPageShell quote="Postinet — schedule once, publish everywhere." authorHandle="@postinet">
        <div className="text-zinc-400">Verifying reset link…</div>
      </AuthPageShell>
    );
  }

  if (step === "error") {
    return (
      <AuthPageShell quote="Postinet — schedule once, publish everywhere." authorHandle="@postinet">
        <h1 className="text-2xl font-semibold text-white">Invalid or expired link</h1>
        <p className="text-zinc-400 mt-1 mb-6">
          This password reset link is invalid or has expired. Request a new one below.
        </p>
        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
        <Link
          href="/auth/forgot-password"
          className="inline-block rounded-lg border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 font-medium px-4 py-2.5"
        >
          Request new reset link
        </Link>
        <p className="text-sm text-zinc-400 mt-6">
          <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300 underline">Back to sign in</Link>
        </p>
      </AuthPageShell>
    );
  }

  if (step === "done") {
    return (
      <AuthPageShell quote="Postinet — schedule once, publish everywhere." authorHandle="@postinet">
        <h1 className="text-2xl font-semibold text-white">Password updated</h1>
        <p className="text-zinc-400 mt-1">Redirecting you to sign in…</p>
        <Link href="/auth/login" className="inline-block mt-6 text-emerald-400 hover:text-emerald-300 font-medium underline">
          Sign in now
        </Link>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell quote="Postinet — schedule once, publish everywhere." authorHandle="@postinet">
      <h1 className="text-2xl font-semibold text-white">Set new password</h1>
      <p className="text-zinc-400 mt-1 mb-8">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          id="password"
          label="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="••••••••"
        />
        <PasswordInput
          id="confirm"
          label="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="••••••••"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button
          type="submit"
          variant="outline"
          disabled={loading}
          className="w-full h-11 rounded-lg border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 font-medium"
        >
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>

      <p className="text-sm text-zinc-400 mt-6">
        <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300 font-medium underline">
          Back to sign in
        </Link>
      </p>
    </AuthPageShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthPageShell quote="Postinet — schedule once, publish everywhere." authorHandle="@postinet">
          <div className="text-zinc-400">Loading…</div>
        </AuthPageShell>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
