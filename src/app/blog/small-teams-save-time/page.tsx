import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LandingNav } from "@/components/landing";
import { LandingFooter } from "@/components/landing";

export const metadata: Metadata = {
  title: "How small teams save 5+ hours a week | Postinet AI Blog",
  description: "Real stories from creators and small teams who switched to Postinet and got their time back.",
};

export default function SmallTeamsSaveTimePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <LandingNav />

      <article className="pb-20">
        <header className="pt-24 sm:pt-28 pb-12 px-4 border-b border-white/5">
          <div className="mx-auto max-w-[720px]">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded border border-emerald-500/30">
                Tips
              </span>
              <span className="text-zinc-500 text-sm">Creator blog</span>
              <span className="text-zinc-600">·</span>
              <time className="text-zinc-500 text-sm" dateTime="2024-02-01">February 1, 2024</time>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              How small teams save 5+ hours a week
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed">
              Real stories from creators who switched to Postinet and stopped juggling spreadsheets and reminders.
            </p>
          </div>
        </header>

        {/* Visual: before/after or quote */}
        <div className="py-12 px-4">
          <div className="mx-auto max-w-[720px] rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-8">
            <blockquote className="text-lg sm:text-xl text-zinc-200 leading-relaxed italic">
              “I used to block an hour every Monday just to schedule posts. Now I do it in one sitting and I’m done. That hour goes back into making content.”
            </blockquote>
            <footer className="mt-4 flex items-center gap-3">
              <Image
                src="https://i.pravatar.cc/150?img=33"
                alt="Marcus K."
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <cite className="not-italic font-semibold text-white">Marcus K.</cite>
                <p className="text-xs text-zinc-500">Small business owner, 2 platforms</p>
              </div>
            </footer>
          </div>
        </div>

        <div className="px-4 max-w-[720px] mx-auto space-y-8 text-zinc-300 leading-relaxed">
          <p>
            If you’re posting to Facebook and YouTube (or planning to), you’ve probably felt the pinch: two dashboards, two upload flows, two places to check “did that go out?” Small teams and solo creators don’t have time for that. Here’s how people are saving 5+ hours a week by using one tool for both.
          </p>
          <h2 className="text-xl font-semibold text-white pt-4">The old way: tab switching and checklists</h2>
          <p>
            Most folks we talk to used to keep a spreadsheet or Notion doc with planned posts, then log into Facebook, upload, schedule, then switch to YouTube and do it again. One creator told us she set phone reminders so she wouldn’t forget the second platform. That’s not wrong—it works—but it eats time and mental energy.
          </p>
          <h2 className="text-xl font-semibold text-white pt-4">The shift: one upload, one calendar</h2>
          <p>
            With Postinet, you add your content once and attach it to both platforms. You choose when it goes out for each, and you see everything in a single calendar. No copying links, no re-uploading, no “which tab was I in?” Clear status for every post means you’re not guessing whether something published.
          </p>
          <h2 className="text-xl font-semibold text-white pt-4">Where the 5+ hours comes from</h2>
          <p>
            The savings add up: less context-switching, no duplicate data entry, one place to check status, and no “I’ll post later” drift. Teams tell us they batch their scheduling in one sitting and then forget about it until the next batch. That’s the goal—set it, and let it run so you can focus on creating.
          </p>
          <p>
            If you’re a small team or a creator posting to Facebook and YouTube, try <Link href="/auth/signup" className="text-emerald-400 hover:text-emerald-300 underline">Postinet</Link> and see how much time you get back. We’d love to hear your story.
          </p>
        </div>

        <div className="mx-auto max-w-[720px] px-4 pt-12 flex flex-wrap gap-4">
          <Link href="/blog" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
            ← Back to Newsroom
          </Link>
          <Link href="/blog" className="text-zinc-400 hover:text-white text-sm font-medium">
            All blog posts
          </Link>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
