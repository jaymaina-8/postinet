import type { Metadata } from "next";
import Link from "next/link";
import { LandingNav } from "@/components/landing";
import { LandingFooter } from "@/components/landing";
import { HeroOrbitAnimation } from "@/components/hero";

export const metadata: Metadata = {
  title: "About | Postinet AI",
  description: "Peace of mind for your social presence. We help creators and businesses post to Facebook and YouTube from one place.",
};

const STATS = [
  { value: "12M+", label: "Creators & businesses" },
  { value: "1M+", label: "Posts scheduled" },
  { value: "50+", label: "Countries" },
];

const VALUES = [
  {
    title: "Simplicity first",
    tagline: "Less tools, more creating",
    description: "We strip away the complexity of multi-platform posting. One upload, one calendar, one place to see everything.",
    icon: "◇",
    accent: "emerald",
  },
  {
    title: "Built for creators",
    tagline: "Your content, your rules",
    description: "Postinet is designed for people who create—not agencies. Your schedule, your peace of mind.",
    icon: "◆",
    accent: "emerald",
  },
  {
    title: "Transparent & reliable",
    tagline: "No black boxes",
    description: "Clear status for every post. No duplicate publishes. You always know what went out and when.",
    icon: "◎",
    accent: "emerald",
  },
];

const PRESS = [
  {
    title: "Postinet launches cross-platform scheduling",
    excerpt: "One place to schedule and publish to Facebook and YouTube.",
    source: "Product Hunt",
    date: "2024",
    href: "/news/launch",
    badge: "Launch",
    badgeStyle: "emerald",
  },
  {
    title: "How small teams save 5+ hours a week",
    excerpt: "Real stories from creators who switched to Postinet.",
    source: "Creator blog",
    date: "2024",
    href: "/blog/small-teams-save-time",
    badge: "Tips",
    badgeStyle: "emerald",
  },
  {
    title: "Facebook & YouTube in one dashboard",
    excerpt: "See what’s new in the latest release.",
    source: "Changelog",
    date: "2024",
    href: "/news/changelog",
    badge: "Product",
    badgeStyle: "emerald",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <LandingNav />

      <main>
        {/* Hero */}
        <section className="pt-24 sm:pt-28 pb-16 px-4">
          <div className="mx-auto max-w-[1100px] text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/90 mb-4">
              About us
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white max-w-3xl mx-auto leading-tight">
              Peace of mind for your social presence
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto mt-6 leading-relaxed">
              Postinet AI helps creators and businesses post to social media without the guesswork. Upload once, schedule everywhere, and we handle publishing on time.
            </p>
          </div>
        </section>

        {/* Stats strip */}
        <section className="py-10 sm:py-14 px-4 border-y border-white/5">
          <div className="mx-auto max-w-[1100px]">
            <div className="grid grid-cols-3 gap-8 text-center">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums">{value}</div>
                  <div className="mt-1 text-sm text-zinc-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission — two columns */}
        <section className="py-14 sm:py-20 px-4">
          <div className="mx-auto max-w-[1100px]">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  The freedom of consistent posting
                </h2>
                <p className="text-zinc-400 leading-relaxed mb-4">
                  Social media moves fast. Your content shouldn’t get stuck in spreadsheets, reminders, or “I’ll post later.” Our mission is to give every creator and small team a single place to schedule and publish to Facebook and YouTube—without duplicate posts, missed slots, or last-minute scrambles.
                </p>
                <p className="text-zinc-400 leading-relaxed">
                  We built Postinet so you can focus on creating. Set your calendar once, and we’ll make sure it goes out exactly when you said it would.
                </p>
              </div>
              <div className="flex justify-center">
                <HeroOrbitAnimation variant="dark" showFloatingCards={false} />
              </div>
            </div>
          </div>
        </section>

        {/* Values / pillars — engaging cards with icon + tagline */}
        <section className="py-14 sm:py-20 px-4 border-t border-white/5">
          <div className="mx-auto max-w-[1100px]">
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">
              What we stand for
            </h2>
            <p className="text-zinc-500 text-center text-sm mb-10 max-w-lg mx-auto">
              The principles that shape how we build Postinet AI
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {VALUES.map((v, i) => (
                <div
                  key={i}
                  className={`
                    relative rounded-2xl border p-6 overflow-hidden
                    transition-all duration-300 hover:shadow-lg hover:shadow-black/30
                    border-emerald-500/25 bg-emerald-500/5 hover:border-emerald-500/40
                  `}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-lg text-white/90">
                      {v.icon}
                    </span>
                    <div>
                      <h3 className="font-semibold text-white text-lg">{v.title}</h3>
                      <p className="text-xs text-zinc-500 font-medium">{v.tagline}</p>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsroom — customized press cards with accent stripe + excerpt */}
        <section className="py-14 sm:py-20 px-4 border-t border-white/5">
          <div className="mx-auto max-w-[1100px]">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/80 text-center mb-2">
              Press & updates
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">
              Newsroom
            </h2>
            <p className="text-zinc-500 text-center text-sm mb-12 max-w-md mx-auto">
              Updates, launches, and stories from the Postinet team
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {PRESS.map((item, i) => {
                const badgeClass = "text-emerald-400 bg-emerald-500/15 border-emerald-500/30";
                return (
                  <Link
                    key={i}
                    href={item.href}
                    className="group relative block rounded-2xl border border-white/10 bg-zinc-900/50 overflow-hidden hover:border-white/20 hover:bg-zinc-800/50 transition-all duration-300"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500/60 to-emerald-600/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="p-6">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${badgeClass}`}>
                          {item.badge}
                        </span>
                        <span className="text-xs text-zinc-500 tabular-nums">{item.date}</span>
                      </div>
                      <h3 className="font-semibold text-white text-base sm:text-lg mb-2 group-hover:text-emerald-200 transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                      {"excerpt" in item && item.excerpt && (
                        <p className="text-sm text-zinc-500 line-clamp-2 mb-4 leading-relaxed">
                          {item.excerpt}
                        </p>
                      )}
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

        {/* CTA */}
        <section className="py-14 sm:py-20 px-4 border-t border-white/5">
          <div className="mx-auto max-w-[1100px] text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to post with peace of mind?
            </h2>
            <p className="text-zinc-400 max-w-lg mx-auto mb-8">
              Join creators and businesses who schedule once and publish everywhere.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto rounded-lg bg-white text-zinc-900 px-6 py-3.5 text-base font-semibold hover:bg-zinc-100 transition-colors text-center"
              >
                Get started free
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
      </main>

      <LandingFooter />
    </div>
  );
}
