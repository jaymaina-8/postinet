import type { Metadata } from "next";
import Link from "next/link";
import { LandingNav } from "@/components/landing";
import { LandingFooter } from "@/components/landing";

export const metadata: Metadata = {
  title: "Postinet launches cross-platform scheduling | Postinet AI",
  description: "One place to schedule and publish to Facebook and YouTube. We’re live on Product Hunt.",
};

export default function LaunchPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <LandingNav />

      <article className="pb-20">
        {/* Hero */}
        <header className="pt-24 sm:pt-28 pb-12 px-4 border-b border-white/5">
          <div className="mx-auto max-w-[720px]">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded border border-emerald-500/30">
                Launch
              </span>
              <span className="text-zinc-500 text-sm">Product Hunt</span>
              <span className="text-zinc-600">·</span>
              <time className="text-zinc-500 text-sm" dateTime="2024-01-15">January 15, 2024</time>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              Postinet launches cross-platform scheduling
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed">
              One place to schedule and publish to Facebook and YouTube. No more switching tabs or missing a platform.
            </p>
          </div>
        </header>

        {/* Visual: product mockup */}
        <div className="py-12 px-4">
          <div className="mx-auto max-w-[720px] rounded-2xl border border-white/10 bg-zinc-900/50 overflow-hidden">
            <div className="aspect-video bg-zinc-900 flex items-center justify-center p-8">
              <div className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-800/80 p-6 text-left">
                <div className="flex gap-2 mb-4">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Schedule</p>
                <div className="h-2 w-3/4 rounded bg-zinc-600 mb-2" />
                <div className="h-2 w-1/2 rounded bg-zinc-700 mb-4" />
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium">Facebook</span>
                  <span className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium">YouTube</span>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-zinc-500 py-3 border-t border-white/5">One dashboard. Two platforms. On time, every time.</p>
          </div>
        </div>

        {/* Story */}
        <div className="px-4 max-w-[720px] mx-auto space-y-8 text-zinc-300 leading-relaxed">
          <p>
            Today we’re excited to share that <strong className="text-white">Postinet</strong> is live. We built it for creators and small teams who post to both Facebook and YouTube but were tired of juggling two (or more) tools, copying links, and wondering whether something actually went out.
          </p>
          <p>
            With Postinet, you upload once, set your schedule, and we publish to both platforms when you want. You get a single calendar view, clear status for every post (scheduled, published, or needs attention), and no duplicate posts—we publish once per schedule, exactly as you set it.
          </p>
          <h2 className="text-xl font-semibold text-white pt-4">Why we built it</h2>
          <p>
            We kept hearing the same thing: “I just want one place to see what’s going out and when.” So we focused on that: one place, Facebook and YouTube, with a simple flow. Connect your accounts, add your content, pick your times, and we handle the rest. No agency bloat, no learning five different UIs.
          </p>
          <h2 className="text-xl font-semibold text-white pt-4">What’s next</h2>
          <p>
            We’re starting with Facebook and YouTube and will add more platforms based on what you ask for. In the meantime, we’d love your feedback on <a href="https://www.producthunt.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline">Product Hunt</a> and in the app. Thank you for being part of the launch.
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
