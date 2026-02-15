import type { Metadata } from "next";
import Link from "next/link";
import { LandingNav, LandingFooter, ContactAccordion } from "@/components/landing";

export const metadata: Metadata = {
  title: "Contact us | Postinet AI",
  description: "Get in touch with Postinet. Support, business plans, and affiliate inquiries.",
};

const CONTACT_ITEMS = [
  {
    title: "Already have an account?",
    content: (
      <>
        Log in to your Postinet account to contact support and manage your
        connected accounts.{" "}
        <Link href="/auth/login">Log in</Link>. You can also{" "}
        <Link href="/auth/signup">get started with Postinet</Link>.
      </>
    ),
  },
  {
    title: "Don't have an account or have trouble logging in?",
    content: (
      <>
        We're here to help. <a href="mailto:support@postinet.pro">Contact us</a>{" "}
        and we'll get back to you as soon as we can.
      </>
    ),
  },
  {
    title: "Curious about our business plan?",
    content: (
      <>
        For teams and organizations that need more seats, priority support, or
        custom workflows,{" "}
        <a href="mailto:business@postinet.pro">contact our business sales
        team</a>.
      </>
    ),
  },
  {
    title: "Want to become our affiliate?",
    content: (
      <>
        We're building an affiliate program for creators and educators.{" "}
        <a href="mailto:affiliates@postinet.pro">Submit an affiliate request
        form</a> and we'll reach out with details.
      </>
    ),
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <LandingNav />

      <main className="pt-24 sm:pt-28 pb-20 px-4">
        <div className="mx-auto max-w-[720px] text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            Our team is here to help
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Find the best way to get in touch with us below.
          </p>
        </div>

        <div className="mt-12">
          <ContactAccordion items={CONTACT_ITEMS} />
        </div>

        {/* Promotional block */}
        <div className="mx-auto max-w-[640px] mt-12 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Schedule Facebook and YouTube in one place
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base leading-relaxed">
            Start for free—upload once, schedule or publish to both platforms,
            and see everything in one dashboard. No credit card required.
          </p>
          <div className="mt-6">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 transition-colors"
            >
              Get started free
            </Link>
          </div>
          <p className="mt-3 text-xs text-zinc-500">No credit card required.</p>
          <p className="mt-2">
            <Link
              href="/how-it-works"
              className="text-sm text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
            >
              See how it works
            </Link>
          </p>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
