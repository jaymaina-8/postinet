import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { LandingFooter } from "@/components/landing";
import { PricingSection } from "./PricingSection";

export const metadata: Metadata = {
  title: "Pricing | Postinet AI",
  description: "Simple pricing for creators. Upload once, schedule everywhere.",
};

// Configurable for later; no billing logic yet.
const FREE_MONTHLY_POSTS = 15;

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      {/* Hero — value first, no pricing in hero */}
      <section className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            Simple pricing for creators who just want to post.
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Upload once. Schedule everywhere. No surprises.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 transition-colors"
            >
              Start free
            </Link>
            <Link
              href="/#how-it-works"
              className="w-full sm:w-auto rounded-lg border border-zinc-600 px-6 py-3 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing cards + What you're paying for + Trust + FAQ + Final CTA */}
      <PricingSection freeMonthlyPosts={FREE_MONTHLY_POSTS} />

      <LandingFooter />
    </div>
  );
}
