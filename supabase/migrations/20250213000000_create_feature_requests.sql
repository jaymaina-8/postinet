-- Feature requests table: stores ideas submitted from /feature-request page.
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor) if you use Supabase migrations separately.

create table if not exists public.feature_requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  details text,
  category text,
  votes int default 0,
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) null
);

-- Optional: allow logged-in users to see their own submissions (dashboard later).
-- For now, use the API with service role to insert; you can read from Supabase Dashboard → Table Editor.
comment on table public.feature_requests is 'User-submitted feature ideas from the feature request page.';
