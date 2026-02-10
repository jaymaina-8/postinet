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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Logo showName />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-sm text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
            <a href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">
              Features
            </a>
            <a href="#platforms" className="text-sm text-gray-300 hover:text-white transition-colors">
              Platforms
            </a>
            <a href="#how-it-works" className="text-sm text-gray-300 hover:text-white transition-colors">
              How It Works
            </a>
          </div>

          {/* Auth: signed in → My dashboard; else → Log in + Get Started */}
          <div className="hidden md:flex items-center gap-3">
            {signedIn ? (
              <Link
                href="/dashboard"
                className="text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-5 py-2.5 rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                My dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-gray-300 hover:text-white transition-colors px-4 py-2"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-5 py-2.5 rounded-full font-medium hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

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
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-4">
              <Link
                href="/pricing"
                className="text-sm text-gray-300 hover:text-white transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <a
                href="#features"
                className="text-sm text-gray-300 hover:text-white transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#platforms"
                className="text-sm text-gray-300 hover:text-white transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Platforms
              </a>
              <a
                href="#how-it-works"
                className="text-sm text-gray-300 hover:text-white transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                {signedIn ? (
                  <Link
                    href="/dashboard"
                    className="text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-5 py-2.5 rounded-full font-medium hover:opacity-90 transition-opacity text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="text-sm text-gray-300 hover:text-white transition-colors px-2 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-5 py-2.5 rounded-full font-medium hover:opacity-90 transition-opacity text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Started
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
































