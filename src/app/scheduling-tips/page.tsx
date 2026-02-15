import type { Metadata } from "next";
import Link from "next/link";
import { LandingFooter, LandingNav, CTAStrip } from "@/components/landing";
import { DashboardCtaLink } from "@/components/auth/DashboardCtaLink";

export const metadata: Metadata = {
  title: "Scheduling tips | Postinet AI",
  description:
    "Practical scheduling tips for creators: batch your uploads, build a weekly rhythm, and stay consistent across Facebook and YouTube—without the stress.",
};

const TIPS = [
  {
    title: "Pick a weekly “schedule session” (15–30 minutes)",
    body: "Consistency isn’t willpower—it’s a ritual. Set a recurring slot (e.g. Sunday evening) where you only do two things: upload and place posts on the calendar.",
    tag: "Rhythm",
  },
  {
    title: "Batch content, then schedule in one sitting",
    body: "Record/edit in batches, then upload in batches. The calendar fills up fast when you stop context-switching.",
    tag: "Batching",
  },
  {
    title: "Use themes to avoid “what should I post?”",
    body: "Assign a theme per day: Mon = tutorial, Wed = behind-the-scenes, Fri = highlight. You’ll never stare at a blank screen again.",
    tag: "Planning",
  },
  {
    title: "Write captions like a checklist",
    body: "Hook → value → CTA. Keep a short template and reuse it. Your future self will thank you.",
    tag: "Copy",
  },
  {
    title: "Schedule for the next best time, not the perfect time",
    body: "Perfect timing is overrated. Pick a consistent time you can sustain; adjust later using what you learn.",
    tag: "Mindset",
  },
  {
    title: "Treat “needs attention” as a to‑do, not a failure",
    body: "When something needs attention it usually means reconnect permissions. Fix it once, and you’re back on track.",
    tag: "Reliability",
  },
] as const;

const MINI_TEMPLATES = [
  {
    title: "The Weekly Series",
    points: ["One repeatable format", "Same day/time each week", "Builds audience habits"],
    example: "“3 quick tips for ___” every Tuesday",
  },
  {
    title: "The Behind‑the‑Scenes Loop",
    points: ["Low effort", "High trust", "Easy to batch"],
    example: "Short clips from your process",
  },
  {
    title: "The Repurpose Stack",
    points: ["Turn 1 idea into 3 posts", "Less brainstorming", "More consistency"],
    example: "Long video → 2 short highlights + 1 quote card",
  },
] as const;

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
      {children}
    </span>
  );
}

export default function SchedulingTipsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <LandingNav />

      <main>
        {/* Hero */}
        <section className="pt-24 sm:pt-28 pb-14 px-4 border-b border-white/5">
          <div className="mx-auto max-w-[1100px]">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-2">
                <Pill>Scheduling tips</Pill>
                <Pill>Creators</Pill>
                <Pill>Facebook + YouTube</Pill>
              </div>
              <div className="max-w-3xl">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                  Consistency, without the stress.
                </h1>
                <p className="mt-5 text-zinc-400 text-base sm:text-lg leading-relaxed">
                  These tips are designed for real life. No “post 5 times a day” advice—just a repeatable system that keeps your calendar full and your brain quiet.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <DashboardCtaLink
                  signedOutHref="/auth/signup?next=%2Fdashboard"
                  signedOutText="Sign up - It’s FREE"
                  className="w-full sm:w-auto rounded-lg bg-white text-zinc-900 px-6 py-3.5 text-base font-semibold hover:bg-zinc-100 transition-colors text-center"
                />
                <Link
                  href="/how-it-works"
                  className="w-full sm:w-auto rounded-lg border border-zinc-600 text-zinc-300 px-6 py-3.5 text-base font-medium hover:border-zinc-500 hover:text-white transition-colors text-center"
                >
                  See how Postinet works
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="py-14 sm:py-18 px-4">
          <div className="mx-auto max-w-[1100px]">
            <div className="flex items-end justify-between gap-6 mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">The simple playbook</h2>
                <p className="mt-2 text-zinc-400 max-w-2xl">
                  Start with these. You don’t need all of them—just enough to make posting automatic.
                </p>
              </div>
              <Link
                href="/feature-request"
                className="hidden sm:inline-flex text-sm text-zinc-400 hover:text-white underline underline-offset-4"
              >
                Want a new guide? Request it →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TIPS.map((tip) => (
                <div
                  key={tip.title}
                  className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 hover:bg-zinc-900/55 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                      {tip.tag}
                    </span>
                    <span className="text-xs text-zinc-500">Tip</span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{tip.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{tip.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mini templates */}
        <section className="py-14 sm:py-18 px-4 border-y border-white/5">
          <div className="mx-auto max-w-[1100px]">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/80 mb-2">
              Templates
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold">Three formats you can repeat forever</h2>
            <p className="mt-3 text-zinc-400 max-w-2xl">
              The fastest way to stay consistent is to reuse a structure. Pick one and run it weekly.
            </p>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {MINI_TEMPLATES.map((t) => (
                <div key={t.title} className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6">
                  <h3 className="text-lg font-semibold text-white">{t.title}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                    {t.points.map((p) => (
                      <li key={p} className="flex gap-2">
                        <span className="text-emerald-400">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 rounded-xl border border-white/10 bg-zinc-950/40 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                      Example
                    </p>
                    <p className="text-sm text-zinc-300">{t.example}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Soft CTA */}
        <section className="py-14 sm:py-18 px-4">
          <div className="mx-auto max-w-[1100px]">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Ready to schedule your next week?
                </h2>
                <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-2xl">
                  Upload once, place posts on your calendar, and let Postinet handle on-time publishing across your platforms.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <DashboardCtaLink
                  signedOutHref="/auth/signup?next=%2Fdashboard"
                  signedOutText="Sign up - It’s FREE"
                  className="w-full md:w-auto rounded-lg bg-white text-zinc-900 px-6 py-3 text-sm font-semibold hover:bg-zinc-100 transition-colors text-center"
                />
                <Link
                  href="/help-center"
                  className="w-full md:w-auto rounded-lg border border-zinc-600 px-6 py-3 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors text-center"
                >
                  Visit Help Center
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

