-- One-time scheduler schema alignment (idempotent)
-- Run in Supabase SQL Editor to match the new cron scheduler contract.

alter table if exists scheduled_posts
  add column if not exists status text default 'scheduled';

alter table if exists scheduled_posts
  add column if not exists scheduled_at timestamptz;

alter table if exists scheduled_posts
  add column if not exists published_once boolean default false;

alter table if exists scheduled_posts
  add column if not exists published_at timestamptz;

alter table if exists scheduled_posts
  add column if not exists created_at timestamptz default now();

alter table if exists scheduled_posts
  add column if not exists updated_at timestamptz default now();

alter table if exists scheduled_posts
  drop constraint if exists scheduled_posts_status_check;

alter table if exists scheduled_posts
  add constraint scheduled_posts_status_check
  check (status in ('draft', 'scheduled', 'publishing', 'published', 'cancelled', 'failed'));

alter table if exists posts
  drop constraint if exists posts_status_check;

alter table if exists posts
  add constraint posts_status_check
  check (status in ('draft', 'scheduled', 'publishing', 'published', 'cancelled', 'failed'));

-- Normalize legacy data so cron eligibility works immediately.
update scheduled_posts
set published_once = false
where published_once is null;

update scheduled_posts
set status = 'scheduled'
where status in ('pending');
