import Link from "next/link";

export default function PrimaryActionCard() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900/80 to-zinc-950 p-6 space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Launchpad</p>
        <h2 className="text-2xl font-semibold text-white mt-2">What do you want to post today?</h2>
        <p className="text-sm text-zinc-400 mt-2">Upload once. Schedule or post instantly.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/dashboard/create#upload"
          className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
        >
          Upload media
        </Link>
        <Link
          href="/dashboard/create"
          className="inline-flex items-center justify-center rounded-lg border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 hover:border-zinc-500"
        >
          Write a post
        </Link>
        <Link
          href="/dashboard/schedule"
          className="inline-flex items-center justify-center rounded-lg border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 hover:border-zinc-500"
        >
          Schedule for later
        </Link>
      </div>
    </div>
  );
}
