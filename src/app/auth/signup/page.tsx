"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

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
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });
    
    if (error) {
      setError(error.message);
      setLoading(false);
      console.error("Signup error:", error);
      return;
    }

    if (data?.user) {
      // Check if email confirmation is required
      // If user.session is null, it means email confirmation is required
      if (!data.session && data.user) {
        setNeedsConfirmation(true);
        setError("Please check your email to confirm your account before continuing.");
        setLoading(false);
        return;
      }
      
      // User created and confirmed, redirect to onboarding
      router.push("/onboarding");
    } else {
      setError("Signup failed. Please try again.");
      setLoading(false);
    }
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
          <CardTitle>Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <div className="text-destructive text-sm">{error}</div>}
            {needsConfirmation && (
              <div className="space-y-2">
                <div className="text-sm text-zinc-600">
                  We've sent a confirmation email. Need a new one?
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResendConfirmation}
                  disabled={resendLoading || !email}
                >
                  {resendLoading ? "Sending..." : resendSuccess ? "Email Sent! ✓" : "Resend Confirmation Email"}
                </Button>
                {resendSuccess && (
                  <div className="text-sm text-green-600">
                    Confirmation email sent! Please check your inbox and click the confirmation link.
                  </div>
                )}
              </div>
            )}
            <Button className="w-full" type="submit" disabled={loading}>{loading ? "Signing up..." : "Sign Up"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
