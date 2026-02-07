"use client";

import React, { useEffect, useMemo, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { PageGate, usePageScope } from "@/components/PageScope";

interface ScheduledPost {
  id: string;
  scheduled_at: string;
  status: string;
  platform: string;
  platform_account_id: string | null;
  error_message?: string | null;
  content: string | null;
  title: string | null;
  media_url: string | null;
}

type ViewMode = "day" | "week" | "month";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString();
}

function getStatusBadge(status: string) {
  const styles = {
    failed: "bg-rose-500/20 text-rose-200 border border-rose-500/30",
    scheduled: "bg-amber-500/20 text-amber-200 border border-amber-500/30",
    published: "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30",
    cancelled: "bg-zinc-500/20 text-zinc-300 border border-zinc-500/30",
    publishing: "bg-blue-500/20 text-blue-200 border border-blue-500/30",
    uploading: "bg-blue-500/20 text-blue-200 border border-blue-500/30",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles] || styles.scheduled}`}>
      {(status || "scheduled").charAt(0).toUpperCase() + (status || "scheduled").slice(1)}
    </span>
  );
}

function getPlatformBadge(platform: string) {
  const styles = {
    facebook: "bg-blue-500/20 text-blue-200 border border-blue-500/30",
    youtube: "bg-red-500/20 text-red-200 border border-red-500/30",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[platform as keyof typeof styles] || styles.facebook}`}>
      {platform?.charAt(0).toUpperCase() + platform?.slice(1)}
    </span>
  );
}

export default function SchedulerView() {
  const { selectedAccount } = usePageScope();
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("week");

  useEffect(() => {
    if (selectedAccount) {
      fetchScheduledPosts();
    }
  }, [selectedAccount]);

  async function fetchScheduledPosts() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setScheduledPosts([]);
        return;
      }

      const res = await fetch("/api/schedule");
      if (res.ok) {
        const data = await res.json();
        const allPosts = data.scheduledPosts || [];
        const filtered = selectedAccount
          ? allPosts.filter(
              (post: ScheduledPost) =>
                post.platform === selectedAccount.platform &&
                post.platform_account_id === selectedAccount.accountId
            )
          : allPosts;
        setScheduledPosts(filtered);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Error fetching scheduled posts:", {
          status: res.status,
          statusText: res.statusText,
          message: errorData.error || "Failed to fetch scheduled posts",
          errorData,
        });
      }
    } catch (scheduleError: any) {
      console.error("Error in scheduled posts fetch:", {
        message: scheduleError?.message || "Unknown error",
        error: scheduleError,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelSchedule(scheduledPostId: string) {
    if (!confirm("Are you sure you want to cancel this scheduled post?")) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Please log in");
        return;
      }

      const res = await fetch(`/api/schedule?id=${scheduledPostId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to cancel scheduled post");
      }

      fetchScheduledPosts();
      alert("Scheduled post cancelled");
    } catch (error: any) {
      alert(error.message || "Failed to cancel scheduled post");
    }
  }

  const filteredPosts = useMemo(() => {
    const now = new Date();
    const end = new Date();
    if (viewMode === "day") {
      end.setDate(now.getDate() + 1);
    } else if (viewMode === "week") {
      end.setDate(now.getDate() + 7);
    } else {
      end.setDate(now.getDate() + 30);
    }
    return scheduledPosts.filter((post) => {
      const scheduledAt = new Date(post.scheduled_at);
      return scheduledAt >= now && scheduledAt <= end;
    });
  }, [scheduledPosts, viewMode]);

  const groupedPosts = useMemo(() => {
    return filteredPosts.reduce<Record<string, ScheduledPost[]>>((acc, post) => {
      const dateKey = new Date(post.scheduled_at).toDateString();
      acc[dateKey] = acc[dateKey] || [];
      acc[dateKey].push(post);
      return acc;
    }, {});
  }, [filteredPosts]);

  return (
    <PageGate>
      <div className="max-w-6xl mx-auto py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">Calendar</h1>
          <p className="text-zinc-400">Visualize and control your content timeline.</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {(["day", "week", "month"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  viewMode === mode
                    ? "bg-emerald-500 text-zinc-950"
                    : "border border-zinc-800 text-zinc-300 hover:border-zinc-600"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <div className="text-xs text-zinc-500">Drag to reschedule (coming soon)</div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-zinc-500">Loading scheduled posts...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <p className="text-zinc-400">No scheduled posts</p>
            <p className="text-zinc-500 text-sm mt-2">Create a post and schedule it to see it here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPosts).map(([date, posts]) => (
              <div key={date} className="space-y-3">
                <div className="text-sm text-zinc-500">{date}</div>
                <div className="space-y-3">
                  {posts.map((scheduledPost) => (
                    <div
                      key={scheduledPost.id}
                      className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          {getPlatformBadge(scheduledPost.platform)}
                          {getStatusBadge(scheduledPost.status === "pending" ? "scheduled" : scheduledPost.status)}
                          <span className="text-sm text-zinc-400">
                            Scheduled: {formatDate(scheduledPost.scheduled_at)}
                          </span>
                        </div>
                        {scheduledPost.status === "scheduled" && (
                          <button
                            onClick={() => handleCancelSchedule(scheduledPost.id)}
                            className="text-xs text-rose-300 hover:text-rose-200"
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      {scheduledPost && (
                        <div className="space-y-2">
                          <p className="text-zinc-100">
                            {scheduledPost.title || scheduledPost.content || "Untitled post"}
                          </p>
                          {scheduledPost.status === "failed" && (
                            <p className="text-sm text-rose-300">
                              {scheduledPost.error_message || "Failed to publish. Please review your connection and try again."}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageGate>
  );
}
