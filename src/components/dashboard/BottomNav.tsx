"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Mobile-only bottom navigation. Used at <768px.
 * Dashboard composition: layout.tsx renders this; main content in page.tsx.
 */
const tabs = [
  { href: "/dashboard", label: "Home", icon: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" },
  { href: "/dashboard/create", label: "Create", icon: "M12 5v14M5 12h14" },
  { href: "/dashboard/schedule", label: "Calendar", icon: "M8 3v3M16 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" },
  { href: "/dashboard/accounts", label: "Accounts", icon: "M16 11a4 4 0 1 0-8 0M4 21a8 8 0 0 1 16 0" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-zinc-900 bg-zinc-950/95 backdrop-blur pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Main navigation"
    >
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors ${
              isActive ? "text-emerald-400" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={tab.icon} />
            </svg>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
