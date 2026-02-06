"use client";

import React, { ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import supabase from "@/lib/supabaseClient";
import { usePathname, useRouter } from "next/navigation";
import { PageScopeIndicator, PageScopeProvider } from "@/components/PageScope";

const sidebarLinks = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/dashboard/create", label: "Create", icon: "create" },
  { href: "/dashboard/calendar", label: "Calendar", icon: "calendar" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "analytics" },
  { href: "/dashboard/accounts", label: "Social Accounts", icon: "accounts" },
  { href: "/dashboard/assets", label: "Assets", icon: "assets" },
  { href: "/dashboard/settings", label: "Settings", icon: "settings" },
];

function SidebarIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "home":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5z" />
        </svg>
      );
    case "create":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      );
    case "calendar":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v3m8-3v3M4 9h16M6 6h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
        </svg>
      );
    case "analytics":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5m6 14V9m6 10V3m4 18H2" />
        </svg>
      );
    case "accounts":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 11a4 4 0 1 1 8 0m-9 9a6 6 0 0 1 12 0" />
        </svg>
      );
    case "assets":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4zM4 10l4-4 4 4 4-4 4 4" />
        </svg>
      );
    case "settings":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h2m12 0h2M6 6l1.5 1.5m9-1.5L18 7.5M6 18l1.5-1.5m9 1.5L18 16.5" />
        </svg>
      );
    default:
      return null;
  }
}

function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const activeHref = useMemo(() => {
    const match = sidebarLinks.find((link) => pathname === link.href || pathname.startsWith(`${link.href}/`));
    return match?.href ?? "/dashboard";
  }, [pathname]);

  return (
    <aside
      className={`bg-zinc-950 border-r border-zinc-900 min-h-screen px-3 py-6 flex flex-col gap-6 transition-all ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between px-2">
        <div className="font-semibold tracking-wide text-zinc-100">
          {collapsed ? "P" : "POSTINET"}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="text-zinc-500 hover:text-zinc-200 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h16" />
          </svg>
        </button>
      </div>
      <nav className="flex flex-col gap-1">
        {sidebarLinks.map((link) => {
          const isActive = link.href === activeHref;
          return (
            <Link
              href={link.href}
              key={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
              }`}
            >
              <SidebarIcon name={link.icon} className="h-4 w-4" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-400">
          {collapsed ? "Creator" : "Creator-grade publishing"}
        </div>
      </div>
    </aside>
  );
}

function Navbar() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser()
      .then(({ data, error }) => {
        if (error) {
          console.warn('Failed to get user:', error);
          return;
        }
        setUserEmail(data?.user?.email || null);
      })
      .catch((error) => {
        console.warn('Error fetching user:', error);
      });
  }, []);
  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if signOut fails
      router.push("/auth/login");
    }
  }
  return (
    <header className="w-full h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur flex items-center px-6 justify-between">
      <div className="text-sm text-zinc-500">Creator Command</div>
      <div className="flex items-center gap-3">
        <span className="text-zinc-400 text-sm">{userEmail || "user@email.com"}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
        >
          Logout
        </Button>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        // Wait for session to be fully loaded before checking auth
        // This prevents premature redirects during OAuth callback hydration
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.warn('Session check error:', sessionError);
        }

        // If no session, check if user exists (might be during OAuth callback)
        if (!session) {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError || !user) {
            console.warn('Auth check failed - no session or user:', userError);
            router.push("/auth/login");
            return;
          }
          // User exists but no session - wait a bit for session hydration
          // This can happen during OAuth callback before cookies are set
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (!retrySession) {
            router.push("/auth/login");
            return;
          }
        }
        
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          console.warn('Auth check failed:', error);
          router.push("/auth/login");
          return;
        }
        
        // Check onboarding status
        const { data: profile, error: profileError } = await supabase
          .from("user_profile")
          .select("onboarded")
          .eq("id", user.id)
          .single();
        
        if (profileError) {
          console.warn('Profile fetch error:', profileError);
          // If profile doesn't exist, redirect to onboarding
          router.push("/onboarding");
          return;
        }
        
        if (!profile?.onboarded) {
          router.push("/onboarding");
          return;
        }
        
        setIsAuthenticated(true);
        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push("/auth/login");
      }
    }
    
    checkAuth();
  }, [router]);

  // CRITICAL: Never redirect during loading - wait for session hydration
  // This prevents redirects during OAuth callback before session is restored
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-zinc-400">
        <div className="animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  // Only redirect if we've confirmed no authentication after loading completes
  if (!isAuthenticated) {
    return null;
  }

  return (
    <PageScopeProvider>
      <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-0">
          <Navbar />
          <main className="flex-1 min-h-0 bg-zinc-950 p-6 overflow-auto">
            <PageScopeIndicator />
            {children}
          </main>
        </div>
      </div>
    </PageScopeProvider>
  );
}
