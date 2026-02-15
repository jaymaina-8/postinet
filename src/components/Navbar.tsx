"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import supabase from "@/lib/supabaseClient";
import { Logo } from "@/components/Logo";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setSignedIn(!!session));
    return () => subscription?.unsubscribe();
  }, []);

  const authedHref = (target: string) => (signedIn ? target : `/auth/signup?next=${encodeURIComponent(target)}`);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 w-full bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10">
      <div className="relative flex h-full w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo — left */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Logo showName />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-sm text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/features" className="text-sm text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href={authedHref("/dashboard/accounts")} className="text-sm text-gray-300 hover:text-white transition-colors">
              Platforms
            </Link>
            <Link href="/how-it-works" className="text-sm text-gray-300 hover:text-white transition-colors">
              How It Works
            </Link>
          </div>

        {/* Auth — top right */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {signedIn ? (
            <Link
              href="/dashboard"
              className="text-sm bg-linear-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              My Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-gray-300 hover:text-white transition-colors px-4 py-2 hidden md:inline"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm bg-white text-zinc-900 px-4 py-2 rounded-lg font-semibold hover:bg-zinc-100 transition-colors"
              >
                Sign up - It’s FREE
              </Link>
            </>
          )}
          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 hover:text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-14 left-0 right-0 max-h-[calc(100vh-3.5rem)] overflow-y-auto py-4 px-4 border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur-md shadow-lg">
            <div className="flex flex-col gap-4">
              <Link
                href="/pricing"
                className="text-sm text-gray-300 hover:text-white transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/features"
                className="text-sm text-gray-300 hover:text-white transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href={authedHref("/dashboard/accounts")}
                className="text-sm text-gray-300 hover:text-white transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Platforms
              </Link>
              <Link
                href="/how-it-works"
                className="text-sm text-gray-300 hover:text-white transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                {signedIn ? (
                  <Link
                    href="/dashboard"
                    className="text-sm bg-linear-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 rounded-full font-medium hover:opacity-90 transition-opacity text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="text-sm text-gray-300 hover:text-white transition-colors px-2 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="text-sm bg-white text-zinc-900 px-5 py-2.5 rounded-lg font-semibold hover:bg-zinc-100 transition-colors text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign up - It’s FREE
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
































