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

const statusStyles: Record<string, string> = {
  scheduled: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  published: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  failed: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
  draft: "bg-zinc-500/20 text-zinc-300 border border-zinc-500/30",
};

function getStatusLabel(post: RecentPost) {
  if (post.status === "failed") return "Failed";
  if (post.posted_at) return "Published";
  if (post.scheduled_at) return "Scheduled";
  return "Draft";
}

export default function RecentActivityList({
  posts,
  loading,
  showFailureHint,
}: {
  posts: RecentPost[];
  loading: boolean;
  showFailureHint: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Recent activity</h3>
          <p className="text-xs text-zinc-500">Last 5 posts across platforms.</p>
        </div>
        <span className="text-xs text-zinc-500">Live</span>
      </div>
      {showFailureHint && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          Some posts failed.{" "}
          <Link href="/dashboard/history" className="font-semibold text-rose-100 hover:text-white">
            Review and retry.
          </Link>
        </div>
      )}
      {loading ? (
        <div className="text-sm text-zinc-500">Loading recent posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-sm text-zinc-500">No posts yet. Create your first post to see activity here.</div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const status = getStatusLabel(post).toLowerCase();
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
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyles[status] || statusStyles.draft}`}>
                  {getStatusLabel(post)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
