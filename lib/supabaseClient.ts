// Deprecated shim: the app code should import from `@/lib/supabaseClient` (src/)
// or from `@/lib/supabase/client` directly. This file is kept only to prevent
// accidental regressions if something imports from `/lib/*`.
export { supabase as default, supabase } from '../src/lib/supabase/client';
