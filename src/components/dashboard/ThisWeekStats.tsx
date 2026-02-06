import Link from "next/link";

export default function ThisWeekStats({
  publishedThisWeek,
  scheduledUpcoming,
  failedCount,
}: {
  publishedThisWeek: number;
  scheduledUpcoming: number;
  failedCount: number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">This week</h3>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Published</span>
          <span className="text-zinc-100 font-semibold">{publishedThisWeek}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Scheduled upcoming</span>
          <span className="text-zinc-100 font-semibold">{scheduledUpcoming}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Failed</span>
          <Link href="/dashboard/history" className="text-rose-300 hover:text-rose-200 font-semibold">
            {failedCount}
          </Link>
        </div>
      </div>
    </div>
  );
}
