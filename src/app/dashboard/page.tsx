"use client";

import React, { Suspense, useEffect, useState } from "react";
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
}

export default function DashboardPage() {
  const [stats, setStats] = useState<UserStats>({
    hasConnectedAccounts: false,
    connectedPlatforms: [],
    hasDrafts: false,
    hasPublishedPosts: false,
    draftCount: 0,
    scheduledCount: 0,
    publishedCount: 0,
  });
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
        .select("scheduled_at, posted_at");

      // Only log if there's a real error with a message
      if (postsError && postsError.message) {
        console.error("Error fetching posts:", postsError.message);
      }

      const drafts = posts?.filter((p) => !p.scheduled_at && !p.posted_at) || [];
      const scheduled = posts?.filter((p) => p.scheduled_at && !p.posted_at) || [];
      const published = posts?.filter((p) => p.posted_at) || [];

      setStats({
        hasConnectedAccounts: (accounts?.length || 0) > 0,
        connectedPlatforms,
        hasDrafts: drafts.length > 0,
        hasPublishedPosts: published.length > 0,
        draftCount: drafts.length,
        scheduledCount: scheduled.length,
        publishedCount: published.length,
      });
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

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Welcome to Postinet</h1>
        <p className="text-zinc-600">
          Your AI-powered social media command center. Let&apos;s get you publishing!
        </p>
      </div>

      {/* Guided Steps */}
      {!loading && currentStep < 4 && (
        <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50">
        <CardHeader>
            <CardTitle className="text-emerald-800">
              {currentStep === 1 && "Step 1: Connect Your Social Accounts"}
              {currentStep === 2 && "Step 2: Generate Your First Post"}
              {currentStep === 3 && "Step 3: Publish or Schedule Your Content"}
            </CardTitle>
        </CardHeader>
        <CardContent>
            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-zinc-700">
                  Connect your Facebook Page or YouTube channel to start publishing AI-generated content.
                </p>
                <Link
                  href="/dashboard/accounts"
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Connect Account
                </Link>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-zinc-700">
                  Great! Your accounts are connected. Now let&apos;s create your first AI-powered post.
                </p>
                <Link
                  href="/dashboard/generate"
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Content
                </Link>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-zinc-700">
                  You have {stats.draftCount} draft{stats.draftCount !== 1 ? 's' : ''} ready. 
                  Publish now or schedule for later!
                </p>
                <div className="flex gap-3">
                  <Link
                    href="/dashboard/schedule"
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Schedule Post
                  </Link>
                  <Link
                    href="/dashboard/history"
                    className="inline-flex items-center gap-2 border border-emerald-600 text-emerald-700 px-6 py-3 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
                  >
                    View Drafts
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">{stats.connectedPlatforms.length}</p>
                <p className="text-sm text-zinc-500">Connected Accounts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">{stats.draftCount}</p>
                <p className="text-sm text-zinc-500">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">{stats.scheduledCount}</p>
                <p className="text-sm text-zinc-500">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">{stats.publishedCount}</p>
                <p className="text-sm text-zinc-500">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/accounts" className="group">
            <Card className="h-full hover:border-blue-300 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">Manage Accounts</h3>
                    <p className="text-sm text-zinc-500 mt-1">Connect or manage your social platforms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/generate" className="group">
            <Card className="h-full hover:border-emerald-300 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">Generate Content</h3>
                    <p className="text-sm text-zinc-500 mt-1">Create AI-powered posts and captions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/schedule" className="group">
            <Card className="h-full hover:border-purple-300 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">Schedule Posts</h3>
                    <p className="text-sm text-zinc-500 mt-1">Plan and schedule your content</p>
                  </div>
                </div>
        </CardContent>
      </Card>
          </Link>
        </div>
      </div>

      {/* Connected Platforms Status */}
      {stats.hasConnectedAccounts && (
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">Connected Platforms</h2>
          <div className="flex flex-wrap gap-3">
            {stats.connectedPlatforms.includes(PLATFORMS.FACEBOOK) && (
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-blue-800">Facebook</span>
                <span className="w-2 h-2 rounded-full bg-green-500" />
              </div>
            )}
            {stats.connectedPlatforms.includes(PLATFORMS.YOUTUBE) && (
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2">
                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-red-800">YouTube</span>
                <span className="w-2 h-2 rounded-full bg-green-500" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
