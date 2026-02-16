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

type AuthState = "loading" | "authed" | "unauthed";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        // Hydration-safe: do not redirect until we've given session restoration time.
        setAuthState("loading");

        let {
          data: { session },
        } = await supabase.auth.getSession();

        // Retry a couple times (OAuth callback → dashboard can race cookie/session restoration)
        if (!session) {
          await new Promise((r) => setTimeout(r, 300));
          const retry1 = await supabase.auth.getSession();
          session = retry1.data.session;
        }
        if (!session) {
          await new Promise((r) => setTimeout(r, 500));
          const retry2 = await supabase.auth.getSession();
          session = retry2.data.session;
        }

        if (!session) {
          if (!cancelled) setAuthState("unauthed");
          return;
        }

        const user = session.user;

        // Check onboarding status
        const { data: profile, error: profileError } = await supabase
          .from("user_profile")
          .select("onboarding_complete,onboarding_testing,onboarding_platforms,onboarded")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.warn("Profile fetch error:", profileError);
          router.replace("/onboarding");
          return;
        }

        const onboardingComplete =
          (profile as any)?.onboarding_complete ?? (profile as any)?.onboarded ?? false;
        if (!onboardingComplete) {
          router.replace("/onboarding");
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

          const fbConnected = (fbRows || []).some(
            (r: any) => r.facebook_page_access_token != null
          );
          const ytConnected = (ytRows || []).length > 0;
          const hasAny = fbConnected || ytConnected;

          if (!hasAny) {
            router.replace("/dashboard/accounts?onboarding=1");
            return;
          }
        }

        if (!cancelled) setAuthState("authed");
      } catch (error) {
        console.error("Auth check error:", error);
        if (!cancelled) setAuthState("unauthed");
      }
    }

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, [router, pathname]);

  useEffect(() => {
    if (authState !== "unauthed") return;
    router.replace("/auth/login");
  }, [authState, router]);

  // CRITICAL: Never redirect during loading - wait for session hydration
  // This prevents redirects during OAuth callback before session is restored
  if (authState === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-zinc-400">
        <div className="animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  // Only redirect if we've confirmed no authentication after loading completes
  if (authState !== "authed") {
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
