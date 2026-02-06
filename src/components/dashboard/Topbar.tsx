"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser()
      .then(({ data, error }) => {
        if (error) return;
        setUserEmail(data?.user?.email || null);
      })
      .catch(() => undefined);
  }, []);

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/auth/login");
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-900 bg-zinc-950/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-2 text-zinc-200 hover:bg-zinc-800 md:hidden"
            aria-label="Open navigation"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-semibold tracking-[0.2em] text-zinc-200">POSTINET</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-zinc-400">{userEmail || "user@email.com"}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-zinc-600"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
