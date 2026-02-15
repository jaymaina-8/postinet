"use client";

/**
 * Help Center: quick links + common topics + contact.
 * Uses dashboard shell (layout.tsx).
 */
import Link from "next/link";

const QUICK_LINKS = [
  { title: "Create a post", desc: "Upload once and schedule in minutes.", href: "/dashboard/create" },
  { title: "Calendar", desc: "See what’s going out and when.", href: "/dashboard/schedule" },
  { title: "Accounts", desc: "Connect, reconnect, and manage platforms.", href: "/dashboard/accounts" },
  { title: "History", desc: "Review what published and what needs attention.", href: "/dashboard/history" },
  { title: "Settings", desc: "Profile, preferences, and app settings.", href: "/dashboard/settings" },
  { title: "Billing", desc: "Plans, invoices, and usage.", href: "/dashboard/billing" },
] as const;

const TOPICS = [
  {
    q: "How scheduling works",
    a: "Pick a date and time when you create a post. We’ll publish it for you at that time. You can cancel or edit scheduled posts from the Calendar until they go out.",
  },
  {
    q: "Why a post can need attention",
    a: "Sometimes a post doesn’t go live because of a connection issue, permission change, or platform limit. Check your connected accounts and try again from History.",
  },
  {
    q: "How to reconnect accounts",
    a: "Go to Accounts, disconnect the account if needed, then connect again. You’ll be asked to authorize Postinet again on Facebook or YouTube.",
  },
  {
    q: "Where do I see what happened to a post?",
    a: "Use History for a timeline of outcomes, and the Calendar for upcoming scheduled posts.",
  },
] as const;

export default function HelpPage() {
  return (
    <div className="max-w-2xl mx-auto pt-4 pb-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-white">Help Center</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Quick links, common topics, and a direct line to support.
        </p>
      </div>

      {/* Quick links */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5">
        <h2 className="text-base font-semibold text-white">Quick links</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Jump straight to the place you need.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 hover:border-zinc-700 hover:bg-zinc-950/60 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-emerald-200 transition-colors">
                    {item.title}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500 leading-relaxed">
                    {item.desc}
                  </div>
                </div>
                <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors" aria-hidden>
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Common topics */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white">Common topics</h2>
          <p className="text-sm text-zinc-400 mt-1">
            The most common “how do I…?” questions.
          </p>
        </div>
        {TOPICS.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5"
          >
            <h3 className="text-sm sm:text-base font-semibold text-white">{item.q}</h3>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5">
        <h2 className="text-base font-semibold text-white">Contact support</h2>
        <p className="text-sm text-zinc-400 mt-2">
          Need more help?{" "}
          <a
            href="mailto:support@postinet.pro"
            className="text-emerald-400 hover:text-emerald-300 underline"
          >
            Contact support
          </a>
          {" "}or{" "}
          <Link href="/feature-request" className="text-emerald-400 hover:text-emerald-300 underline">
            suggest a feature
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
