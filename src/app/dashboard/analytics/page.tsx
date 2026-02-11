"use client";

import { useEffect, useMemo, useState } from "react";
import supabase from "@/lib/supabaseClient";

type PostRow = {
  id: string;
  content: string | null;
  platform: string | null;
  posted_at: string | null;
  status: string | null;
  metrics: any;
};

export default function AnalyticsPage() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("posts")
        .select("id, content, platform, posted_at, status, metrics")
        .eq("user_id", session.user.id)
        .order("posted_at", { ascending: false });

      if (!error) {
        setPosts(data || []);
      }
      setLoading(false);
    }
    fetchPosts();
  }, []);

  const metrics = useMemo(() => {
    const published = posts.filter((p) => p.posted_at);
    const failures = posts.filter((p) => p.status === "failed");
    const engagement = published.reduce((sum, post) => {
      if (!post.metrics) return sum;
      if (typeof post.metrics.engagement === "number") return sum + post.metrics.engagement;
      if (typeof post.metrics.likes === "number" || typeof post.metrics.comments === "number") {
        return sum + (post.metrics.likes || 0) + (post.metrics.comments || 0);
      }
      return sum;
    }, 0);

    const perPlatform = published.reduce<Record<string, number>>((acc, post) => {
      const key = post.platform || "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      publishedCount: published.length,
      failureCount: failures.length,
      engagement,
      perPlatform,
    };
  }, [posts]);

  const topPosts = useMemo(() => posts.filter((p) => p.posted_at).slice(0, 5), [posts]);
  const hasAnalytics = metrics.engagement > 0 || topPosts.length > 0;

  return (
    <div className="max-w-6xl mx-auto pt-4 pb-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Analytics</h1>
        <p className="text-zinc-400">Performance insights without the noise.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Posts published", value: metrics.publishedCount },
          { label: "Engagement", value: metrics.engagement || "—" },
          { label: "Failures", value: metrics.failureCount },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="text-sm text-zinc-400">{item.label}</div>
            <div className="text-2xl font-semibold text-white mt-2">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Per-platform breakdown</h2>
          {Object.keys(metrics.perPlatform).length === 0 ? (
            <p className="text-sm text-zinc-500">No platform data yet.</p>
          ) : (
            Object.entries(metrics.perPlatform).map(([platform, count]) => (
              <div key={platform} className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">{platform}</span>
                <span className="text-zinc-100 font-semibold">{count}</span>
              </div>
            ))
          )}
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Top posts</h2>
          {topPosts.length === 0 ? (
            <p className="text-sm text-zinc-500">No published posts yet.</p>
          ) : (
            topPosts.map((post) => (
              <div key={post.id} className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
                <p className="text-sm text-zinc-200 line-clamp-1">{post.content || "Untitled post"}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {post.platform || "Platform"} · {post.posted_at ? new Date(post.posted_at).toLocaleDateString() : "—"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {!loading && !hasAnalytics && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-center">
          <h3 className="text-lg font-semibold text-white">Analytics will appear here</h3>
          <p className="text-sm text-zinc-400 mt-2">
            Publish your first post to start tracking performance.
          </p>
        </div>
      )}
    </div>
  );
}
