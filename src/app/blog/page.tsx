import Link from "next/link";
import type { Metadata } from "next";
import { LandingFooter, LandingNav, CTAStrip } from "@/components/landing";

export const metadata: Metadata = {
  title: "Blog | Postinet AI",
  description: "Tips and updates for scheduling and publishing with Postinet AI.",
};

const POSTS = [
  {
    title: "How small teams save 5+ hours a week",
    excerpt:
      "Real stories from creators who switched to Postinet and stopped juggling spreadsheets and reminders.",
    href: "/blog/small-teams-save-time",
    badge: "Tips",
    date: "Feb 1, 2024",
  },
] as const;

const NEWSROOM = [
  {
    title: "Postinet launches cross-platform scheduling",
    excerpt: "One place to schedule and publish to Facebook and YouTube.",
    source: "Product Hunt",
    date: "2024",
    href: "/news/launch",
    badge: "Launch",
  },
  {
    title: "How small teams save 5+ hours a week",
    excerpt: "Real stories from creators who switched to Postinet.",
    source: "Creator blog",
    date: "2024",
    href: "/blog/small-teams-save-time",
    badge: "Tips",
  },
  {
    title: "Facebook & YouTube in one dashboard",
    excerpt: "See what’s new in the latest release.",
    source: "Changelog",
    date: "2024",
    href: "/news/changelog",
    badge: "Product",
  },
] as const;

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <LandingNav />

      <main>
        {/* Hero */}
        <section className="pt-24 sm:pt-28 pb-12 px-4 border-b border-white/5">
          <div className="mx-auto max-w-[1100px]">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/90 mb-3">
              Blog
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Tips, tactics, and calm scheduling.
            </h1>
            <p className="mt-5 text-zinc-400 text-base sm:text-lg leading-relaxed max-w-2xl">
              Short, practical reads for creators and small teams scheduling across Facebook and YouTube.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                href="/scheduling-tips"
                className="w-full sm:w-auto rounded-lg bg-white text-zinc-900 px-6 py-3.5 text-base font-semibold hover:bg-zinc-100 transition-colors text-center"
              >
                Start with scheduling tips
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto rounded-lg border border-zinc-600 text-zinc-300 px-6 py-3.5 text-base font-medium hover:border-zinc-500 hover:text-white transition-colors text-center"
              >
                Back to home
              </Link>
            </div>
          </div>
        </section>

        {/* Posts */}
        <section className="py-12 sm:py-16 px-4">
          <div className="mx-auto max-w-[1100px]">
            <div className="flex items-end justify-between gap-6 mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Latest posts</h2>
                <p className="mt-2 text-zinc-400 max-w-2xl">
                  More is coming—if you want a specific guide, tell us what you’re trying to achieve.
                </p>
              </div>
              <Link
                href="/feature-request"
                className="hidden sm:inline-flex text-sm text-zinc-400 hover:text-white underline underline-offset-4"
              >
                Request a guide →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {POSTS.map((post) => (
                <Link
                  key={post.href}
                  href={post.href}
                  className="group rounded-2xl border border-white/10 bg-zinc-900/40 p-6 hover:bg-zinc-900/55 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded border border-emerald-500/30">
                      {post.badge}
                    </span>
                    <span className="text-xs text-zinc-500">{post.date}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white group-hover:text-emerald-200 transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="mt-5 text-sm font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors">
                    Read post →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Newsroom — press + updates + stories */}
        <section className="py-12 sm:py-16 px-4 border-t border-white/5">
          <div className="mx-auto max-w-[1100px]">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/80 text-center mb-2">
              Press & updates
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">
              Newsroom
            </h2>
            <p className="text-zinc-500 text-center text-sm mb-10 max-w-md mx-auto">
              Updates, launches, and stories from the Postinet team
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {NEWSROOM.map((item) => {
                const badgeClass = "text-emerald-400 bg-emerald-500/15 border-emerald-500/30";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group relative block rounded-2xl border border-white/10 bg-zinc-900/50 overflow-hidden hover:border-white/20 hover:bg-zinc-800/50 transition-all duration-300"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-emerald-500/60 to-emerald-600/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="p-6">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${badgeClass}`}
                        >
                          {item.badge}
                        </span>
                        <span className="text-xs text-zinc-500 tabular-nums">{item.date}</span>
                      </div>
                      <h3 className="font-semibold text-white text-base sm:text-lg mb-2 group-hover:text-emerald-200 transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-sm text-zinc-500 line-clamp-2 mb-4 leading-relaxed">
                        {item.excerpt}
                      </p>
                      <p className="text-xs text-zinc-600 mb-4">{item.source}</p>
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 group-hover:gap-3 transition-all">
                        Read more
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <CTAStrip />
      </main>

      <LandingFooter />
    </div>
  );
}
