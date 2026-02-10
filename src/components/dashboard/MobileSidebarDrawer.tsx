"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";
import { useDrawerUser } from "./DrawerUser";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function MobileSidebarDrawer({ open, onClose, children }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex="0"]'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        ref={panelRef}
        className="relative flex h-full w-72 flex-col bg-zinc-950 border-r border-zinc-900 shadow-xl"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-900">
          <span className="text-xs font-semibold tracking-[0.2em] text-zinc-200">POSTINET</span>
          <button
            type="button"
            onClick={onClose}
            ref={closeRef}
            className="rounded-lg border border-zinc-800 px-2 py-1 text-xs text-zinc-200 hover:border-zinc-600"
            aria-label="Close navigation"
          >
            Close
          </button>
        </div>
        <div className="flex-1 overflow-auto">{children}</div>
        <DrawerFooter onClose={onClose} />
      </div>
    </div>
  );
}

function DrawerFooter({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { email } = useDrawerUser();

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      onClose();
      router.push("/auth/login");
    } catch (e) {
      console.error("Logout error:", e);
      router.push("/auth/login");
    }
  }

  return (
    <div className="border-t border-zinc-900 p-4 space-y-2">
      {email && (
        <p className="text-xs text-zinc-500 truncate" title={email}>
          {email}
        </p>
      )}
      <div className="flex gap-2">
        <Link
          href="/dashboard/profile"
          onClick={onClose}
          className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-zinc-600"
        >
          Profile
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-zinc-600"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
