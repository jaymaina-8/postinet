"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

/**
 * Admin area: only users with user_profile.is_admin = true can access.
 * Not linked from the main app; access via direct URL /admin.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.replace("/auth/login");
          return;
        }
        const { data: profile, error: profileError } = await supabase
          .from("user_profile")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (profileError || !profile) {
          router.replace("/dashboard");
          return;
        }
        const isAdmin = (profile as { is_admin?: boolean }).is_admin === true;
        if (!isAdmin) {
          router.replace("/dashboard");
          return;
        }
        setAllowed(true);
      } catch {
        router.replace("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        <span className="animate-pulse">Loading…</span>
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="text-sm font-semibold text-white hover:text-emerald-400 transition-colors"
            >
              Admin
            </Link>
            <nav className="flex items-center gap-3">
              <Link
                href="/admin/feature-requests"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/admin/feature-requests"
                    ? "text-emerald-400"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Feature requests
              </Link>
            </nav>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-zinc-400 hover:text-zinc-200"
          >
            Back to app
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}
