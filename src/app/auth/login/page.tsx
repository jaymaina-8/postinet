"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNeedsConfirmation(false);
    setResendSuccess(false);
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      // Check if error is due to unconfirmed email
      if (error.message.includes("Email not confirmed") || error.message.includes("email_not_confirmed")) {
        setNeedsConfirmation(true);
        setError(""); // Clear error, we'll show it in the confirmation box
      } else {
        setError(error.message || "Invalid login credentials");
      }
      setLoading(false);
      console.error("Login error:", error);
      return;
    }

    if (data?.user) {
      // Check onboarding status
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
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });
    
    setResendLoading(false);
    
    if (error) {
      setError(error.message);
    } else {
      setResendSuccess(true);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <div className="text-destructive text-sm">{error}</div>}
            {needsConfirmation && (
              <div className="space-y-3 p-4 bg-amber-50 rounded-md border border-amber-200">
                <div className="text-sm font-semibold text-amber-900 mb-2">
                  ⚠️ Email Confirmation Required
                </div>
                <div className="text-sm text-amber-800 space-y-3">
                  <div>
                    <strong className="block mb-1">Quick Fix (Recommended):</strong>
                    <p className="text-xs mb-2">
                      Go to your <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">Supabase Dashboard</a> → Authentication → Users → Find user <strong>{email}</strong> → Click ⋮ menu → "Confirm User"
                    </p>
                  </div>
                  <div className="pt-2 border-t border-amber-200">
                    <strong className="block mb-1">Or check your email:</strong>
                    <p className="text-xs mb-2">
                      Look for a confirmation email and click the link inside.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={handleResendConfirmation}
                      disabled={resendLoading || !email}
                    >
                      {resendLoading ? "Sending..." : resendSuccess ? "✓ Email Sent!" : "Resend Confirmation Email"}
                    </Button>
                    {resendSuccess && (
                      <div className="text-xs text-green-700 mt-2 font-medium">
                        ✓ Confirmation email sent! Check your inbox.
                      </div>
                    )}
                  </div>
                  <div className="pt-2 border-t border-amber-200 text-xs">
                    <p className="mb-1"><strong>Note:</strong> If you can't access the email or Supabase dashboard, you can:</p>
                    <p>Delete this account and <a href="/auth/signup" className="underline font-medium">create a new one</a> (email confirmation is now disabled for new accounts).</p>
                  </div>
                </div>
              </div>
            )}
            <Button className="w-full" type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
