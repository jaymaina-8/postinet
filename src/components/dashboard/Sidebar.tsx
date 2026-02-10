"use client";

/**
 * Dashboard nav composition: layout.tsx wraps content; Sidebar for desktop (lg+),
 * MobileSidebarDrawer + BottomNav for mobile. Primary: Home, Create, Calendar, Accounts.
 * More: History, Assets, Profile, Settings, Help, Billing.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const primaryItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/create",
    label: "Create",
    icon: (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    href: "/dashboard/schedule",
    label: "Calendar",
    icon: (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v3M16 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/accounts",
    label: "Accounts",
    icon: (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11a4 4 0 1 0-8 0M4 21a8 8 0 0 1 16 0" />
      </svg>
    ),
  },
];

const moreItems: NavItem[] = [
  { href: "/dashboard/history", label: "History", icon: <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" /></svg> },
  { href: "/dashboard/assets", label: "Assets", icon: <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg> },
  { href: "/dashboard/profile", label: "Profile", icon: <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
  { href: "/dashboard/settings", label: "Settings", icon: <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg> },
  { href: "/dashboard/help", label: "Help", icon: <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { href: "/dashboard/billing", label: "Billing", icon: <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
];

const allItems = [...primaryItems, ...moreItems];

function NavLink({
  item,
  isActive,
  onClick,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
  collapsed?: boolean;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center gap-3 ${
        isActive ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
      }`}
      title={collapsed ? item.label : undefined}
    >
      <span className="text-zinc-300">{item.icon}</span>
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const activeHref = useMemo(() => {
    const match = allItems.find((link) => pathname === link.href || pathname.startsWith(`${link.href}/`));
    return match?.href ?? "/dashboard";
  }, [pathname]);

  return (
    <aside
      className={`h-full bg-zinc-950 border-r border-zinc-900 px-4 py-6 flex flex-col gap-6 transition-all ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
          <Logo showName={!collapsed} compact={collapsed} />
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="rounded-md border border-zinc-800 p-1 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d={collapsed ? "M9 5l7 7-7 7" : "M15 5l-7 7 7 7"} />
          </svg>
        </button>
      </div>
      <nav className="flex flex-col gap-1">
        {primaryItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={item.href === activeHref}
            onClick={onNavigate}
            collapsed={collapsed}
          />
        ))}
        {!collapsed && (
          <div className="pt-2 mt-2 border-t border-zinc-800">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">More</p>
            {moreItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={item.href === activeHref}
                onClick={onNavigate}
                collapsed={collapsed}
              />
            ))}
          </div>
        )}
        {collapsed &&
          moreItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={item.href === activeHref}
              onClick={onNavigate}
              collapsed={collapsed}
            />
          ))}
      </nav>
      {!collapsed && (
        <div className="mt-auto rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-3 text-xs text-zinc-400">
          Launchpad for creator-grade publishing.
        </div>
      )}
    </aside>
  );
}
