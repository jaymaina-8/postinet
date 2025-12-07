"use client";

import React, { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { formatError } from '@/lib/utils';

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
  status: 'draft' | 'pending' | 'posted';
}

export default function HistoryPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'pending' | 'posted'>('all');

  useEffect(() => {
    fetchPosts();
  }, [filter]);

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

      // Apply filter
      if (filter === 'draft') {
        query = query.is('posted_at', null).is('scheduled_at', null);
      } else if (filter === 'pending') {
        query = query.not('scheduled_at', 'is', null).is('posted_at', null);
      } else if (filter === 'posted') {
        query = query.not('posted_at', 'is', null);
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
        const postsWithDefaults = (allData || []).map(post => ({
          ...post,
          scheduled_at: post.scheduled_at || null,
          posted_at: post.posted_at || null,
        }));
        
        const postsWithStatus = postsWithDefaults.map(post => {
          let status: 'draft' | 'pending' | 'posted' = 'draft';
          if (post.posted_at) {
            status = 'posted';
          } else if (post.scheduled_at) {
            status = 'pending';
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
        let status: 'draft' | 'pending' | 'posted' = 'draft';
        if (post.posted_at) {
          status = 'posted';
        } else if (post.scheduled_at) {
          status = 'pending';
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
      draft: 'bg-zinc-200 text-zinc-700',
      pending: 'bg-yellow-100 text-yellow-700',
      posted: 'bg-green-100 text-green-700',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status as keyof typeof styles] || styles.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Content History</h1>
        <p className="text-zinc-600">View and manage your generated content</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded text-sm font-medium ${
            filter === 'all'
              ? 'bg-zinc-900 text-white'
              : 'bg-white text-zinc-700 border border-zinc-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('draft')}
          className={`px-4 py-2 rounded text-sm font-medium ${
            filter === 'draft'
              ? 'bg-zinc-900 text-white'
              : 'bg-white text-zinc-700 border border-zinc-300'
          }`}
        >
          Drafts
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded text-sm font-medium ${
            filter === 'pending'
              ? 'bg-zinc-900 text-white'
              : 'bg-white text-zinc-700 border border-zinc-300'
          }`}
        >
          Scheduled
        </button>
        <button
          onClick={() => setFilter('posted')}
          className={`px-4 py-2 rounded text-sm font-medium ${
            filter === 'posted'
              ? 'bg-zinc-900 text-white'
              : 'bg-white text-zinc-700 border border-zinc-300'
          }`}
        >
          Posted
        </button>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="text-center py-12 text-zinc-500">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500 text-lg">No posts found</p>
          <p className="text-zinc-400 text-sm mt-2">
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
              className="bg-white rounded-lg border border-zinc-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusBadge(post.status)}
                    <span className="text-sm text-zinc-500">
                      Created: {formatDate(post.created_at)}
                    </span>
                    {post.scheduled_at && (
                      <span className="text-sm text-zinc-500">
                        Scheduled: {formatDate(post.scheduled_at)}
                      </span>
                    )}
                    {post.posted_at && (
                      <span className="text-sm text-zinc-500">
                        Posted: {formatDate(post.posted_at)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {post.media_url && (
                <div className="mb-4">
                  <img
                    src={post.media_url}
                    alt="Post media"
                    className="max-w-xs rounded border border-zinc-200"
                  />
                </div>
              )}

              <div className="mb-3">
                <h3 className="font-semibold text-zinc-900 mb-1">Original Content:</h3>
                <p className="text-zinc-700 whitespace-pre-wrap">{post.content || 'N/A'}</p>
              </div>

              {post.ai_caption && (
                <div className="mb-3">
                  <h3 className="font-semibold text-zinc-900 mb-1">AI Caption:</h3>
                  <p className="text-zinc-700">{post.ai_caption}</p>
                </div>
              )}

              {post.ai_hashtags && (
                <div className="mb-3">
                  <h3 className="font-semibold text-zinc-900 mb-1">Hashtags:</h3>
                  <p className="text-zinc-600">{post.ai_hashtags}</p>
                </div>
              )}

              {post.platform_post_id && (
                <div className="mt-4 pt-4 border-t border-zinc-200">
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
  );
}
