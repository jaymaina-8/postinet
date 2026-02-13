"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { HeroOrbitAnimation } from "@/components/hero";

/**
 * Hero: badge, headline, subtext, simple CTAs, trust line, orbit animation.
 */
export function Hero() {
  const [signedIn, setSignedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setSignedIn(!!session));
    return () => subscription?.unsubscribe();
  }, []);

  return (
    <section className="relative pt-24 sm:pt-28 pb-16 sm:pb-20 px-4">
      <div className="mx-auto max-w-[1100px]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          {/* Copy: left on desktop, top on mobile */}
          <div className="text-center lg:text-left order-1 flex-1">
            <p className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              #1 SOCIAL SCHEDULING FOR CREATORS
            </p>
            <h1 className="text-[32px] sm:text-4xl md:text-5xl lg:text-[52px] font-bold tracking-tight text-white mb-4 sm:mb-5 leading-tight">
              Upload once. Schedule everywhere. Post on time.
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto lg:mx-0 mb-8 sm:mb-10 leading-relaxed">
              Postinet AI turns one upload into scheduled posts across Facebook and YouTube, and publishes them to all your connected accounts in one click.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-12 sm:mb-14">
              {mounted && signedIn ? (
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto rounded-lg bg-white text-zinc-900 px-6 py-3.5 text-base font-semibold hover:bg-zinc-100 transition-colors text-center"
                >
                  My dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signup"
                    className="w-full sm:w-auto rounded-lg bg-white text-zinc-900 px-6 py-3.5 text-base font-semibold hover:bg-zinc-100 transition-colors text-center"
                  >
                    Get started free
                  </Link>
                  <a
                    href="#how-it-works"
                    className="w-full sm:w-auto rounded-lg border border-zinc-600 text-zinc-300 px-6 py-3.5 text-base font-medium hover:border-zinc-500 hover:text-white transition-colors text-center"
                  >
                    See how it works
                  </a>
                </>
              )}
            </div>

            <p className="text-sm text-zinc-500">
              Connect Facebook and YouTube. Upload once. Schedule or publish in minutes.
            </p>
          </div>

          {/* Orbit animation: right on desktop, below headline on mobile */}
          <div className="order-2 shrink-0 mt-10 lg:mt-0 lg:max-w-[520px]">
            <HeroOrbitAnimation variant="dark" />
          </div>
        </div>
      </div>
    </section>
  );
}
