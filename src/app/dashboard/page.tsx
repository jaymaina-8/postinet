"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import supabase from "@/lib/supabaseClient";
import { PLATFORMS } from "@/lib/platforms";

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

  function getCurrentStep(): number {
    if (!stats.hasConnectedAccounts) return 1;
    if (!stats.hasDrafts && !stats.hasPublishedPosts) return 2;
    if (stats.hasDrafts && !stats.hasPublishedPosts) return 3;
    return 4; // All done
  }

  const currentStep = getCurrentStep();

  const isEmpty = !loading && recentPosts.length === 0 && !stats.hasConnectedAccounts;

  const statusStyles = useMemo(
    () => ({
      scheduled: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
      published: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
      failed: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
      draft: "bg-zinc-500/20 text-zinc-300 border border-zinc-500/30",
    }),
    []
  );

  function getStatusLabel(post: RecentPost) {
    if (post.status === "failed") return "Failed";
    if (post.posted_at) return "Published";
    if (post.scheduled_at) return "Scheduled";
    return "Draft";
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Welcome to Postinet</h1>
        <p className="text-zinc-400">
          Your multi-platform command center. Create once, schedule everywhere.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-zinc-800 bg-zinc-900/60 p-0">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-sm uppercase tracking-wide text-zinc-500">Primary Action</p>
                <h2 className="text-2xl font-semibold text-white mt-2">Create a post</h2>
                <p className="text-zinc-400 mt-2">
                  Compose once and publish to your connected platforms in minutes.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/generate"
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
                >
                  Create a post
                </Link>
                <Link
                  href="/dashboard/create"
                  className="inline-flex items-center justify-center rounded-lg border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 hover:border-zinc-500 hover:text-white transition-colors"
                >
                  Upload media
                </Link>
                <Link
                  href="/dashboard/calendar"
                  className="inline-flex items-center justify-center rounded-lg border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 hover:border-zinc-500 hover:text-white transition-colors"
                >
                  Schedule content
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Create", href: "/dashboard/generate" },
                  { label: "Schedule", href: "/dashboard/calendar" },
                  { label: "Analytics", href: "/dashboard/analytics" },
                  { label: "Accounts", href: "/dashboard/accounts" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-zinc-800 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="text-white">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Published this week</span>
              <span className="text-white font-semibold">{stats.publishedThisWeek}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Scheduled upcoming</span>
              <span className="text-white font-semibold">{stats.scheduledUpcoming}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Failed posts</span>
              <Link href="/dashboard/history" className="text-rose-300 hover:text-rose-200 font-semibold">
                {stats.failedCount}
              </Link>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-xs text-zinc-500">
              Everything important is one click away.
            </div>
          </CardContent>
        </Card>
      </div>

      {isEmpty && (
        <Card className="border border-zinc-800 bg-zinc-900/60">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-white">Get started in under 2 minutes</h3>
            <p className="text-zinc-400 mt-2">
              Connect a social account, upload media, and schedule your first post.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link
                href="/dashboard/accounts"
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
              >
                Connect account
              </Link>
              <Link
                href="/dashboard/create"
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-zinc-500 hover:text-white transition-colors"
              >
                Upload media
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-zinc-800 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="text-white">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-sm text-zinc-500">Loading recent posts...</div>
            ) : recentPosts.length === 0 ? (
              <div className="text-sm text-zinc-500">No posts yet. Create your first post to see activity here.</div>
            ) : (
              recentPosts.map((post) => {
                const status = getStatusLabel(post).toLowerCase();
                return (
                  <div
                    key={post.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">
                        {post.media_url ? "Media" : "Text"}
                      </div>
                      <div>
                        <p className="text-sm text-zinc-200 line-clamp-1">
                          {post.content || "Untitled post"}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {post.scheduled_at
                            ? `Scheduled for ${new Date(post.scheduled_at).toLocaleString()}`
                            : post.posted_at
                            ? `Published on ${new Date(post.posted_at).toLocaleString()}`
                            : `Created ${new Date(post.created_at).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyles[status as keyof typeof statusStyles]}`}>
                      {getStatusLabel(post)}
                    </span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="border border-zinc-800 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="text-white">Platform status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Connected accounts</span>
              <span className="text-white font-semibold">{stats.connectedPlatforms.length}</span>
            </div>
            <div className="space-y-2">
              {stats.connectedPlatforms.includes(PLATFORMS.FACEBOOK) && (
                <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm">
                  <span className="text-zinc-300">Facebook</span>
                  <span className="text-emerald-400">Connected</span>
                </div>
              )}
              {stats.connectedPlatforms.includes(PLATFORMS.YOUTUBE) && (
                <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm">
                  <span className="text-zinc-300">YouTube</span>
                  <span className="text-emerald-400">Connected</span>
                </div>
              )}
              {!stats.hasConnectedAccounts && (
                <div className="text-sm text-zinc-500">No accounts connected yet.</div>
              )}
            </div>
            <Link
              href="/dashboard/accounts"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-600 transition-colors"
            >
              Manage accounts
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
