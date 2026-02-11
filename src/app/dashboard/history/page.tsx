"use client";

/**
 * History: Your posts with creator-friendly labels. Filter from URL ?filter= supported.
 * Retry shown only when post is actually retryable (e.g. failed).
 */
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import { formatError } from '@/lib/utils';
import { PageGate, usePageScope } from '@/components/PageScope';
import { PLATFORMS } from '@/lib/platforms';

interface Post {
  id: string;
  content: string | null;
  title?: string | null;
  media_url: string | null;
  platform: string | null;
  ai_caption: string | null;
  ai_hashtags: string | null;
  scheduled_at: string | null;
  posted_at: string | null;
  platform_post_id: string | null;
  provider_post_id: string | null;
  youtube_video_id?: string | null;
  yt_processing_status?: string | null;
  yt_upload_status?: string | null;
  yt_failure_reason?: string | null;
  error_message?: string | null;
  metrics: any;
  created_at: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'cancelled' | 'publishing' | 'uploading';
}

type FilterValue = 'all' | 'draft' | 'scheduled' | 'published' | 'failed';

function HistoryPageContent() {
  const searchParams = useSearchParams();
  const { selectedAccount } = usePageScope();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterValue>(() => {
    const f = searchParams.get('filter');
    if (f === 'draft' || f === 'scheduled' || f === 'published' || f === 'failed') return f;
    return 'all';
  });

  useEffect(() => {
    const f = searchParams.get('filter');
    if (f === 'draft' || f === 'scheduled' || f === 'published' || f === 'failed') setFilter(f);
  }, [searchParams]);

  useEffect(() => {
    if (selectedAccount) {
      fetchPosts();
    }
  }, [filter, selectedAccount]);

  async function fetchPosts() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return;
      }

      // Build query
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedAccount?.accountId) {
        query = query.eq('platform_account_id', selectedAccount.accountId);
        query = query.eq('platform', selectedAccount.platform);
      }

      // Apply filter
      if (filter === 'draft') {
        query = query.is('posted_at', null).is('scheduled_at', null);
      } else if (filter === 'scheduled') {
        query = query.not('scheduled_at', 'is', null).is('posted_at', null);
      } else if (filter === 'published') {
        query = query.not('posted_at', 'is', null);
      } else if (filter === 'failed') {
        query = query.eq('status', 'failed');
      }

      const { data, error } = await query;

      // If error is about missing columns, fetch all posts without filters
      if (error && (error.message?.includes('scheduled_at') || error.message?.includes('posted_at') || error.code === '42703')) {
        console.warn('Missing columns detected, fetching all posts. Please run db/supabase_migrations.sql');
        const { data: allData, error: allError } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (allError) throw allError;
        
        // Add default values for missing columns
        const postsWithDefaults = (allData || [])
          .filter((post) => {
            if (!selectedAccount?.accountId) return true;
            return (
              post.platform_account_id === selectedAccount.accountId &&
              post.platform === selectedAccount.platform
            );
          })
          .map(post => ({
            ...post,
            scheduled_at: post.scheduled_at || null,
            posted_at: post.posted_at || null,
          }));
        
        const postsWithStatus = postsWithDefaults.map(post => {
          let status: 'draft' | 'scheduled' | 'published' | 'failed' | 'cancelled' | 'publishing' | 'uploading' = 'draft';
          if (post.status === 'failed') {
            status = 'failed';
          } else if (post.status === 'cancelled') {
            status = 'cancelled';
          } else if (post.status === 'publishing') {
            status = 'publishing';
          } else if (post.status === 'uploading') {
            status = 'uploading';
          } else if (post.posted_at) {
            status = 'published';
          } else if (post.scheduled_at) {
            status = 'scheduled';
          }
          return { ...post, status };
        });
        
        setPosts(postsWithStatus);
        return;
      }

      if (error) {
        throw error;
      }

      // Add status to each post
      const postsWithStatus = (data || []).map(post => {
        let status: 'draft' | 'scheduled' | 'published' | 'failed' | 'cancelled' | 'publishing' | 'uploading' = 'draft';
        if (post.status === 'failed') {
          status = 'failed';
        } else if (post.status === 'cancelled') {
          status = 'cancelled';
        } else if (post.status === 'publishing') {
          status = 'publishing';
        } else if (post.status === 'uploading') {
          status = 'uploading';
        } else if (post.posted_at) {
          status = 'published';
        } else if (post.scheduled_at) {
          status = 'scheduled';
        }

        return {
          ...post,
          status,
        };
      });

      setPosts(postsWithStatus);
    } catch (error: any) {
      const errorInfo = formatError(error);
      console.error('Error fetching posts:', errorInfo);
      console.error('Raw error object:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }

  // Creator-friendly labels
  const statusLabels: Record<string, string> = {
    draft: 'Needs finishing',
    scheduled: 'Going out',
    published: 'Live',
    failed: 'Needs attention',
    cancelled: 'Cancelled',
    publishing: 'Publishing…',
    uploading: 'Uploading…',
  };
  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      draft: 'bg-zinc-500/20 text-zinc-300 border border-zinc-500/30',
      scheduled: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      published: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      failed: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      cancelled: 'bg-zinc-500/20 text-zinc-300 border border-zinc-500/30',
      publishing: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      uploading: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    };
    const label = statusLabels[status] ?? status;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status] || styles.draft}`}>
        {label}
      </span>
    );
  }

  function getPlatformBadge(platform: string | null) {
    const styles = {
      facebook: 'bg-blue-500/20 text-blue-200 border border-blue-500/30',
      youtube: 'bg-red-500/20 text-red-200 border border-red-500/30',
    };
    const key = platform || 'facebook';
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[key as keyof typeof styles] || styles.facebook}`}>
        {key.charAt(0).toUpperCase() + key.slice(1)}
      </span>
    );
  }

  return (
    <PageGate>
      {/* Previous structure: filter tabs followed by full-width content cards. */}
      <div className="max-w-6xl mx-auto pt-4 pb-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">Your posts</h1>
          <p className="text-zinc-400 text-sm">Drafts, scheduled, and published content.</p>
        </div>

      {/* Filters - creator-friendly labels */}
      <div className="mb-6 flex flex-wrap gap-2">
        {([
          { value: 'all' as const, label: 'All' },
          { value: 'draft' as const, label: 'Needs finishing' },
          { value: 'scheduled' as const, label: 'Going out' },
          { value: 'published' as const, label: 'Live' },
          { value: 'failed' as const, label: 'Needs attention' },
        ]).map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === value
                ? 'bg-emerald-500 text-zinc-950'
                : 'border border-zinc-800 text-zinc-300 hover:border-zinc-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="text-center py-12 text-zinc-500">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-400 text-lg">No posts found</p>
          <p className="text-zinc-500 text-sm mt-2">
            {filter === 'all'
              ? 'Start creating content to see it here'
              : `No ${statusLabels[filter] ?? filter} posts yet`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-4 sm:p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-20 shrink-0 rounded-lg bg-zinc-800 overflow-hidden flex items-center justify-center text-xs text-zinc-500">
                    {post.media_url ? (
                      <img
                        src={post.media_url}
                        alt="Post media"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      "Text"
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {getPlatformBadge(post.platform)}
                      {getStatusBadge(post.status)}
                      <span className="text-xs text-zinc-500">Created: {formatDate(post.created_at)}</span>
                      {post.scheduled_at && (
                        <span className="text-xs text-zinc-500">Scheduled: {formatDate(post.scheduled_at)}</span>
                      )}
                      {post.posted_at && (
                        <span className="text-xs text-zinc-500">Published: {formatDate(post.posted_at)}</span>
                      )}
                    </div>
                    <p className="text-zinc-100">{post.title || post.content || "Untitled post"}</p>
                    {post.platform === "youtube" &&
                      post.yt_processing_status &&
                      ["processing", "uploaded"].includes(post.yt_processing_status) && (
                        <p className="text-sm text-blue-300">Processing on YouTube…</p>
                      )}
                    {post.platform === "youtube" && post.yt_failure_reason && (
                      <p className="text-sm text-rose-300">{post.yt_failure_reason}</p>
                    )}
                    {post.status === "failed" && (
                      <p className="text-sm text-rose-300">
                        {post.error_message || "Failed to publish. Please review your connection and try again."}
                      </p>
                    )}
                  </div>
                </div>
                {(post.provider_post_id || post.platform_post_id) && (
                  <div className="text-xs text-zinc-500">
                    {post.platform === PLATFORMS.YOUTUBE && post.provider_post_id ? (
                      <div className="flex flex-col gap-1">
                        <a
                          href={`https://www.youtube.com/watch?v=${post.provider_post_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-300 hover:underline"
                        >
                          View on YouTube
                        </a>
                        {post.youtube_video_id && (
                          <a
                            href={`https://studio.youtube.com/video/${post.youtube_video_id}/edit`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-300 hover:underline"
                          >
                            Open in YouTube Studio
                          </a>
                        )}
                      </div>
                    ) : (
                      <>Post ID: {post.provider_post_id || post.platform_post_id}</>
                    )}
                  </div>
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

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto pt-4 pb-8"><p className="text-zinc-500 text-sm">Loading…</p></div>}>
      <HistoryPageContent />
    </Suspense>
  );
}
