"use client";

/**
 * Creator Home dashboard. Composition: Hero, PrimaryActionCard (Start a post),
 * secondary links, NeedsAttentionCard (if failures), Your latest posts + right column
 * (Connected accounts, This week's progress). See layout.tsx for shell.
 */
import React, { useEffect, useState } from "react";
import Link from "next/link";
import supabase from "@/lib/supabaseClient";
import { PLATFORMS } from "@/lib/platforms";
import PrimaryActionCard from "@/components/dashboard/PrimaryActionCard";
import RecentActivityList from "@/components/dashboard/RecentActivityList";
import PlatformStatusCard from "@/components/dashboard/PlatformStatusCard";
import ThisWeekStats from "@/components/dashboard/ThisWeekStats";
import EmptyStateHint from "@/components/dashboard/EmptyStateHint";
import NeedsAttentionCard from "@/components/dashboard/NeedsAttentionCard";

interface ConnectedAccount {
  platform: string;
  facebook_page_name: string | null;
  platform_username: string | null;
  facebook_page_access_token?: string | null;
}

interface UserStats {
  hasConnectedAccounts: boolean;
  connectedPlatforms: string[];
  hasDrafts: boolean;
  hasPublishedPosts: boolean;
  draftCount: number;
  scheduledCount: number;
  publishedCount: number;
  failedCount: number;
  publishedThisWeek: number;
  scheduledUpcoming: number;
}

type RecentPost = {
  id: string;
  content: string | null;
  media_url: string | null;
  status: string | null;
  scheduled_at: string | null;
  posted_at: string | null;
  created_at: string;
};

