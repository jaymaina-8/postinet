import type { Metadata } from "next";
import Link from "next/link";
import { LandingFooter, LandingNav, CTAStrip } from "@/components/landing";
import { HeroOrbitAnimation } from "@/components/hero";
import { DashboardCtaLink } from "@/components/auth/DashboardCtaLink";

export const metadata: Metadata = {
  title: "How it works | Postinet AI",
  description:
    "See how Postinet AI turns one upload into scheduled posts for Facebook and YouTube—clear statuses, reliable delivery, and one calm calendar.",
};

const STEPS = [
  {
    eyebrow: "Step 1",
    title: "Connect once",
    body: "Link your Facebook Page and YouTube channel. After that, they’re ready whenever you are.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 13a5 5 0 007 0l2-2a5 5 0 00-7-7l-1 1M14 11a5 5 0 01-7 0l-2 2a5 5 0 007 7l1-1"
        />
      </svg>
    ),
  },
  {
    eyebrow: "Step 2",
    title: "Upload once",
    body: "Drop your video or image in one place, write your caption, and pick where it should go.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
      </svg>
    ),
  },
  {
    eyebrow: "Step 3",
    title: "Schedule (or publish now)",
    body: "Choose a time—or hit publish. Postinet delivers and keeps a clear status for every platform.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M4 9h16M6 5h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z" />
      </svg>
    ),
  },
];

const STATUS = [
  { label: "Scheduled", desc: "It’s queued and ready.", tone: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" },
  { label: "Published", desc: "It went out successfully.", tone: "bg-sky-500/10 border-sky-500/20 text-sky-300" },
  { label: "Needs attention", desc: "Something needs a quick fix (like reconnecting an account).", tone: "bg-amber-500/10 border-amber-500/20 text-amber-200" },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <LandingNav />

      <main>
        {/* Hero */}
        <section className="pt-24 sm:pt-28 pb-12 px-4">
          <div className="mx-auto max-w-[1100px]">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/90 mb-3">
                  How it works
                </p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                  One upload. One calendar. Clear outcomes.
                </h1>
                <p className="mt-5 text-zinc-400 text-base sm:text-lg leading-relaxed max-w-xl">
                  Postinet AI is built to make posting feel calm: connect your accounts once, upload in one place, and schedule to Facebook and YouTube with a clear status for each platform.
                </p>
                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <DashboardCtaLink
                    signedOutHref="/auth/signup?next=%2Fdashboard"
                    signedOutText="Get started free"
                    className="w-full sm:w-auto rounded-lg bg-white text-zinc-900 px-6 py-3.5 text-base font-semibold hover:bg-zinc-100 transition-colors text-center"
                  />
                  <Link
                    href="/pricing"
                    className="w-full sm:w-auto rounded-lg border border-zinc-600 text-zinc-300 px-6 py-3.5 text-base font-medium hover:border-zinc-500 hover:text-white transition-colors text-center"
                  >
                    See pricing
                  </Link>
                </div>
                <p className="mt-6 text-sm text-zinc-500">
                  Built for creators and small teams. Facebook + YouTube today, more platforms coming.
                </p>
              </div>

              <div className="flex justify-center lg:justify-end">
                <div className="w-full max-w-[560px]">
                  <HeroOrbitAnimation variant="dark" showFloatingCards={false} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-12 sm:py-16 px-4 border-y border-white/5">
          <div className="mx-auto max-w-[1100px]">
            <div className="flex items-end justify-between gap-6 mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">The simple flow</h2>
                <p className="mt-2 text-zinc-400 max-w-2xl">
                  A workflow that feels obvious—because it should.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Upload once
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  Publish everywhere
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STEPS.map((step) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 hover:bg-zinc-900/55 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                      {step.eyebrow}
                    </span>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                      {step.icon}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What you’ll see */}
        <section className="py-12 sm:py-16 px-4">
          <div className="mx-auto max-w-[1100px]">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Clarity, not chaos</h2>
                <p className="mt-3 text-zinc-400 leading-relaxed">
                  Every post has an outcome you can trust. If something needs action, we make it obvious—no guessing, no digging.
                </p>
                <div className="mt-6 space-y-3">
                  {STATUS.map((s) => (
                    <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.tone}`}>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-semibold">{s.label}</span>
                        <span className="text-[11px] uppercase tracking-wider text-white/50">Status</span>
                      </div>
                      <p className="mt-1 text-sm text-white/70">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-linear-to-b from-white/5 to-transparent p-6">
                <h3 className="text-lg font-semibold">A calm calendar</h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                  Plan a week (or a month) without spreadsheets. Schedule once and see what’s going out—at a glance.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">You do</p>
                    <ul className="mt-2 space-y-2 text-sm text-zinc-300">
                      <li className="flex gap-2">
                        <span className="text-emerald-400">•</span>
                        Pick a date and time
                      </li>
                      <li className="flex gap-2">
                        <span className="text-emerald-400">•</span>
                        Choose platforms
                      </li>
                      <li className="flex gap-2">
                        <span className="text-emerald-400">•</span>
                        Press schedule
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Postinet does</p>
                    <ul className="mt-2 space-y-2 text-sm text-zinc-300">
                      <li className="flex gap-2">
                        <span className="text-sky-400">•</span>
                        Publishes on time
                      </li>
                      <li className="flex gap-2">
                        <span className="text-sky-400">•</span>
                        Tracks per-platform status
                      </li>
                      <li className="flex gap-2">
                        <span className="text-sky-400">•</span>
                        Flags anything that needs attention
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-white/10 bg-zinc-950/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Pro tip</p>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Batch your uploads, then schedule them across the week. Your calendar stays full, and your brain stays quiet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mini-CTA */}
        <section className="py-10 sm:py-14 px-4 border-t border-white/5">
          <div className="mx-auto max-w-[1100px]">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Try it on your next post</h2>
                <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-2xl">
                  Upload once, schedule in minutes, and see a clear result for each platform.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <DashboardCtaLink
                  signedOutHref="/auth/signup?next=%2Fdashboard"
                  signedOutText="Start free"
                  className="w-full md:w-auto rounded-lg bg-white text-zinc-900 px-6 py-3 text-sm font-semibold hover:bg-zinc-100 transition-colors text-center"
                />
                <Link
                  href="/"
                  className="w-full md:w-auto rounded-lg border border-zinc-600 px-6 py-3 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors text-center"
                >
                  Back to home
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

