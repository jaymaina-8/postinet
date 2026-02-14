"use client";

/**
 * Profile page: email, created date, connected platforms summary, Change password, Log out.
 * Uses same dashboard shell (layout.tsx).
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";
import { PLATFORMS } from "@/lib/platforms";

export default function ProfilePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setError("Could not load profile.");
          return;
        }
        setEmail(user.email ?? null);
        setCreatedAt(user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : null);

        const { data: accounts } = await supabase
          .from("connected_accounts")
          .select("platform, facebook_page_access_token")
          .eq("user_id", user.id);
        const fbConnected = accounts?.some((a) => a.platform === PLATFORMS.FACEBOOK && a.facebook_page_access_token) ?? false;
        const ytRows = await supabase.from("platform_accounts").select("id").eq("user_id", user.id).eq("platform", PLATFORMS.YOUTUBE);
        const ytConnected = (ytRows.data?.length ?? 0) > 0;
        const platforms: string[] = [];
        if (fbConnected) platforms.push("Facebook");
        if (ytConnected) platforms.push("YouTube");
        setConnectedPlatforms(platforms);
      } catch (e) {
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (e) {
      console.error("Logout error:", e);
      router.push("/auth/login");
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto pt-4 pb-8">
        <p className="text-zinc-500 text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pt-4 pb-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-white">Profile</h1>
        <p className="text-zinc-400 text-sm mt-1">Your account and connected platforms.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {error}
          <button type="button" onClick={() => window.location.reload()} className="ml-2 underline">
            Try again
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Account</h2>
        <div>
          <p className="text-xs text-zinc-500">Email</p>
          <p className="text-sm text-zinc-200">{email ?? "—"}</p>
        </div>
        {createdAt && (
          <div>
            <p className="text-xs text-zinc-500">Member since</p>
            <p className="text-sm text-zinc-200">{createdAt}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-zinc-500">Connected accounts</p>
          <p className="text-sm text-zinc-200">
            {connectedPlatforms.length === 0 ? "None" : connectedPlatforms.join(", ")}
          </p>
          <Link
            href="/dashboard/accounts"
            className="text-sm text-emerald-400 hover:text-emerald-300 mt-1 inline-block"
          >
            Manage accounts
          </Link>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link
            href="/dashboard/settings"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-zinc-500"
          >
            Change password
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-zinc-500"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
