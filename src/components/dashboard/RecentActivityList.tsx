import Link from "next/link";

type RecentPost = {
  id: string;
  content: string | null;
  media_url: string | null;
  status: string | null;
  scheduled_at: string | null;
  posted_at: string | null;
  created_at: string;
};

// Creator-friendly labels: Draft→Needs finishing, Scheduled→Going out, Failed→Needs attention, Published→Live
const statusStyles: Record<string, string> = {
  "needs finishing": "bg-zinc-500/20 text-zinc-300 border border-zinc-500/30",
  "going out": "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  "needs attention": "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  live: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
};

function getStatusLabel(post: RecentPost): string {
  if (post.status === "failed") return "Needs attention";
  if (post.posted_at) return "Live";
  if (post.scheduled_at) return "Going out";
  return "Needs finishing";
}

export default function RecentActivityList({
  posts,
  loading,
}: {
  posts: RecentPost[];
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Your latest posts</h3>
          <p className="text-xs text-zinc-500">Last 5 posts across platforms.</p>
        </div>
      </div>
      {loading ? (
        <div className="text-sm text-zinc-500">Loading…</div>
      ) : posts.length === 0 ? (
        <div className="text-sm text-zinc-500">No posts yet. Create your first post to see it here.</div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const label = getStatusLabel(post);
            const statusKey = label.toLowerCase();
            return (
              <div
                key={post.id}
                className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
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
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyles[statusKey] || statusStyles["needs finishing"]}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
