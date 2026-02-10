"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

/**
 * Hero: headline, subhead, primary/secondary CTAs, product screenshot mock.
 * Logged in → "My dashboard"; else "Start free" + "See how it works".
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
    <section className="relative pt-24 sm:pt-28 pb-12 sm:pb-16 px-4">
      <div className="mx-auto max-w-[1100px]">
        <div className="text-center">
          <h1 className="text-[32px] sm:text-4xl md:text-5xl lg:text-[56px] font-bold tracking-tight text-white mb-4 sm:mb-5">
            Upload once. Schedule everywhere.
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            Connect Facebook and YouTube, upload your content, and schedule it in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 sm:mb-12">
            {mounted && signedIn ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto rounded-lg bg-emerald-500 text-white px-6 py-3.5 text-base font-semibold hover:bg-emerald-400 transition-colors text-center"
              >
                My dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="w-full sm:w-auto rounded-lg bg-emerald-500 text-white px-6 py-3.5 text-base font-semibold hover:bg-emerald-400 transition-colors text-center"
                >
                  Start free
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
        </div>

        {/* Product screenshot mock. Add public/dashboard-preview.png and use: <img src="/dashboard-preview.png" alt="Dashboard" className="w-full h-full object-cover" /> */}
        <div className="relative max-w-4xl mx-auto">
          <div className="rounded-xl border border-white/10 bg-zinc-900/50 shadow-2xl shadow-emerald-500/10 overflow-hidden ring-1 ring-white/5">
            <div className="aspect-video flex items-center justify-center bg-zinc-900/80 min-h-[200px]">
              {/* Optional: <img src="/dashboard-preview.png" alt="Postinet dashboard" className="w-full h-full object-cover" /> */}
              <div className="text-center px-4">
                <p className="text-zinc-500 text-sm">Dashboard preview</p>
                <p className="text-zinc-600 text-xs mt-1">One place to upload, schedule, and post</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
