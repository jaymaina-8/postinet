"use client";

import { useState } from "react";

const ITEMS = [
  {
    q: "How does Postinet AI work?",
    a: "Connect your Facebook Page and YouTube channel, upload your content once, and choose when to publish. We handle posting at the right time so you don't have to. You get a clear status for every post: scheduled, published, or needs attention.",
  },
  {
    q: "Which platforms are supported?",
    a: "Right now we support Facebook and YouTube. You can schedule and publish to both from one place. We're working on more platforms—stay tuned.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. You can get started for free and see if Postinet fits your workflow. Check our Pricing page for details on plans and limits.",
  },
  {
    q: "Will my posts go out on time?",
    a: "We're built for reliability. We publish at the time you set, with automatic retries when it's safe. You'll always see the status of each post so you're never left wondering.",
  },
  {
    q: "I have more questions.",
    a: "Reach out at support@postinet.pro or use the Help center from your dashboard. We're here to help.",
  },
];

/**
 * FAQ: accordion-style "Got questions?" — builds trust and answers objections.
 */
export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-14 sm:py-20 px-4 border-t border-white/5">
      <div className="mx-auto max-w-[700px]">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
          Got questions?
        </h2>
        <div className="space-y-2">
          {ITEMS.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 py-4 px-5 text-left"
              >
                <span className="font-medium text-white text-sm sm:text-base">{item.q}</span>
                <svg
                  className={`w-5 h-5 shrink-0 text-zinc-400 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === i && (
                <div className="px-5 pb-4 pt-0">
                  <p className="text-sm text-zinc-400 leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
