"use client";

import Link from "next/link";

/**
 * Soft "Needs attention" card when some posts need a quick fix. Replaces red error banner.
 */
export default function NeedsAttentionCard() {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-amber-100">Needs attention</p>
          <p className="text-amber-200/80">A few posts need a quick fix.</p>
        </div>
        <Link
          href="/dashboard/history?filter=failed"
          className="inline-flex items-center justify-center rounded-lg border border-amber-500/50 px-3 py-1.5 text-xs font-semibold text-amber-100 hover:bg-amber-500/20"
        >
          Review
        </Link>
      </div>
    </div>
  );
}
