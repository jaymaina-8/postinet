"use client";

/**
 * Help page: short FAQ + Contact support. Uses dashboard shell (layout.tsx).
 */
import Link from "next/link";

const faqs = [
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
];

export default function HelpPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-white">Help</h1>
        <p className="text-zinc-400 text-sm mt-1">Answers to common questions.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5"
          >
            <h2 className="text-base font-semibold text-white">{item.q}</h2>
            <p className="text-sm text-zinc-400 mt-2">{item.a}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5">
        <h2 className="text-base font-semibold text-white">Contact support</h2>
        <p className="text-sm text-zinc-400 mt-2">
          Need more help?{" "}
          <a
            href="mailto:support@postinet.com"
            className="text-emerald-400 hover:text-emerald-300 underline"
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
