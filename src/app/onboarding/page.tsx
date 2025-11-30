"use client";
import { useState, useEffect } from "react";
import supabase from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OnboardingPage() {
  const [form, setForm] = useState({
    niche: "",
    content_goals: "",
    tone: "",
    frequency: "",
    audience: "",
    competitors: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // Check if user is authenticated
  useEffect(() => {
    async function checkAuth() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!user || authError) {
        router.push("/auth/login");
        return;
      }
      setCheckingAuth(false);
    }
    checkAuth();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (!user || authError) {
      setLoading(false);
      setError("You must be logged in.");
      return;
    }
    // Onboarding completion requires setting onboarded true
    const { error: dbError } = await supabase.from("user_profile").upsert({
      id: user.id,
      ...form,
      onboarded: true,
    });
    setLoading(false);
    if (dbError) {
      setError(dbError.message);
    } else {
      router.push("/dashboard");
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>Welcome! Complete Your Onboarding</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Niche</Label>
              <Input value={form.niche} onChange={e => setForm({ ...form, niche: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Content Goals</Label>
              <Input value={form.content_goals} onChange={e => setForm({ ...form, content_goals: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Tone</Label>
              <Input value={form.tone} onChange={e => setForm({ ...form, tone: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Input value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Audience</Label>
              <Input value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Competitors</Label>
              <Input value={form.competitors} onChange={e => setForm({ ...form, competitors: e.target.value })} required />
            </div>
            {error && <div className="text-destructive text-sm">{error}</div>}
            <Button className="w-full" type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit & Continue"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
