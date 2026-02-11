"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Calendar route redirects to schedule (Calendar UX lives at /dashboard/schedule).
 */
export default function CalendarPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/schedule");
  }, [router]);
  return (
    <div className="max-w-6xl mx-auto pt-4 pb-8">
      <p className="text-zinc-500 text-sm">Loading…</p>
    </div>
  );
}
