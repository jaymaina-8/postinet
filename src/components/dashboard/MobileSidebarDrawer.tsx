"use client";

import { useEffect, useRef } from "react";

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
    <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        ref={panelRef}
        className="relative h-full w-72 bg-zinc-950 border-r border-zinc-900 shadow-xl"
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
        <div className="h-full">{children}</div>
      </div>
    </div>
  );
}
