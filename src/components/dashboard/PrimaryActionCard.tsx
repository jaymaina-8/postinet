"use client";

import Link from "next/link";

/**
 * Single primary CTA: "Start a post". Secondary as inline links (Upload media, Write a post, Schedule).
 * Dashboard home composition: used in src/app/dashboard/page.tsx.
 */
export default function PrimaryActionCard({
  title = "Start a post",
  subtitle = "Upload once. Schedule or post instantly.",
  primaryLabel = "Start a post",
}: {
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          href="/dashboard/create"
          className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors w-full sm:w-auto"
        >
          {primaryLabel}
        </Link>
        <span className="text-zinc-500 text-sm hidden sm:inline">or</span>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/dashboard/create#upload"
            className="text-zinc-400 hover:text-zinc-200 underline underline-offset-2"
          >
            Upload media
          </Link>
          <span className="text-zinc-600">·</span>
          <Link
            href="/dashboard/create"
            className="text-zinc-400 hover:text-zinc-200 underline underline-offset-2"
          >
            Write a post
          </Link>
          <span className="text-zinc-600">·</span>
          <Link
            href="/dashboard/schedule"
            className="text-zinc-400 hover:text-zinc-200 underline underline-offset-2"
          >
            Schedule
          </Link>
        </div>
      </div>
    </div>
  );
}
