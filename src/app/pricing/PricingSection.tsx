"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardCtaLink } from "@/components/auth/DashboardCtaLink";

// Future: plug in real plan IDs / Stripe here. No billing logic yet.
const CREATOR_MONTHLY_PRICE = 15;
const YEARLY_DISCOUNT_PCT = 0.2; // 20% off vs monthly
type BillingPeriod = "monthly" | "yearly";

interface PricingSectionProps {
  freeMonthlyPosts: number;
}

export function PricingSection({ freeMonthlyPosts }: PricingSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [billing, setBilling] = useState<BillingPeriod>("monthly");

  const creatorYearlyPrice = Math.round(CREATOR_MONTHLY_PRICE * 12 * (1 - YEARLY_DISCOUNT_PCT)); // e.g. 144
  const creatorMonthlyEquivalent = Math.round((creatorYearlyPrice / 12) * 100) / 100;
  const creatorSavings = CREATOR_MONTHLY_PRICE * 12 - creatorYearlyPrice;

  const faqs: { q: string; a: string }[] = [
    { q: "Can I cancel anytime?", a: "Yes. You can cancel whenever you want. No long-term commitment." },
    { q: "What platforms are supported?", a: "Facebook and YouTube. More may be added later." },
    { q: "Is scheduling accurate?", a: "We publish at the time you choose. Times use your account timezone." },
    { q: "What happens if a post fails?", a: "You’ll see it in your dashboard under “Needs attention.” You can fix and retry or post manually." },
    { q: "Will pricing change later?", a: "If we change prices, we’ll notify you in advance. Current subscribers may keep their rate for a period." },
  ];

  return (
    <>
      {/* Pricing cards — MVP only: Free, Creator (recommended), Team coming soon */}
      <section className="px-4 py-12 sm:px-6 lg:px-8" aria-label="Plans">
        <div className="mx-auto max-w-5xl">
          {/* Billing toggle */}
          <div className="flex items-center justify-center mb-8">
            <div
              className="inline-flex rounded-xl border border-zinc-800 bg-zinc-950/40 p-1"
              role="tablist"
              aria-label="Billing period"
            >
              <button
                type="button"
                role="tab"
                aria-selected={billing === "monthly"}
                onClick={() => setBilling("monthly")}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  billing === "monthly"
                    ? "bg-white text-zinc-900"
                    : "text-zinc-300 hover:text-white hover:bg-white/5"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={billing === "yearly"}
                onClick={() => setBilling("yearly")}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  billing === "yearly"
                    ? "bg-white text-zinc-900"
                    : "text-zinc-300 hover:text-white hover:bg-white/5"
                }`}
              >
                Yearly
                <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Free */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col">
              <h2 className="text-lg font-semibold text-white">Free</h2>
              <p className="text-sm text-zinc-400 mt-0.5">For trying Postinet AI</p>
              <p className="mt-4 text-3xl font-semibold text-white">$0</p>
              <ul className="mt-6 space-y-3 text-sm text-zinc-300">
                <li>Facebook posting</li>
                <li>YouTube posting</li>
                <li>Manual posting + scheduling</li>
                <li>Up to {freeMonthlyPosts} posts per month</li>
                <li className="text-zinc-500">Postinet AI watermark (if applicable)</li>
                <li className="text-zinc-500">Limited history</li>
              </ul>
              <DashboardCtaLink
                signedOutHref="/auth/signup?next=%2Fdashboard"
                signedOutText="Get started"
                className="mt-auto pt-6 w-full rounded-lg border border-zinc-300 bg-white py-3 text-center text-sm font-semibold text-zinc-900 hover:bg-zinc-50 transition-colors"
              />
            </div>

            {/* Creator — recommended */}
            <div className="relative rounded-2xl border-2 border-emerald-500/60 bg-zinc-900/80 p-6 flex flex-col shadow-lg shadow-emerald-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-0.5 text-xs font-semibold text-white">
                Recommended
              </div>
              <h2 className="text-lg font-semibold text-white">Creator</h2>
              <p className="text-sm text-zinc-400 mt-0.5">For consistent creators</p>
              {billing === "monthly" ? (
                <p className="mt-4 text-3xl font-semibold text-white">
                  ${CREATOR_MONTHLY_PRICE}
                  <span className="text-base font-normal text-zinc-400">/mo</span>
                </p>
              ) : (
                <div className="mt-4">
                  <p className="text-3xl font-semibold text-white">
                    ${creatorMonthlyEquivalent}
                    <span className="text-base font-normal text-zinc-400">/mo</span>
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Billed yearly at <span className="text-white font-semibold">${creatorYearlyPrice}</span> (save ${creatorSavings})
                  </p>
                </div>
              )}
              <ul className="mt-6 space-y-3 text-sm text-zinc-300">
                <li>Unlimited posts</li>
                <li>Facebook + YouTube</li>
                <li>Scheduling</li>
                <li>Bulk upload (early access)</li>
                <li>Priority posting reliability</li>
              </ul>
              <DashboardCtaLink
                signedOutHref="/auth/signup?next=%2Fdashboard%2Fbilling"
                signedOutText={billing === "yearly" ? "Upgrade (Yearly)" : "Upgrade (Monthly)"}
                signedInHref="/dashboard/billing"
                signedInText="Manage billing"
                className="mt-auto pt-6 w-full rounded-lg border border-zinc-300 bg-white py-3 text-center text-sm font-semibold text-zinc-900 hover:bg-zinc-50 transition-colors"
              />
            </div>

            {/* Team — coming soon */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 flex flex-col opacity-80">
              <h2 className="text-lg font-semibold text-zinc-400">Team / Agency</h2>
              <p className="text-sm text-zinc-500 mt-0.5">Coming soon — for teams & agencies</p>
              <p className="mt-4 text-2xl font-semibold text-zinc-500">—</p>
              <ul className="mt-6 space-y-3 text-sm text-zinc-500">
                <li>Multi-user</li>
                <li>Team workflows</li>
                <li>Coming later</li>
              </ul>
              <button
                type="button"
                disabled
                className="mt-auto pt-6 w-full rounded-lg border border-zinc-700 py-3 text-center text-sm font-medium text-zinc-500 cursor-not-allowed"
              >
                Coming soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* What you're actually paying for */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 border-t border-zinc-800/50">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-semibold text-white text-center">What you're actually paying for</h2>
          <ul className="mt-6 space-y-3 text-zinc-300 text-center sm:text-left">
            <li>Post once instead of logging into 3 platforms</li>
            <li>Never miss your posting time again</li>
            <li>No guessing if your post went live</li>
            <li>One dashboard. One flow.</li>
          </ul>
        </div>
      </section>

      {/* Trust & transparency */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 border-t border-zinc-800/50">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-semibold text-white text-center">Trust & transparency</h2>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-zinc-400">
            <li>Cancel anytime</li>
            <li>No hidden fees</li>
            <li>We don't sell your data</li>
            <li>Your accounts stay yours</li>
            <li>Built for creators, not agencies.</li>
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 border-t border-zinc-800/50">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-xl font-semibold text-white text-center">Frequently asked questions</h2>
          <div className="mt-6 space-y-2">
            {faqs.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden"
              >
                <button
                  type="button"
                  className="w-full px-4 py-3 text-left text-sm font-medium text-white flex justify-between items-center"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  {item.q}
                  <span className="text-zinc-400 shrink-0 ml-2">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-3 text-sm text-zinc-400">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 border-t border-zinc-800/50">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold text-white">Ready to simplify your posting?</h2>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <DashboardCtaLink
              signedOutHref="/auth/signup?next=%2Fdashboard"
              signedOutText="Start free"
              className="w-full sm:w-auto rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 transition-colors"
            />
            <Link
              href="/dashboard"
              className="w-full sm:w-auto rounded-lg border border-zinc-600 px-6 py-3 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
