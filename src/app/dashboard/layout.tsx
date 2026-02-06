"use client";

import React, { ReactNode, useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { PageScopeProvider } from "@/components/PageScope";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import MobileSidebarDrawer from "@/components/dashboard/MobileSidebarDrawer";
import PageContextBar from "@/components/dashboard/PageContextBar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
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

  // Previous structure: inline Sidebar + Navbar components in this file,
  // with PageScopeIndicator inside main content.
  return (
    <PageScopeProvider>
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <Topbar onOpenSidebar={() => setMobileNavOpen(true)} />
        <div className="flex min-h-[calc(100vh-56px)]">
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <MobileSidebarDrawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)}>
            <Sidebar onNavigate={() => setMobileNavOpen(false)} />
          </MobileSidebarDrawer>
          {/* Previous structure: PageContextBar lived inside main content. */}
          <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="sticky top-16 z-10 bg-zinc-950/80 pb-4 pt-2 backdrop-blur md:static md:pb-6">
              <PageContextBar />
            </div>
            {children}
          </main>
        </div>
      </div>
    </PageScopeProvider>
  );
}