type OnboardingProfile = {
  onboarding_goal: string | null;
  onboarding_frequency: string | null;
  onboarding_creation_style: string | null;
  onboarding_testing: boolean | null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<UserStats>({
    hasConnectedAccounts: false,
    connectedPlatforms: [],
    hasDrafts: false,
    hasPublishedPosts: false,
    draftCount: 0,
    scheduledCount: 0,
    publishedCount: 0,
    failedCount: 0,
    publishedThisWeek: 0,
    scheduledUpcoming: 0,
  });
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingProfile | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  function getPersonalizedHeader(goal: string | null): { title: string; subtitle: string } {
    switch (goal) {
      case "consistency":
        return { title: "Let’s build your posting streak.", subtitle: "Upload once. Schedule or post instantly." };
      case "grow_followers":
        return { title: "Post smarter. Grow faster.", subtitle: "Upload once. Schedule or post instantly." };
      case "monetize":
        return { title: "More posts. More revenue opportunities.", subtitle: "Upload once. Schedule or post instantly." };
      case "manage_clients":
        return { title: "Manage content without chaos.", subtitle: "Upload once. Schedule or post instantly." };
      default:
        return { title: "Welcome to Postinet AI", subtitle: "Upload once. Schedule or post instantly." };
    }
  }

  function getPrimaryCtaLabel(style: string | null): string {
    switch (style) {
      case "edited_videos":
        return "Upload media";
      case "repurpose":
        return "Upload long video";
      // Bulk upload doesn't exist yet in-app; keep the default.
      case "manage_clients":
        return "Upload media";
      default:
        return "Start a post";
    }
  }

  async function fetchStats() {
    try {
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      // Onboarding personalization (lightweight)
      const profileRes = await supabase
        .from("user_profile")
        .select("onboarding_goal,onboarding_frequency,onboarding_creation_style,onboarding_testing")
        .eq("id", session.user.id)
        .maybeSingle();
      if (!profileRes.error) {
        setOnboarding((profileRes.data || null) as OnboardingProfile | null);
      }

      let accounts: ConnectedAccount[] = [];
      const accountsResult = await supabase
        .from("connected_accounts")
        .select("platform, facebook_page_name, platform_username, facebook_page_access_token")
        .eq("user_id", session.user.id);

      if (accountsResult.error && accountsResult.error.message?.includes("does not exist")) {
        const fallbackResult = await supabase.from("connected_accounts").select("platform");
        accounts = fallbackResult.data?.map((acc: { platform: string }) => ({
          platform: acc.platform,
          facebook_page_name: null,
          platform_username: null,
        })) || [];
      } else if (accountsResult.error && accountsResult.error.message) {
        console.error("Error fetching accounts:", accountsResult.error.message);
      } else {
        accounts = accountsResult.data || [];
      }

      const connectedPlatforms =
        accounts
          .filter((a: ConnectedAccount) => {
            if (a.platform === PLATFORMS.FACEBOOK) return a.facebook_page_access_token != null;
            return true;
          })
          .map((a: ConnectedAccount) => a.platform) || [];

      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select("id, content, media_url, status, scheduled_at, posted_at, created_at")
        .order("created_at", { ascending: false });

      if (postsError && postsError.message) {
        console.error("Error fetching posts:", postsError.message);
      }

      const drafts = posts?.filter((p) => !p.scheduled_at && !p.posted_at) || [];
      const scheduled = posts?.filter((p) => p.scheduled_at && !p.posted_at) || [];
      const published = posts?.filter((p) => p.posted_at) || [];
      const failed = posts?.filter((p) => p.status === "failed") || [];
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const publishedThisWeek = published.filter((p) => {
        if (!p.posted_at) return false;
        return new Date(p.posted_at) >= weekStart;
      });
      const scheduledUpcoming = scheduled.filter((p) => {
        if (!p.scheduled_at) return false;
        return new Date(p.scheduled_at) > now;
      });

      setStats({
        hasConnectedAccounts: (accounts?.length || 0) > 0,
        connectedPlatforms,
        hasDrafts: drafts.length > 0,
        hasPublishedPosts: published.length > 0,
        draftCount: drafts.length,
        scheduledCount: scheduled.length,
        publishedCount: published.length,
        failedCount: failed.length,
        publishedThisWeek: publishedThisWeek.length,
        scheduledUpcoming: scheduledUpcoming.length,
      });
      setRecentPosts((posts || []).slice(0, 5));
    } catch (e) {
      console.error("Error fetching stats:", e);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const showConnectHint = !loading && !stats.hasConnectedAccounts;
  const showUploadHint = !loading && stats.hasConnectedAccounts && recentPosts.length === 0;
  const showNeedsAttention = !loading && stats.failedCount > 0;
  const header = getPersonalizedHeader(onboarding?.onboarding_goal ?? null);
  const primaryLabel = getPrimaryCtaLabel(onboarding?.onboarding_creation_style ?? null);

  return (
    <div className="space-y-6 pt-1">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white">{header.title}</h1>
        <p className="text-zinc-400 text-sm sm:text-base">{header.subtitle}</p>
      </div>

      <PrimaryActionCard primaryLabel={primaryLabel} />

      <div className="flex flex-wrap gap-2">
        <Link
          href="/dashboard/schedule"
          className="rounded-full border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-600"
        >
          View scheduled
        </Link>
        <Link
          href="/dashboard/history"
          className="rounded-full border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-600"
        >
          View history
        </Link>
        <Link
          href="/dashboard/accounts"
          className="rounded-full border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-600"
        >
          Connect accounts
        </Link>
      </div>

      {showConnectHint && <EmptyStateHint variant="connect" />}
      {!showConnectHint && showUploadHint && <EmptyStateHint variant="upload" />}

      {showNeedsAttention && <NeedsAttentionCard />}

      {error && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
          <button type="button" onClick={() => fetchStats()} className="ml-2 underline">
            Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <RecentActivityList posts={recentPosts} loading={loading} />
        <div className="space-y-6">
          <PlatformStatusCard connectedPlatforms={stats.connectedPlatforms} />
          <ThisWeekStats
            publishedThisWeek={stats.publishedThisWeek}
            scheduledUpcoming={stats.scheduledUpcoming}
            failedCount={stats.failedCount}
          />
        </div>
      </div>
    </div>
  );
}
