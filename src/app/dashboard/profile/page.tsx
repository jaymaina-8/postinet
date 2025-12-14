"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserProfile {
  niche: string;
  content_goals: string;
  tone: string;
  frequency: string;
  audience: string;
  competitors: string;
}

export default function ProfilePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    niche: "",
    content_goals: "",
    tone: "",
    frequency: "",
    audience: "",
    competitors: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    setError(null);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setError("Failed to get user information");
        return;
      }

      setUserEmail(user.email || null);

      const { data, error: profileError } = await supabase
        .from("user_profile")
        .select("niche, content_goals, tone, frequency, audience, competitors")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Profile fetch error:", profileError);
        setError(profileError.message);
      } else if (data) {
        setProfile({
          niche: data.niche || "",
          content_goals: data.content_goals || "",
          tone: data.tone || "",
          frequency: data.frequency || "",
          audience: data.audience || "",
          competitors: data.competitors || "",
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setError("You must be logged in to update your profile");
        return;
      }

      const { error: updateError } = await supabase
        .from("user_profile")
        .upsert({
          id: user.id,
          ...profile,
          onboarded: true,
        });

      if (updateError) {
        throw updateError;
      }

      setSuccess("Profile updated successfully!");
    } catch (err: unknown) {
      console.error("Error saving profile:", err);
      const message = err instanceof Error ? err.message : "Failed to save profile";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordReset() {
    if (!userEmail) {
      setError("No email address found");
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      setSuccess("Password reset email sent! Check your inbox.");
    } catch (err: unknown) {
      console.error("Error sending reset email:", err);
      const message = err instanceof Error ? err.message : "Failed to send reset email";
      setError(message);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center py-12 text-zinc-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Profile Settings</h1>
        <p className="text-zinc-600">
          Manage your account settings and content preferences.
        </p>
      </div>

      {/* Account Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-zinc-500 text-sm">Email Address</Label>
            <p className="text-zinc-900 font-medium">{userEmail || "Not available"}</p>
          </div>
          <div className="pt-2">
            <Button variant="outline" onClick={handlePasswordReset}>
              Reset Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Content Preferences</CardTitle>
          <p className="text-sm text-zinc-500">
            These preferences help our AI generate better content tailored to your brand.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="niche">Niche / Industry</Label>
              <Input
                id="niche"
                placeholder="e.g., Fitness, Tech, Fashion, Food"
                value={profile.niche}
                onChange={(e) => setProfile({ ...profile, niche: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Input
                id="audience"
                placeholder="e.g., Young professionals, Parents, Small business owners"
                value={profile.audience}
                onChange={(e) => setProfile({ ...profile, audience: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Brand Tone / Voice</Label>
              <Input
                id="tone"
                placeholder="e.g., Professional, Casual, Humorous, Inspirational"
                value={profile.tone}
                onChange={(e) => setProfile({ ...profile, tone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content_goals">Content Goals</Label>
              <Input
                id="content_goals"
                placeholder="e.g., Increase engagement, Drive sales, Build community"
                value={profile.content_goals}
                onChange={(e) => setProfile({ ...profile, content_goals: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Posting Frequency</Label>
              <Input
                id="frequency"
                placeholder="e.g., Daily, 3x per week, Weekly"
                value={profile.frequency}
                onChange={(e) => setProfile({ ...profile, frequency: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="competitors">Competitors / Inspiration</Label>
              <Input
                id="competitors"
                placeholder="e.g., @competitor1, @competitor2"
                value={profile.competitors}
                onChange={(e) => setProfile({ ...profile, competitors: e.target.value })}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            <div className="pt-4">
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="mt-6 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-600 mb-4">
            Need to delete your account and all associated data? This action is irreversible.
          </p>
          <a
            href="/delete-data"
            className="inline-block px-4 py-2 border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
          >
            Request Data Deletion
          </a>
        </CardContent>
      </Card>
    </div>
  );
}





