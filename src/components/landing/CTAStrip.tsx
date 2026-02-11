"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

/**
 * Final CTA: "Get started with Postinet AI" — peace of mind, one more nudge.
 */
export function CTAStrip() {
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
    <section className="py-14 sm:py-20 px-4 border-t border-white/5">
      <div className="mx-auto max-w-[1100px] text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Get started with Postinet AI
        </h2>
        <p className="text-zinc-400 mb-8 max-w-lg mx-auto text-sm">
          Join creators who post on schedule without the stress. No credit card required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {mounted && signedIn ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto rounded-lg bg-white text-zinc-900 px-6 py-3.5 text-base font-semibold hover:bg-zinc-100 transition-colors border border-white"
            >
              My dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto rounded-lg bg-white text-zinc-900 px-6 py-3.5 text-base font-semibold hover:bg-zinc-100 transition-colors border border-white"
              >
                Sign up - It&apos;s FREE
              </Link>
              <Link
                href="/pricing"
                className="w-full sm:w-auto rounded-lg border border-zinc-600 text-zinc-300 px-6 py-3.5 text-base font-medium hover:border-zinc-500 hover:text-white transition-colors"
              >
                See pricing
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
