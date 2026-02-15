import type { Metadata } from "next";
import Link from "next/link";
import { LandingFooter, LandingNav, CTAStrip } from "@/components/landing";
import { AuthAwareLink } from "@/components/auth/AuthAwareLink";
import { DashboardCtaLink } from "@/components/auth/DashboardCtaLink";

export const metadata: Metadata = {
  title: "Features | Postinet AI",
  description:
    "Explore Postinet AI features: upload once, schedule everywhere, a calm calendar view, clear statuses, and reliable publishing to Facebook and YouTube.",
};

const FEATURE_BLOCKS = [
  {
    id: "schedule-posts",
    title: "Schedule posts",
    desc: "Plan a week (or a month) in one calm calendar. Post on time, every time.",
    bullets: ["Pick your times", "Stay consistent", "Make posting automatic"],
    accent: "emerald",
    dashboardHref: "/dashboard/schedule",
    dashboardLabel: "Open calendar",
  },
  {
    id: "upload-once",
    title: "Upload once",
    desc: "One place for your content. No re-uploading per platform—keep your workflow simple.",
    bullets: ["One upload flow", "Consistent captions", "Less tab switching"],
    accent: "emerald",
    dashboardHref: "/dashboard/create",
    dashboardLabel: "Create a post",
  },
  {
    id: "calendar",
    title: "Calendar view",
    desc: "See what’s going out and when—so your week stays predictable.",
    bullets: ["Weekly rhythm", "At-a-glance schedule", "Quick edits before publish"],
    accent: "sky",
    dashboardHref: "/dashboard/schedule",
    dashboardLabel: "View schedule",
  },
  {
    id: "platforms",
    title: "Multi-platform",
    desc: "Facebook and YouTube today. More platforms coming soon.",
    bullets: ["Publish to both", "One workflow", "Less duplicate work"],
    accent: "sky",
    dashboardHref: "/dashboard/accounts",
    dashboardLabel: "Connect accounts",
  },
  {
    id: "reliability",
    title: "Reliable delivery",
    desc: "Clear status per post and per platform. No guessing, no duplicate posts.",
    bullets: ["Scheduled / Published / Needs attention", "Retries when safe", "Clarity without chaos"],
    accent: "amber",
    dashboardHref: "/dashboard/history",
    dashboardLabel: "View history",
  },
  {
    id: "accounts",
    title: "Accounts you can trust",
    desc: "Connect Facebook and YouTube once, and reconnect quickly when permissions change.",
    bullets: ["Easy reconnect", "Fast troubleshooting", "Built for real-world platform quirks"],
    accent: "emerald",
    dashboardHref: "/dashboard/accounts",
    dashboardLabel: "Manage accounts",
  },
  {
    id: "history",
    title: "History & outcomes",
    desc: "Know what happened. Track what published and what needs a quick fix.",
    bullets: ["Outcome timeline", "Quick triage", "Stay consistent"],
    accent: "sky",
    dashboardHref: "/dashboard/history",
    dashboardLabel: "Open history",
  },
  {
    id: "creator-first",
    title: "Creator-first UX",
    desc: "Fast paths to the common jobs: create, schedule, and move on with your day.",
    bullets: ["Less clutter", "Fewer clicks", "Designed for creators—not agencies"],
    accent: "emerald",
    dashboardHref: "/dashboard",
    dashboardLabel: "Open dashboard",
  },
] as const;

function AccentPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
      {label}
    </span>
  );
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <LandingNav />

      <main>
        {/* Hero */}
        <section className="pt-24 sm:pt-28 pb-14 px-4 border-b border-white/5">
          <div className="mx-auto max-w-[1100px]">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <AccentPill label="Features" />
              <AccentPill label="Facebook + YouTube" />
              <AccentPill label="Scheduling" />
            </div>
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                Everything you need to post with peace of mind.
              </h1>
              <p className="mt-5 text-zinc-400 text-base sm:text-lg leading-relaxed">
                Postinet AI is built around one idea: less chaos, more consistency. Upload once, schedule everywhere, and
                always know what happened.
              </p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <DashboardCtaLink
                signedOutHref="/auth/signup?next=%2Fdashboard"
                signedOutText="Sign up - It’s FREE"
                className="w-full sm:w-auto rounded-lg bg-white text-zinc-900 px-6 py-3.5 text-base font-semibold hover:bg-zinc-100 transition-colors text-center"
              />
              <Link
                href="/how-it-works"
                className="w-full sm:w-auto rounded-lg border border-zinc-600 text-zinc-300 px-6 py-3.5 text-base font-medium hover:border-zinc-500 hover:text-white transition-colors text-center"
              >
                How it works
              </Link>
              <Link
                href="/pricing"
                className="w-full sm:w-auto rounded-lg border border-zinc-600 text-zinc-300 px-6 py-3.5 text-base font-medium hover:border-zinc-500 hover:text-white transition-colors text-center"
              >
                Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Feature grid */}
        <section className="py-12 sm:py-16 px-4">
          <div className="mx-auto max-w-[1100px]">
            <div className="flex items-end justify-between gap-6 mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Core features</h2>
                <p className="mt-2 text-zinc-400 max-w-2xl">
                  The essentials that make scheduling feel calm—not complicated.
                </p>
              </div>
              <Link
                href="/help-center"
                className="hidden sm:inline-flex text-sm text-zinc-400 hover:text-white underline underline-offset-4"
              >
                Visit Help Center →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURE_BLOCKS.map((f) => {
                const accent =
                  f.accent === "sky"
                    ? "border-sky-500/20 bg-sky-500/5 hover:border-sky-500/30"
                    : f.accent === "amber"
                      ? "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/30"
                      : "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/30";

                const dot =
                  f.accent === "sky"
                    ? "bg-sky-400"
                    : f.accent === "amber"
                      ? "bg-amber-400"
                      : "bg-emerald-400";

                return (
                  <div
                    key={f.id}
                    id={f.id}
                    className={`rounded-2xl border p-6 transition-colors bg-zinc-900/40 hover:bg-zinc-900/55 ${accent}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className={`inline-flex h-2 w-2 rounded-full ${dot}`} aria-hidden />
                      <AuthAwareLink
                        href={f.dashboardHref}
                        className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-4"
                        title={f.dashboardLabel}
                      >
                        {f.dashboardLabel} →
                      </AuthAwareLink>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-white">{f.title}</h3>
                    <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
                    <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                      {f.bullets.map((b) => (
                        <li key={b} className="flex gap-2">
                          <span className="text-emerald-400">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-12 sm:py-16 px-4 border-t border-white/5">
          <div className="mx-auto max-w-[1100px]">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Try the workflow that stays out of your way
                </h2>
                <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-2xl">
                  Upload once, schedule in minutes, and see clear outcomes for every post—across Facebook and YouTube.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <DashboardCtaLink
                  signedOutHref="/auth/signup?next=%2Fdashboard"
                  signedOutText="Sign up - It’s FREE"
                  className="w-full md:w-auto rounded-lg bg-white text-zinc-900 px-6 py-3 text-sm font-semibold hover:bg-zinc-100 transition-colors text-center"
                />
                <Link
                  href="/scheduling-tips"
                  className="w-full md:w-auto rounded-lg border border-zinc-600 px-6 py-3 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors text-center"
                >
                  Read scheduling tips
                </Link>
              </div>
            </div>
          </div>
        </section>

        <CTAStrip />
      </main>

      <LandingFooter />
    </div>
  );
}

