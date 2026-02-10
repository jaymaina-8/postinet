"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import supabase from "@/lib/supabaseClient";
import { Logo } from "@/components/Logo";

/**
 * Minimal top nav: Logo | How it works, Pricing, Login | Start free (or My dashboard if signed in).
 * Mobile: hamburger → menu sheet.
 */
export function LandingNav() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setSignedIn(!!session));
    return () => subscription?.unsubscribe();
  }, []);

  const links = (
    <>
      <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors" onClick={() => setOpen(false)}>
        How it works
      </a>
      <Link href="/pricing" className="text-sm text-zinc-400 hover:text-white transition-colors" onClick={() => setOpen(false)}>
        Pricing
      </Link>
      {signedIn ? (
        <Link
          href="/dashboard"
          className="text-sm bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-400 transition-colors"
          onClick={() => setOpen(false)}
        >
          My dashboard
        </Link>
      ) : (
        <>
          <Link href="/auth/login" className="text-sm text-zinc-400 hover:text-white transition-colors" onClick={() => setOpen(false)}>
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-400 transition-colors"
            onClick={() => setOpen(false)}
          >
            Start free
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Logo showName />
        </Link>

        <nav className="hidden md:flex items-center gap-6" aria-label="Main">
          {links}
        </nav>

        <button
          type="button"
          className="md:hidden p-2 text-zinc-400 hover:text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div className="md:hidden absolute top-14 left-0 right-0 border-b border-white/5 bg-[#0a0a0a] py-4 px-4 flex flex-col gap-3">
          <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white py-2" onClick={() => setOpen(false)}>
            How it works
          </a>
          <Link href="/pricing" className="text-sm text-zinc-400 hover:text-white py-2" onClick={() => setOpen(false)}>
            Pricing
          </Link>
          {signedIn ? (
            <Link href="/dashboard" className="text-sm bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-medium text-center w-full" onClick={() => setOpen(false)}>
              My dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-zinc-400 hover:text-white py-2" onClick={() => setOpen(false)}>
                Login
              </Link>
              <Link href="/auth/signup" className="text-sm bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-medium text-center w-full" onClick={() => setOpen(false)}>
                Start free
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
