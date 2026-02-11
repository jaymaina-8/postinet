"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import supabase from "@/lib/supabaseClient";
import { Logo } from "@/components/Logo";

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: "Schedule posts",
    desc: "Plan a week or a month in one place. Post on time, every time.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
    title: "Upload once",
    desc: "One piece of content. We publish to Facebook and YouTube for you.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Calendar view",
    desc: "See what’s going out and when. No surprises.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    title: "Multi-platform",
    desc: "Facebook and YouTube today. More platforms coming soon.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Reliable delivery",
    desc: "Clear status for every post. Retries when safe. No duplicate posts.",
  },
];

const SOLUTIONS = [
  { label: "Creators", desc: "Stay consistent without the stress. Post on schedule while you create." },
  { label: "Small business", desc: "Keep your pages active without hiring a social manager." },
  { label: "Marketers", desc: "One place to plan and publish. Less chaos, more control." },
  { label: "Content teams", desc: "Upload once, publish everywhere. Everyone stays in sync." },
];

const RESOURCE_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Help center", href: "/dashboard/help" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "mailto:support@postinet.pro" },
];

/**
 * Opus-style navbar: Logo | Features (dropdown) | Solutions (dropdown) | Resources (dropdown) | Pricing | Sign in | Sign up - It's FREE.
 */
export function LandingNav() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"features" | "solutions" | "resources" | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setSignedIn(!!session));
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const closeAll = () => {
    setActiveDropdown(null);
    setOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-sm">
      <nav ref={navRef} className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6" aria-label="Main">
        <Link href="/" className="flex items-center gap-2 shrink-0" onClick={closeAll}>
          <Logo showName />
        </Link>

        {/* Desktop: center nav with dropdowns */}
        <div className="hidden lg:flex items-center gap-1">
          <div className="relative">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === "features" ? null : "features"); }}
              className="flex items-center gap-0.5 px-3 py-2 text-sm text-zinc-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              Features
              <svg className={`w-4 h-4 transition-transform ${activeDropdown === "features" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {activeDropdown === "features" && (
              <div className="absolute top-full left-0 mt-0.5 w-[480px] rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl py-4 px-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FEATURES.map((f, i) => (
                  <a key={i} href="#how-it-works" onClick={closeAll} className="flex gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left">
                    <span className="text-emerald-400 shrink-0 mt-0.5">{f.icon}</span>
                    <div>
                      <div className="font-medium text-white text-sm">{f.title}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">{f.desc}</div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === "solutions" ? null : "solutions"); }}
              className="flex items-center gap-0.5 px-3 py-2 text-sm text-zinc-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              Solutions
              <svg className={`w-4 h-4 transition-transform ${activeDropdown === "solutions" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {activeDropdown === "solutions" && (
              <div className="absolute top-full left-0 mt-0.5 w-[320px] rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl py-3 px-3">
                {SOLUTIONS.map((s, i) => (
                  <a key={i} href="#how-it-works" onClick={closeAll} className="block py-2.5 px-3 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="font-medium text-white text-sm">{s.label}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{s.desc}</div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === "resources" ? null : "resources"); }}
              className="flex items-center gap-0.5 px-3 py-2 text-sm text-zinc-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              Resources
              <svg className={`w-4 h-4 transition-transform ${activeDropdown === "resources" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {activeDropdown === "resources" && (
              <div className="absolute top-full left-0 mt-0.5 w-[200px] rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl py-2">
                {RESOURCE_LINKS.map((r) => (
                  r.href.startsWith("#") ? (
                    <a key={r.label} href={r.href} onClick={closeAll} className="block py-2 px-4 text-sm text-zinc-300 hover:text-white hover:bg-white/5">{r.label}</a>
                  ) : (
                    <Link key={r.label} href={r.href} onClick={closeAll} className="block py-2 px-4 text-sm text-zinc-300 hover:text-white hover:bg-white/5">{r.label}</Link>
                  )
                ))}
              </div>
            )}
          </div>

          <Link href="/pricing" onClick={closeAll} className="px-3 py-2 text-sm text-zinc-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            Pricing
          </Link>
        </div>

        {/* Desktop: right actions */}
        <div className="hidden lg:flex items-center gap-3">
          {signedIn ? (
            <Link href="/dashboard" onClick={closeAll} className="text-sm text-zinc-300 hover:text-white transition-colors">
              My dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/login" onClick={closeAll} className="text-sm text-zinc-300 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                onClick={closeAll}
                className="inline-flex items-center justify-center rounded-lg border border-white bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 transition-colors"
              >
                Sign up - It&apos;s FREE
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden p-2 text-zinc-400 hover:text-white"
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
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden absolute top-14 left-0 right-0 border-b border-white/5 bg-zinc-900 py-4 px-4 max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2 mb-1">Features</div>
            {FEATURES.map((f, i) => (
              <a key={i} href="#how-it-works" onClick={closeAll} className="py-2 px-3 rounded-lg text-sm text-zinc-300 hover:bg-white/5">{f.title}</a>
            ))}
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2 mt-2 mb-1">Solutions</div>
            {SOLUTIONS.map((s, i) => (
              <a key={i} href="#how-it-works" onClick={closeAll} className="py-2 px-3 rounded-lg text-sm text-zinc-300 hover:bg-white/5">{s.label}</a>
            ))}
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2 mt-2 mb-1">Resources</div>
            {RESOURCE_LINKS.map((r) => (
              r.href.startsWith("#") ? (
                <a key={r.label} href={r.href} onClick={closeAll} className="py-2 px-3 rounded-lg text-sm text-zinc-300 hover:bg-white/5">{r.label}</a>
              ) : (
                <Link key={r.label} href={r.href} onClick={closeAll} className="py-2 px-3 rounded-lg text-sm text-zinc-300 hover:bg-white/5">{r.label}</Link>
              )
            ))}
            <Link href="/pricing" onClick={closeAll} className="py-2 px-3 rounded-lg text-sm text-zinc-300 hover:bg-white/5">Pricing</Link>
            <div className="border-t border-white/5 mt-3 pt-3 flex flex-col gap-2">
              {signedIn ? (
                <Link href="/dashboard" onClick={closeAll} className="text-sm bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-medium text-center">
                  My dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" onClick={closeAll} className="py-2 px-3 text-sm text-zinc-300">Sign in</Link>
                  <Link href="/auth/signup" onClick={closeAll} className="text-sm border border-white bg-white text-zinc-900 px-4 py-2.5 rounded-lg font-semibold text-center">
                    Sign up - It&apos;s FREE
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
