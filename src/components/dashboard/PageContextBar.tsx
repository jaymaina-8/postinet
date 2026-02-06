"use client";

import Link from "next/link";
import { usePageScope } from "@/components/PageScope";

export default function PageContextBar() {
  const { selectedPage, clearSelection } = usePageScope();

  if (!selectedPage) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-300">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>Select a Facebook Page to start.</span>
          <Link
            href="/dashboard/accounts"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-zinc-500"
          >
            Connect a Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-300">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Creating for: <span className="font-semibold text-zinc-100">{selectedPage.name}</span> (Facebook)
        </span>
        <button
          type="button"
          onClick={clearSelection}
          className="inline-flex items-center justify-center rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-zinc-500"
        >
          Change Page
        </button>
      </div>
    </div>
  );
}
