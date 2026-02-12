"use client";

/**
 * Dashboard composition map:
 * - This layout: auth check, PageScopeProvider, Topbar, Sidebar (desktop lg), MobileSidebarDrawer (mobile), main content.
 * - BottomNav: mobile-only, fixed bottom (see components/dashboard/BottomNav.tsx).
 * - Home: src/app/dashboard/page.tsx. Other routes: dashboard/{create,schedule,history,accounts,profile,settings,help,billing}/page.tsx.
 */
import React, { ReactNode, useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { usePathname, useRouter } from "next/navigation";
import { PageScopeProvider } from "@/components/PageScope";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import MobileSidebarDrawer from "@/components/dashboard/MobileSidebarDrawer";
import BottomNav from "@/components/dashboard/BottomNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
          .select("onboarding_complete,onboarding_testing,onboarding_platforms,onboarded")
          .eq("id", user.id)
          .single();
        
        if (profileError) {
          console.warn('Profile fetch error:', profileError);
          // If profile doesn't exist, redirect to onboarding
          router.push("/onboarding");
          return;
        }
        
        const onboardingComplete = (profile as any)?.onboarding_complete ?? (profile as any)?.onboarded ?? false;
        if (!onboardingComplete) {
          router.push("/onboarding");
          return;
        }

        // Enforce: selected platform(s) but no connected accounts (avoid loops; allow accounts page)
        const onboardingTesting = (profile as any)?.onboarding_testing ?? false;
        const selectedPlatforms: string[] = Array.isArray((profile as any)?.onboarding_platforms)
          ? (profile as any).onboarding_platforms
          : [];
        const enforceable = selectedPlatforms.filter((p) => p === "facebook" || p === "youtube");
        const onAccountsPage = pathname?.startsWith("/dashboard/accounts");

        if (!onAccountsPage && !onboardingTesting && enforceable.length > 0) {
          const [{ data: fbRows }, { data: ytRows }] = await Promise.all([
            enforceable.includes("facebook")
              ? supabase
                  .from("connected_accounts")
                  .select("id, facebook_page_access_token")
                  .eq("user_id", user.id)
                  .eq("platform", "facebook")
              : Promise.resolve({ data: [] as any[] }),
            enforceable.includes("youtube")
              ? supabase
                  .from("platform_accounts")
                  .select("id")
                  .eq("user_id", user.id)
                  .eq("platform", "youtube")
              : Promise.resolve({ data: [] as any[] }),
          ]);

          const fbConnected = (fbRows || []).some((r: any) => r.facebook_page_access_token != null);
          const ytConnected = (ytRows || []).length > 0;
          const hasAny = fbConnected || ytConnected;

          if (!hasAny) {
            router.push("/dashboard/accounts?onboarding=1");
            return;
          }
        }
        
        setIsAuthenticated(true);
        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push("/auth/login");
      }
    }
    
    checkAuth();
  }, [router, pathname]);

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
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <Topbar onOpenSidebar={() => setMobileNavOpen(true)} />
        <div className="flex min-h-[calc(100vh-56px)]">
          <div className="hidden lg:block">
            <Sidebar />
          </div>
          <MobileSidebarDrawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)}>
            <Sidebar onNavigate={() => setMobileNavOpen(false)} />
          </MobileSidebarDrawer>
          <main className="flex-1 overflow-auto px-4 pt-2 pb-20 sm:px-6 lg:px-8 lg:pb-6">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </PageScopeProvider>
  );
}
