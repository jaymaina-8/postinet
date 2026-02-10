"use client";

import React, { useEffect, useState } from "react";
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
  youtube_video_id?: string | null;
  yt_processing_status?: string | null;
  yt_upload_status?: string | null;
  yt_failure_reason?: string | null;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString();
}

// Creator-friendly: scheduled → "Going out soon", failed → "Needs attention", published → "Live"
function getStatusBadge(status: string) {
  const labels: Record<string, string> = {
    failed: "Needs attention",
    scheduled: "Going out soon",
    published: "Live",
    cancelled: "Cancelled",
    publishing: "Publishing…",
    uploading: "Uploading…",
  };
  const display = labels[status] ?? "Going out soon";
  const styles: Record<string, string> = {
    failed: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    scheduled: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    published: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    cancelled: "bg-zinc-500/20 text-zinc-300 border border-zinc-500/30",
    publishing: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    uploading: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  };
  const style = styles[status] ?? styles.scheduled;
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${style}`}>
      {display}
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

export default function SchedulePage() {
  const { selectedAccount } = usePageScope();
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <PageGate>
      <div className="max-w-6xl mx-auto py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white">Calendar</h1>
          <p className="text-zinc-400 text-sm mt-1">Review and manage when your posts go out.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-zinc-500">View:</span>
          <button
            type="button"
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200"
          >
            List
          </button>
          <button
            type="button"
            disabled
            className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-500 cursor-not-allowed"
            title="Coming soon"
          >
            Calendar
          </button>
          <span className="text-xs text-zinc-600">Calendar view coming soon</span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-zinc-500">Loading scheduled posts...</div>
        ) : scheduledPosts.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <p className="text-zinc-400">No scheduled posts</p>
            <p className="text-zinc-500 text-sm mt-2">Create a post and choose a time to see it here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scheduledPosts.map((scheduledPost) => (
              <div
                key={scheduledPost.id}
                className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-20 shrink-0 rounded-lg bg-zinc-800 overflow-hidden flex items-center justify-center text-xs text-zinc-500">
                      {scheduledPost.media_url ? (
                        <img
                          src={scheduledPost.media_url}
                          alt="Post media"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        "Text"
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {getPlatformBadge(scheduledPost.platform)}
                        {getStatusBadge(scheduledPost.status === "pending" ? "scheduled" : scheduledPost.status)}
                        <span className="text-xs text-zinc-500">Goes out: {formatDate(scheduledPost.scheduled_at)}</span>
                      </div>
                      <p className="text-zinc-100">
                        {scheduledPost.title || scheduledPost.content || "Untitled post"}
                      </p>
                      {scheduledPost.platform === "youtube" &&
                        scheduledPost.yt_processing_status &&
                        ["processing", "uploaded"].includes(scheduledPost.yt_processing_status) && (
                          <p className="text-sm text-blue-300">Processing on YouTube…</p>
                        )}
                      {scheduledPost.platform === "youtube" && scheduledPost.yt_failure_reason && (
                        <p className="text-sm text-rose-300">{scheduledPost.yt_failure_reason}</p>
                      )}
                      {scheduledPost.status === "failed" && (
                        <p className="text-sm text-rose-300">
                          {scheduledPost.error_message || "Failed to publish. Please review your connection and try again."}
                        </p>
                      )}
                    </div>
                  </div>
                  {scheduledPost.youtube_video_id && (
                    <a
                      href={`https://studio.youtube.com/video/${scheduledPost.youtube_video_id}/edit`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-300 hover:underline"
                    >
                      Open in YouTube Studio
                    </a>
                  )}
                  {scheduledPost.status === "scheduled" && (
                    <button
                      onClick={() => handleCancelSchedule(scheduledPost.id)}
                      className="self-start rounded-lg border border-rose-500/50 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:border-rose-400"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageGate>
  );
}
