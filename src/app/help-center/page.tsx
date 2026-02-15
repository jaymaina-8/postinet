import type { Metadata } from "next";
import Link from "next/link";
import { LandingFooter, LandingNav, CTAStrip } from "@/components/landing";
import { DashboardCtaLink } from "@/components/auth/DashboardCtaLink";

export const metadata: Metadata = {
  title: "Help Center | Postinet AI",
  description: "Guides, troubleshooting, and support for Postinet AI.",
};

const SECTIONS = [
  {
    title: "Getting started",
    desc: "The basics: connect, upload, schedule.",
    items: [
      { label: "How Postinet works", href: "/how-it-works" },
      { label: "Create your account", href: "/auth/signup" },
      { label: "See pricing", href: "/pricing" },
    ],
  },
  {
    title: "Scheduling",
    desc: "Plan content in advance with confidence.",
    items: [
      { label: "Scheduling tips", href: "/scheduling-tips" },
      { label: "What “scheduled / published / needs attention” means", href: "#statuses" },
      { label: "What to do if something needs attention", href: "#needs-attention" },
    ],
  },
  {
    title: "Accounts & connections",
    desc: "Facebook + YouTube setup and reconnection.",
    items: [
      { label: "Reconnect an account", href: "#reconnect" },
      { label: "Common permission issues", href: "#permissions" },
      { label: "Security & privacy", href: "/privacy" },
    ],
  },
  {
    title: "Support",
    desc: "Talk to a human or request features.",
    items: [
      { label: "Contact support", href: "mailto:support@postinet.pro" },
      { label: "Request a feature", href: "/feature-request" },
      { label: "Contact us", href: "/contact" },
    ],
  },
] as const;

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <LandingNav />

      <main className="pt-24 sm:pt-28 pb-16 px-4">
        <section className="mx-auto max-w-[1100px]">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/90 mb-3">
            Help Center
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Answers, guides, and quick fixes.
          </h1>
          <p className="mt-5 text-zinc-400 text-base sm:text-lg leading-relaxed max-w-2xl">
            Looking for help without jumping into the dashboard? Start here. If you’re signed in and want in-app help,
            you can also open the{" "}
              <Link href="/auth/signup?next=%2Fdashboard%2Fhelp" className="text-emerald-400 hover:text-emerald-300 underline">
                dashboard Help Center
              </Link>
            .
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <DashboardCtaLink
              signedOutHref="/auth/login?next=%2Fdashboard"
              signedOutText="Sign in"
              className="w-full sm:w-auto rounded-lg bg-white text-zinc-900 px-6 py-3.5 text-base font-semibold hover:bg-zinc-100 transition-colors text-center"
            />
            <Link
              href="/feature-request"
              className="w-full sm:w-auto rounded-lg border border-zinc-600 text-zinc-300 px-6 py-3.5 text-base font-medium hover:border-zinc-500 hover:text-white transition-colors text-center"
            >
              Request a feature
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SECTIONS.map((s) => (
            <div key={s.title} className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6">
              <h2 className="text-lg font-semibold text-white">{s.title}</h2>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
              <ul className="mt-4 space-y-2">
                {s.items.map((item) => (
                  <li key={item.label}>
                    {item.href.startsWith("mailto:") ? (
                      <a href={item.href} className="text-sm text-emerald-400 hover:text-emerald-300 underline">
                        {item.label}
                      </a>
                    ) : item.href.startsWith("#") ? (
                      <a href={item.href} className="text-sm text-emerald-400 hover:text-emerald-300 underline">
                        {item.label}
                      </a>
                    ) : (
                      <Link href={item.href} className="text-sm text-emerald-400 hover:text-emerald-300 underline">
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mx-auto max-w-[1100px] mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div id="statuses" className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6">
            <h2 className="text-xl font-semibold">Understanding post statuses</h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Postinet keeps status simple so you always know what happened.
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <div className="text-sm font-semibold text-emerald-200">Scheduled</div>
                <div className="text-sm text-emerald-100/80 mt-1">Queued and ready to publish at the time you chose.</div>
              </div>
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-4">
                <div className="text-sm font-semibold text-sky-200">Published</div>
                <div className="text-sm text-sky-100/80 mt-1">Successfully posted to the selected platform(s).</div>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4" id="needs-attention">
                <div className="text-sm font-semibold text-amber-200">Needs attention</div>
                <div className="text-sm text-amber-100/80 mt-1">
                  Something needs a quick fix—usually reconnecting an account or re-authorizing permissions.
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div id="reconnect" className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6">
              <h2 className="text-xl font-semibold">Reconnect an account</h2>
              <ol className="mt-3 space-y-2 text-sm text-zinc-300">
                <li>1) Open your dashboard and go to Accounts.</li>
                <li>2) Disconnect the affected account if needed.</li>
                <li>3) Connect again and approve permissions on Facebook/YouTube.</li>
              </ol>
              <p className="mt-3 text-sm text-zinc-400">
                Tip: If you changed your Facebook Page roles or YouTube channel permissions recently, reconnecting usually fixes it.
              </p>
            </div>

            <div id="permissions" className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6">
              <h2 className="text-xl font-semibold">Common permission issues</h2>
              <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                <li>- Your Page/Channel access changed (role removed, token expired).</li>
                <li>- You connected the wrong Facebook Page or YouTube channel.</li>
                <li>- Platform asked you to re-approve access.</li>
              </ul>
              <p className="mt-3 text-sm text-zinc-400">
                If you’re stuck, email{" "}
                <a href="mailto:support@postinet.pro" className="text-emerald-400 hover:text-emerald-300 underline">
                  support@postinet.pro
                </a>{" "}
                and tell us which platform is failing.
              </p>
            </div>
          </div>
        </section>
      </main>

      <CTAStrip />
      <LandingFooter />
    </div>
  );
}

