"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import supabase from "@/lib/supabaseClient";
import { PLATFORMS } from "@/lib/platforms";
import PrimaryActionCard from "@/components/dashboard/PrimaryActionCard";
import RecentActivityList from "@/components/dashboard/RecentActivityList";
import PlatformStatusCard from "@/components/dashboard/PlatformStatusCard";
import ThisWeekStats from "@/components/dashboard/ThisWeekStats";
import EmptyStateHint from "@/components/dashboard/EmptyStateHint";

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

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      // First check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // User not logged in, use default empty stats
        setLoading(false);
        return;
      }

      // Fetch connected accounts - try with all columns, fall back to basic if needed
      let accounts: ConnectedAccount[] = [];
      
      const accountsResult = await supabase
        .from("connected_accounts")
        .select("platform, facebook_page_name, platform_username, facebook_page_access_token")
        .eq("user_id", session.user.id);

      if (accountsResult.error && accountsResult.error.message?.includes("does not exist")) {
        // Fallback: try with only platform column
        const fallbackResult = await supabase
          .from("connected_accounts")
          .select("platform");
        accounts = fallbackResult.data?.map(acc => ({
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
            // DB is the source of truth: Facebook is only "connected" if page token exists
            if (a.platform === PLATFORMS.FACEBOOK) {
              return a.facebook_page_access_token != null;
            }
            return true;
          })
          .map((a: ConnectedAccount) => a.platform) || [];

      // Fetch posts stats
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select("id, content, media_url, status, scheduled_at, posted_at, created_at")
        .order("created_at", { ascending: false });

      // Only log if there's a real error with a message
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
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }

  const showConnectHint = !loading && !stats.hasConnectedAccounts;
  const showUploadHint = !loading && stats.hasConnectedAccounts && recentPosts.length === 0;
  const showFailureHint = !loading && stats.failedCount > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Welcome back</h1>
        <p className="text-zinc-400">Your creator-grade publishing hub.</p>
      </div>

      <PrimaryActionCard />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Create", href: "/dashboard/create" },
          { label: "Schedule", href: "/dashboard/calendar" },
          { label: "Analytics", href: "/dashboard/analytics" },
          { label: "Accounts", href: "/dashboard/accounts" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm font-semibold text-zinc-200 hover:border-zinc-600 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {showConnectHint && <EmptyStateHint variant="connect" />}
      {!showConnectHint && showUploadHint && <EmptyStateHint variant="upload" />}

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <RecentActivityList
          posts={recentPosts}
          loading={loading}
          showFailureHint={showFailureHint}
        />
        <div className="space-y-6">
          <ThisWeekStats
            publishedThisWeek={stats.publishedThisWeek}
            scheduledUpcoming={stats.scheduledUpcoming}
            failedCount={stats.failedCount}
          />
          <PlatformStatusCard connectedPlatforms={stats.connectedPlatforms} />
        </div>
      </div>
    </div>
  );
}
