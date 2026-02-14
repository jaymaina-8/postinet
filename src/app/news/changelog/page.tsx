import type { Metadata } from "next";
import Link from "next/link";
import { LandingNav } from "@/components/landing";
import { LandingFooter } from "@/components/landing";

export const metadata: Metadata = {
  title: "Facebook & YouTube in one dashboard | Postinet Changelog",
  description: "See what’s new: unified dashboard, clearer status, and a single place to manage both platforms.",
};

const CHANGELOG_ENTRIES = [
  { version: "1.2", date: "Feb 2024", title: "Unified calendar view", description: "All scheduled and published posts for Facebook and YouTube now appear in one timeline. Filter by platform or status with one click." },
  { version: "1.1", date: "Jan 2024", title: "Clear post status", description: "Every post now shows a clear state: Scheduled, Published, or Needs attention. No more guessing whether something went out." },
  { version: "1.0", date: "Jan 2024", title: "Facebook & YouTube in one dashboard", description: "Connect both accounts and manage scheduling from a single place. One upload, one calendar, publish to both on your schedule." },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <LandingNav />

      <article className="pb-20">
        <header className="pt-24 sm:pt-28 pb-12 px-4 border-b border-white/5">
          <div className="mx-auto max-w-[720px]">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded border border-emerald-500/30">
                Product
              </span>
              <span className="text-zinc-500 text-sm">Changelog</span>
              <span className="text-zinc-600">·</span>
              <time className="text-zinc-500 text-sm" dateTime="2024-02-10">February 10, 2024</time>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              Facebook & YouTube in one dashboard
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed">
              See what’s new in the latest release: one place to schedule and publish to both platforms.
            </p>
          </div>
        </header>

        {/* Visual: dashboard mock */}
        <div className="py-12 px-4">
          <div className="mx-auto max-w-[720px] rounded-2xl border border-white/10 bg-zinc-900/50 overflow-hidden">
            <div className="aspect-video bg-zinc-900 flex items-center justify-center p-6">
              <div className="w-full max-w-lg rounded-xl border border-white/10 bg-zinc-800/80 p-4">
                <div className="flex gap-4 mb-4">
                  <span className="text-zinc-500 text-xs font-medium">Calendar</span>
                  <span className="text-zinc-500 text-xs font-medium">Facebook</span>
                  <span className="text-zinc-500 text-xs font-medium">YouTube</span>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded bg-zinc-700/50 flex items-center justify-center text-[10px] text-zinc-500">
                      {i + 1}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Facebook</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> YouTube</span>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-zinc-500 py-3 border-t border-white/5">One dashboard. Both platforms.</p>
          </div>
        </div>

        <div className="px-4 max-w-[720px] mx-auto space-y-8 text-zinc-300 leading-relaxed">
          <p>
            We’ve shipped several updates so you can manage Facebook and YouTube from a single dashboard. Here’s what’s new and how it helps.
          </p>
          <h2 className="text-xl font-semibold text-white pt-4">What’s new</h2>
        </div>

        {/* Changelog list */}
        <div className="mx-auto max-w-[720px] px-4 py-6 space-y-6">
          {CHANGELOG_ENTRIES.map((entry, i) => (
            <div
              key={entry.version}
              className="rounded-xl border border-white/10 bg-zinc-900/30 p-5 hover:border-emerald-500/20 transition-colors"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-emerald-400 font-mono text-sm font-semibold">v{entry.version}</span>
                <span className="text-zinc-500 text-sm">{entry.date}</span>
              </div>
              <h3 className="font-semibold text-white mb-1">{entry.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{entry.description}</p>
            </div>
          ))}
        </div>

        <div className="px-4 max-w-[720px] mx-auto space-y-6 text-zinc-300 leading-relaxed">
          <p>
            We’re working on more platforms and smarter scheduling. If you have feedback or feature requests, reach out at support@postinet.pro or from the help section in the app.
          </p>
        </div>

        <div className="mx-auto max-w-[720px] px-4 pt-12">
          <Link href="/about" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
            ← Back to Newsroom
          </Link>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
