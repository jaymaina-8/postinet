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
        <h3 className="text-lg font-semibold text-white">This week&apos;s progress</h3>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Live</span>
          <span className="text-zinc-100 font-semibold">{publishedThisWeek}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Going out</span>
          <span className="text-zinc-100 font-semibold">{scheduledUpcoming}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Needs attention</span>
          <Link href="/dashboard/history?filter=failed" className="text-amber-300 hover:text-amber-200 font-semibold">
            {failedCount}
          </Link>
        </div>
      </div>
    </div>
  );
}
