"use client";

// Canonical browser client lives in `src/lib/supabase/client.ts`.
// Re-export it here to avoid touching all existing imports.
import { supabase } from "@/lib/supabase/client";

export default supabase;
export { supabase };
