"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

export function useDrawerUser(): { email: string | null } {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data?.user?.email ?? null);
    });
  }, []);

  return { email };
}
