"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import supabase from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

const sidebarLinks = [
  { href: "/dashboard", label: "Create" },
  { href: "/dashboard/schedule", label: "Schedule" },
  { href: "/dashboard/history", label: "History" },
  { href: "/dashboard/templates", label: "Templates" },
];

function Sidebar() {
  return (
    <aside className="bg-zinc-50 border-r w-56 min-h-screen px-4 py-8 flex flex-col gap-8">
      <div className="font-bold text-xl text-zinc-800 mb-8">POSTINET AI</div>
      <nav className="flex flex-col gap-3">
        {sidebarLinks.map(link => (
          <Button variant="ghost" className="justify-start" asChild key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </nav>
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
    <header className="w-full h-16 border-b bg-white flex items-center px-6 justify-between">
      <div />
      <div className="flex items-center gap-2">
        <span className="text-zinc-500 text-sm">{userEmail || "user@email.com"}</span>
        <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0">
        <Navbar />
        <main className="flex-1 min-h-0 bg-zinc-100 p-4 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

