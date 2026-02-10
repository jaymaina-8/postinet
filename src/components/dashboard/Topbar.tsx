"use client";

/**
 * Topbar: logo + hamburger (mobile). Logout and user email live in Profile page and drawer footer.
 */
import Link from "next/link";

export default function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-900 bg-zinc-950/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-2 text-zinc-200 hover:bg-zinc-800 lg:hidden"
            aria-label="Open navigation"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/dashboard" className="text-sm font-semibold tracking-[0.2em] text-zinc-200 hover:text-white">
            POSTINET
          </Link>
        </div>
      </div>
    </header>
  );
}
