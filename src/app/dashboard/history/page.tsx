"use client";

import React, { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { formatError } from '@/lib/utils';
import { PageGate, usePageScope } from '@/components/PageScope';

interface Post {
  id: string;
  content: string | null;
  media_url: string | null;
  ai_caption: string | null;
  ai_hashtags: string | null;
  scheduled_at: string | null;
  posted_at: string | null;
  platform_post_id: string | null;
  metrics: any;
  created_at: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
}

export default function HistoryPage() {
  const { selectedPage } = usePageScope();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'scheduled' | 'published' | 'failed'>('all');

  useEffect(() => {
    if (selectedPage) {
      fetchPosts();
    }
  }, [filter, selectedPage]);

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

      if (selectedPage?.pageId) {
        query = query.eq('platform_account_id', selectedPage.pageId);
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
            if (!selectedPage?.pageId) return true;
            return post.platform_account_id === selectedPage.pageId;
          })
          .map(post => ({
            ...post,
            scheduled_at: post.scheduled_at || null,
            posted_at: post.posted_at || null,
          }));
        
        const postsWithStatus = postsWithDefaults.map(post => {
          let status: 'draft' | 'scheduled' | 'published' | 'failed' = 'draft';
          if (post.status === 'failed') {
            status = 'failed';
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
        let status: 'draft' | 'scheduled' | 'published' | 'failed' = 'draft';
        if (post.status === 'failed') {
          status = 'failed';
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

  function getStatusBadge(status: string) {
    const styles = {
        draft: 'bg-zinc-500/20 text-zinc-300 border border-zinc-500/30',
        scheduled: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        published: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        failed: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
        cancelled: 'bg-zinc-500/20 text-zinc-300 border border-zinc-500/30',
      };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status as keyof typeof styles] || styles.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }

  return (
    <PageGate>
      <div className="max-w-6xl mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-white mb-2">Content history</h1>
          <p className="text-zinc-400">View your drafts, scheduled posts, and published content</p>
        </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded text-sm font-medium ${
            filter === 'all'
              ? 'bg-emerald-500 text-zinc-950'
              : 'border border-zinc-800 text-zinc-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('draft')}
          className={`px-4 py-2 rounded text-sm font-medium ${
            filter === 'draft'
              ? 'bg-emerald-500 text-zinc-950'
              : 'border border-zinc-800 text-zinc-300'
          }`}
        >
          Drafts
        </button>
        <button
          onClick={() => setFilter('scheduled')}
          className={`px-4 py-2 rounded text-sm font-medium ${
            filter === 'scheduled'
              ? 'bg-emerald-500 text-zinc-950'
              : 'border border-zinc-800 text-zinc-300'
          }`}
        >
          Scheduled
        </button>
        <button
          onClick={() => setFilter('published')}
          className={`px-4 py-2 rounded text-sm font-medium ${
            filter === 'published'
              ? 'bg-emerald-500 text-zinc-950'
              : 'border border-zinc-800 text-zinc-300'
          }`}
        >
          Published
        </button>
        <button
          onClick={() => setFilter('failed')}
          className={`px-4 py-2 rounded text-sm font-medium ${
            filter === 'failed'
              ? 'bg-emerald-500 text-zinc-950'
              : 'border border-zinc-800 text-zinc-300'
          }`}
        >
          Failed
        </button>
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
              : `No ${filter} posts yet`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-6 hover:border-zinc-700 transition-colors"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                {getStatusBadge(post.status)}
                <div className="flex flex-wrap gap-3 text-sm text-zinc-400">
                  <span>Created: {formatDate(post.created_at)}</span>
                  {post.scheduled_at && <span>Scheduled: {formatDate(post.scheduled_at)}</span>}
                  {post.posted_at && <span>Published: {formatDate(post.posted_at)}</span>}
                </div>
              </div>

              {post.media_url && (
                <div className="mb-4">
                  <img
                    src={post.media_url}
                    alt="Post media"
                    className="max-w-xs rounded border border-zinc-800"
                  />
                </div>
              )}

              <div className="mb-3">
                <h3 className="font-semibold text-zinc-200 mb-1">Post Content</h3>
                <p className="text-zinc-300 whitespace-pre-wrap">{post.content || 'N/A'}</p>
              </div>

              {post.platform_post_id && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <p className="text-sm text-zinc-500">
                    Post ID: {post.platform_post_id}
                  </p>
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
