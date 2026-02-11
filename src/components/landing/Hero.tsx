"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

/**
 * Hero: peace-of-mind story. "Post with peace of mind." One place, on time, every time.
 */
export function Hero() {
  const [signedIn, setSignedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setSignedIn(!!session));
    return () => subscription?.unsubscribe();
  }, []);

  return (
    <section className="relative pt-24 sm:pt-28 pb-16 sm:pb-20 px-4">
      <div className="mx-auto max-w-[1100px]">
        <div className="text-center">
          <p className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">
            Social scheduling that just works
          </p>
          <h1 className="text-[32px] sm:text-4xl md:text-5xl lg:text-[52px] font-bold tracking-tight text-white mb-4 sm:mb-5 leading-tight">
            Post with peace of mind.
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            One place to upload, schedule, and publish to Facebook and YouTube. Set it once—we handle the rest. No more guessing, no more missed posts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12 sm:mb-14">
            {mounted && signedIn ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto rounded-lg bg-white text-zinc-900 px-6 py-3.5 text-base font-semibold hover:bg-zinc-100 transition-colors text-center border border-white"
              >
                My dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="w-full sm:w-auto rounded-lg bg-white text-zinc-900 px-6 py-3.5 text-base font-semibold hover:bg-zinc-100 transition-colors text-center border border-white"
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

          {/* Trust line */}
          <p className="text-sm text-zinc-500">
            Connect Facebook and YouTube. Upload once. Schedule or publish in minutes.
          </p>
        </div>

        {/* Product preview */}
        <div className="relative max-w-4xl mx-auto mt-12">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-2xl overflow-hidden ring-1 ring-white/5">
            <div className="aspect-video flex items-center justify-center bg-zinc-900/80 min-h-[220px]">
              <div className="text-center px-4">
                <p className="text-zinc-500 text-sm">Your content, one calendar</p>
                <p className="text-zinc-600 text-xs mt-1">Schedule and publish without the chaos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
