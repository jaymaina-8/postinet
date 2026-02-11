"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";

type AuthPageShellProps = {
  children: React.ReactNode;
  quote: string;
  authorHandle: string;
  authorAvatar?: string;
};

export function AuthPageShell({ children, quote, authorHandle, authorAvatar }: AuthPageShellProps) {
  return (
    <div className="min-h-screen flex bg-zinc-950 text-white">
      {/* Left: form */}
      <div className="flex-1 flex flex-col justify-between px-6 py-8 sm:px-10 sm:py-12 lg:px-14 lg:max-w-[480px] lg:mx-auto lg:flex-none">
        <div>
          <div className="flex items-center justify-between mb-10">
            <Link href="/" className="text-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded">
              <Logo showName />
            </Link>
            <Link
              href="/dashboard/help"
              className="text-sm text-zinc-400 hover:text-zinc-300 flex items-center gap-1.5 transition-colors"
            >
              <BookIcon className="w-4 h-4" />
              Documentation
            </Link>
          </div>
          {children}
        </div>
        <p className="text-xs text-zinc-500 mt-8">
          By continuing, you agree to Postinet&apos;s{" "}
          <Link href="/terms" className="text-zinc-400 hover:text-zinc-300 underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-zinc-400 hover:text-zinc-300 underline">Privacy Policy</Link>
          , and to receive periodic emails with updates.
        </p>
      </div>

      {/* Right: testimonial — hidden on small screens */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-zinc-900/50 border-l border-zinc-800/50 p-12">
        <div className="max-w-md">
          <span className="text-6xl text-zinc-600 font-serif leading-none select-none">&ldquo;</span>
          <blockquote className="text-xl sm:text-2xl text-zinc-200 font-medium -mt-4">
            {quote}
          </blockquote>
          <div className="flex items-center gap-3 mt-6">
            {authorAvatar ? (
              <img src={authorAvatar} alt="" className="w-10 h-10 rounded-full bg-zinc-700 object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-600/30 flex items-center justify-center text-emerald-400 font-semibold">
                {authorHandle.charAt(1).toUpperCase()}
              </div>
            )}
            <span className="text-zinc-400">{authorHandle}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}
