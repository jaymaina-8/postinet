"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

/**
 * Hero: badge, headline, subtext, simple CTAs, trust line, flow strip.
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
          <p className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
            #1 SOCIAL SCHEDULING FOR CREATORS
          </p>
          <h1 className="text-[32px] sm:text-4xl md:text-5xl lg:text-[52px] font-bold tracking-tight text-white mb-4 sm:mb-5 leading-tight">
            Upload once. Schedule everywhere. Post on time.
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            Postinet AI turns one upload into scheduled posts across Facebook and YouTube, and publishes them to all your connected accounts in one click.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12 sm:mb-14">
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

        {/* Flow strip: Connect → Upload → Schedule */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-6 px-6 rounded-xl border border-zinc-800 bg-zinc-900/40">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.172-1.172a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.172 1.172a4 4 0 01-5.656 0L11.29 8.29" />
                </svg>
              </div>
              <span className="text-sm font-medium text-zinc-300">Connect accounts</span>
            </div>
            <svg className="w-4 h-4 text-zinc-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                </svg>
              </div>
              <span className="text-sm font-medium text-zinc-300">Upload once</span>
            </div>
            <svg className="w-4 h-4 text-zinc-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-zinc-300">Schedule or post now</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
