"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import supabase from "@/lib/supabaseClient";

/** Hero and final CTAs: "My dashboard" when signed in, else "Get Started" + "Log in". */
export function HeroCTAs() {
  const [signedIn, setSignedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setSignedIn(!!session));
    return () => subscription?.unsubscribe();
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 h-14">
        <div className="w-40 h-12 rounded-full bg-white/10 animate-pulse" />
        <div className="w-40 h-12 rounded-full bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (signedIn) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/dashboard"
          className="w-full sm:w-auto bg-linear-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/25"
        >
          My Dashboard
        </Link>
        <Link
          href="/how-it-works"
          className="w-full sm:w-auto text-gray-300 hover:text-white px-8 py-4 rounded-full font-medium text-lg border border-white/20 hover:border-white/40 transition-colors"
        >
          See how it works
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/auth/signup"
          className="w-full sm:w-auto bg-linear-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/25 text-center"
        >
          Get started free
        </Link>
        <Link
          href="/auth/login"
          className="w-full sm:w-auto text-gray-300 hover:text-white px-8 py-4 rounded-full font-medium text-lg border border-white/20 hover:border-white/40 transition-colors text-center"
        >
          Log in
        </Link>
      </div>
      <p className="text-center">
        <Link href="/how-it-works" className="text-sm text-gray-500 hover:text-gray-400 transition-colors">
          See how it works
        </Link>
      </p>
    </div>
  );
}

/** Bottom CTA block: same logic for signed-in vs not. */
export function FinalCTA() {
  const [signedIn, setSignedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setSignedIn(!!session));
    return () => subscription?.unsubscribe();
  }, []);

  if (!mounted) {
    return (
      <div className="h-12 w-48 mx-auto rounded-full bg-white/10 animate-pulse" />
    );
  }

  if (signedIn) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/dashboard"
        className="inline-block bg-linear-to-r from-emerald-500 to-emerald-600 text-white px-10 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/25"
        >
          My Dashboard
        </Link>
        <Link
          href="/pricing"
          className="inline-block text-gray-300 hover:text-white px-8 py-3 rounded-full font-medium border border-white/20 hover:border-white/40 transition-colors"
        >
          View pricing
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <Link
        href="/auth/signup"
        className="inline-block bg-linear-to-r from-emerald-500 to-emerald-600 text-white px-10 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/25"
      >
        Get started free
      </Link>
      <Link
        href="/auth/login"
        className="inline-block text-gray-300 hover:text-white px-8 py-3 rounded-full font-medium border border-white/20 hover:border-white/40 transition-colors"
      >
        Log in
      </Link>
    </div>
  );
}
