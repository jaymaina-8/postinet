"use client";

import React, { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { PageGate, usePageScope } from "@/components/PageScope";

interface Post {
  id: string;
  content: string | null;
  media_url: string | null;
}

interface ScheduledPost {
  id: string;
  post_id: string;
  scheduled_at: string;
  status: string;
  platform: string;
  platform_account_id: string | null;
  error_message?: string | null;
  posts: Post;
}

export default function SchedulePage() {
  const { selectedPage } = usePageScope();
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedPage) {
      fetchScheduledPosts();
    }
  }, [selectedPage]);

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
        const filtered = selectedPage
          ? allPosts.filter((post: ScheduledPost) => post.platform_account_id === selectedPage.pageId)
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
    if (!confirm('Are you sure you want to cancel this scheduled post?')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in');
        return;
      }

      const res = await fetch(`/api/schedule?id=${scheduledPostId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to cancel scheduled post');
      }

      fetchScheduledPosts();
      alert('Scheduled post cancelled');
    } catch (error: any) {
      alert(error.message || 'Failed to cancel scheduled post');
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString();
  }

  function getStatusBadge(status: string) {
    const styles = {
      failed: 'bg-red-100 text-red-700',
      scheduled: 'bg-yellow-100 text-yellow-700',
      published: 'bg-green-100 text-green-700',
      cancelled: 'bg-zinc-100 text-zinc-700',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status as keyof typeof styles] || styles.scheduled}`}>
        {(status || 'scheduled').charAt(0).toUpperCase() + (status || 'scheduled').slice(1)}
      </span>
    );
  }

  return (
    <PageGate>
      <div className="max-w-6xl mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Scheduled Posts</h1>
          <p className="text-zinc-600">Review and manage scheduled content for this Page.</p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-zinc-500">Loading scheduled posts...</div>
        ) : scheduledPosts.length === 0 ? (
          <div className="text-center py-12 bg-white border border-zinc-200 rounded-lg">
            <p className="text-zinc-500">No scheduled posts</p>
            <p className="text-zinc-400 text-sm mt-2">Create a post and schedule it to see it here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scheduledPosts.map((scheduledPost) => (
              <div
                key={scheduledPost.id}
                className="bg-white border border-zinc-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusBadge(scheduledPost.status === "pending" ? "scheduled" : scheduledPost.status)}
                      <span className="text-sm text-zinc-500">
                        Scheduled: {formatDate(scheduledPost.scheduled_at)}
                      </span>
                    </div>
                  </div>
                  {scheduledPost.status === "scheduled" && (
                    <button
                      onClick={() => handleCancelSchedule(scheduledPost.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {scheduledPost.posts && (
                  <div>
                    {scheduledPost.posts.media_url && (
                      <div className="mb-3">
                        <img
                          src={scheduledPost.posts.media_url}
                          alt="Post media"
                          className="max-w-xs rounded border border-zinc-200"
                        />
                      </div>
                    )}
                    <p className="text-zinc-900 mb-2">
                      {scheduledPost.posts.content || "Untitled post"}
                    </p>
                    {scheduledPost.status === "failed" && (
                      <p className="text-sm text-red-600 mt-2">
                        {scheduledPost.error_message || "Failed to publish. Please review your Facebook connection and try again."}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageGate>
  );
}
