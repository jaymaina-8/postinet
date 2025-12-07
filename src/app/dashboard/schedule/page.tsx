"use client";

import React, { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { formatError } from '@/lib/utils';
import { PLATFORM_LIST, PLATFORMS } from '@/lib/platforms';

interface Post {
  id: string;
  content: string | null;
  media_url: string | null;
  ai_caption: string | null;
  ai_hashtags: string | null;
  scheduled_at: string | null;
  created_at: string;
}

interface ScheduledPost {
  id: string;
  post_id: string;
  scheduled_at: string;
  status: string;
  platform: string;
  posts: Post;
}

export default function SchedulePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>(PLATFORMS.INSTAGRAM);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      
      // Fetch unscheduled posts (drafts)
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .is('scheduled_at', null)
        .is('posted_at', null)
        .order('created_at', { ascending: false });

      // If error is about missing columns, fetch all posts without filters
      if (postsError && (postsError.message?.includes('scheduled_at') || postsError.message?.includes('posted_at') || postsError.code === '42703')) {
        console.warn('Missing columns detected, fetching all posts. Please run db/supabase_migrations.sql');
        const { data: allPostsData, error: allPostsError } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (allPostsError) {
          const errorInfo = formatError(allPostsError);
          console.error('Error fetching posts:', errorInfo);
          throw allPostsError;
        }
        
        // Filter client-side for posts without scheduled_at/posted_at
        const drafts = (allPostsData || []).filter(post => !post.scheduled_at && !post.posted_at);
        setPosts(drafts);
      } else if (postsError) {
        const errorInfo = formatError(postsError);
        console.error('Error fetching posts:', errorInfo);
        console.error('Raw postsError:', postsError);
        throw postsError;
      } else {
        setPosts(postsData || []);
      }

      // Fetch scheduled posts
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const token = session.access_token;
          const res = await fetch('/api/schedule', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            setScheduledPosts(data.scheduledPosts || []);
          } else {
            const errorData = await res.json().catch(() => ({}));
            console.error('Error fetching scheduled posts:', {
              status: res.status,
              statusText: res.statusText,
              message: errorData.error || 'Failed to fetch scheduled posts',
              errorData,
            });
          }
        }
      } catch (scheduleError: any) {
        console.error('Error in scheduled posts fetch:', {
          message: scheduleError?.message || 'Unknown error',
          error: scheduleError,
        });
        // Don't throw - allow the page to still show unscheduled posts
      }
    } catch (error: any) {
      const errorInfo = formatError(error);
      console.error('Error fetching data:', errorInfo);
      console.error('Raw error object:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSchedule() {
    if (!selectedPost || !scheduledDate || !scheduledTime) {
      alert('Please select a post, date, and time');
      return;
    }

    try {
      setScheduling(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in');
        return;
      }

      // Combine date and time
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

      // Validate it's in the future
      if (new Date(scheduledAt) <= new Date()) {
        alert('Scheduled time must be in the future');
        setScheduling(false);
        return;
      }

      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          postId: selectedPost.id,
          scheduledAt,
          platform: selectedPlatform || 'instagram',
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to schedule post');
      }

      // Reset form
      setSelectedPost(null);
      setScheduledDate('');
      setScheduledTime('');
      
      // Refresh data
      fetchData();
      
      alert('Post scheduled successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to schedule post');
    } finally {
      setScheduling(false);
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
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to cancel scheduled post');
      }

      fetchData();
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
      pending: 'bg-yellow-100 text-yellow-700',
      posted: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      cancelled: 'bg-zinc-100 text-zinc-700',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }

  // Set default date/time to tomorrow at 9 AM
  // Re-run when date/time become empty to restore defaults after form reset
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    const dateStr = tomorrow.toISOString().split('T')[0];
    const timeStr = '09:00';
    
    if (!scheduledDate) setScheduledDate(dateStr);
    if (!scheduledTime) setScheduledTime(timeStr);
  }, [scheduledDate, scheduledTime]);

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Schedule Posts</h1>
        <p className="text-zinc-600">Schedule your content to be posted automatically</p>
      </div>

      {/* Schedule New Post */}
      <div className="bg-white rounded-lg border border-zinc-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-zinc-900 mb-4">Schedule a Post</h2>
        
        {posts.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <p>No draft posts available to schedule</p>
            <p className="text-sm mt-2">Create content first to schedule it</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Select Post
              </label>
              <select
                value={selectedPost?.id || ''}
                onChange={(e) => {
                  const post = posts.find(p => p.id === e.target.value);
                  setSelectedPost(post || null);
                }}
                className="w-full border border-zinc-300 rounded-lg px-3 py-2"
              >
                <option value="">Choose a post...</option>
                {posts.map((post) => (
                  <option key={post.id} value={post.id}>
                    {post.ai_caption || post.content || 'Untitled'} - {new Date(post.created_at).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            {selectedPost && (
              <div className="bg-zinc-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-zinc-600 mb-1">Preview:</p>
                <p className="text-zinc-900 font-medium">{selectedPost.ai_caption || selectedPost.content}</p>
                {selectedPost.ai_hashtags && (
                  <p className="text-zinc-600 text-sm mt-1">{selectedPost.ai_hashtags}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Platform
                </label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2"
                >
                  {PLATFORM_LIST.map((p) => (
                    <option value={p.value} key={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <button
              onClick={handleSchedule}
              disabled={!selectedPost || !scheduledDate || !scheduledTime || scheduling}
              className="bg-zinc-900 text-white px-6 py-2 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {scheduling ? 'Scheduling...' : 'Schedule Post'}
            </button>
          </div>
        )}
      </div>

      {/* Scheduled Posts */}
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 mb-4">Scheduled Posts</h2>
        {loading ? (
          <div className="text-center py-8 text-zinc-500">Loading scheduled posts...</div>
        ) : scheduledPosts.length === 0 ? (
          <div className="text-center py-12 bg-white border border-zinc-200 rounded-lg">
            <p className="text-zinc-500">No scheduled posts</p>
            <p className="text-zinc-400 text-sm mt-2">Schedule a post to see it here</p>
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
                      {getStatusBadge(scheduledPost.status)}
                      <span className="text-sm text-zinc-500">
                        Scheduled: {formatDate(scheduledPost.scheduled_at)}
                      </span>
                    </div>
                  </div>
                  {scheduledPost.status === 'pending' && (
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
                      {scheduledPost.posts.ai_caption || scheduledPost.posts.content}
                    </p>
                    {scheduledPost.posts.ai_hashtags && (
                      <p className="text-zinc-600 text-sm">{scheduledPost.posts.ai_hashtags}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
