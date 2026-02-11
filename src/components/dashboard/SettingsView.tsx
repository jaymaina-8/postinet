"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

interface UserProfile {
  niche: string;
  content_goals: string;
  tone: string;
  frequency: string;
  audience: string;
  competitors: string;
}

export default function SettingsView() {
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
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [notifications, setNotifications] = useState({
    publish: true,
    failures: true,
    weekly: false,
  });

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

      setSuccess("Settings updated successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save settings";
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
        redirectTo: `${(process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || window.location.origin)}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      setSuccess("Password reset email sent! Check your inbox.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send reset email";
      setError(message);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto pt-4 pb-8">
        <div className="text-center py-12 text-zinc-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pt-4 pb-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-white">Settings</h1>
        <p className="text-zinc-400 text-sm mt-1">Posting defaults, notifications, and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Account</h2>
          <div>
            <p className="text-xs text-zinc-500">Email</p>
            <p className="text-sm text-zinc-200">{userEmail || "Not available"}</p>
          </div>
          <button
            onClick={handlePasswordReset}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-zinc-500 transition-colors"
          >
            Reset password
          </button>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Timezone</h2>
          <p className="text-sm text-zinc-400">Default scheduling timezone.</p>
          <input
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
          />
        </div>
      </div>

      <form onSubmit={handleSave} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Content preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: "niche", label: "Niche / Industry", value: profile.niche },
            { id: "audience", label: "Target Audience", value: profile.audience },
            { id: "tone", label: "Brand Tone / Voice", value: profile.tone },
            { id: "content_goals", label: "Content Goals", value: profile.content_goals },
            { id: "frequency", label: "Posting Frequency", value: profile.frequency },
            { id: "competitors", label: "Competitors / Inspiration", value: profile.competitors },
          ].map((field) => (
            <div key={field.id} className="space-y-2">
              <label htmlFor={field.id} className="text-sm text-zinc-400">
                {field.label}
              </label>
              <input
                id={field.id}
                value={field.value}
                onChange={(e) => setProfile({ ...profile, [field.id]: e.target.value } as UserProfile)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
              />
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <h3 className="text-sm font-semibold text-zinc-200">Notifications</h3>
          <div className="mt-3 space-y-2 text-sm text-zinc-400">
            {[
              { key: "publish", label: "Publishing confirmations" },
              { key: "failures", label: "Failed post alerts" },
              { key: "weekly", label: "Weekly performance recap" },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between">
                <span>{item.label}</span>
                <input
                  type="checkbox"
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={(e) =>
                    setNotifications({ ...notifications, [item.key]: e.target.checked })
                  }
                  className="h-4 w-4"
                />
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save settings"}
        </button>
      </form>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-2">
        <h2 className="text-lg font-semibold text-white">Security</h2>
        <p className="text-sm text-zinc-400">
          You control connected platforms and access tokens. Disconnect anytime.
        </p>
        <a
          href="/delete-data"
          className="inline-flex items-center justify-center rounded-lg border border-rose-500/50 px-4 py-2 text-sm font-semibold text-rose-200 hover:border-rose-400 transition-colors"
        >
          Request data deletion
        </a>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-2">
        <h2 className="text-lg font-semibold text-white">API & Webhooks</h2>
        <p className="text-sm text-zinc-400">
          Coming soon: programmatic publishing and event notifications.
        </p>
      </div>
    </div>
  );
}
