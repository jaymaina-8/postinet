-- Migration: YouTube MVP + scheduler constraints (idempotent)

-- Platform accounts (YouTube + future platforms)
create table if not exists platform_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  platform text not null,
  platform_account_id text not null,
  display_name text,
  refresh_token text,
  access_token text,
  token_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists platform_accounts_user_platform_account_idx
  on platform_accounts (user_id, platform, platform_account_id);

alter table if exists platform_accounts enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'platform_accounts' and policyname = 'Own platform accounts access'
  ) then
    create policy "Own platform accounts access"
      on platform_accounts
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end
$$;

-- Posts: YouTube-ready scheduler fields
alter table if exists posts
  add column if not exists platform text;

alter table if exists posts
  add column if not exists platform_account_id text;

alter table if exists posts
  add column if not exists media_type text;

alter table if exists posts
  add column if not exists title text;

alter table if exists posts
  add column if not exists description text;

alter table if exists posts
  add column if not exists visibility text;

alter table if exists posts
  add column if not exists status text default 'draft';

alter table if exists posts
  add column if not exists published_once boolean default false;

alter table if exists posts
  add column if not exists published_at timestamptz;

alter table if exists posts
  add column if not exists provider_post_id text;

alter table if exists posts
  add column if not exists error_message text;

alter table if exists posts
  add column if not exists updated_at timestamptz default now();

-- Connected accounts: add updated_at for schema cache stability
alter table if exists connected_accounts
  add column if not exists updated_at timestamptz default now();

-- Scheduled posts: ensure updated_at exists (legacy table)
alter table if exists scheduled_posts
  add column if not exists updated_at timestamptz default now();

-- Status constraints
alter table if exists posts
  drop constraint if exists posts_status_check;

alter table if exists posts
  add constraint posts_status_check
  check (status in ('draft', 'uploading', 'scheduled', 'publishing', 'published', 'failed', 'cancelled'));

alter table if exists scheduled_posts
  drop constraint if exists scheduled_posts_status_check;

alter table if exists scheduled_posts
  add constraint scheduled_posts_status_check
  check (status in ('draft', 'uploading', 'scheduled', 'publishing', 'published', 'failed', 'cancelled'));

alter table if exists posts
  drop constraint if exists posts_published_once_check;

alter table if exists posts
  add constraint posts_published_once_check
  check (published_once = false or status = 'published');

-- Index for cron selection
create index if not exists posts_platform_status_scheduled_idx
  on posts (platform, status, scheduled_at);

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_posts') then
    create trigger set_updated_at_posts
      before update on posts
      for each row execute function public.set_updated_at();
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_platform_accounts') then
    create trigger set_updated_at_platform_accounts
      before update on platform_accounts
      for each row execute function public.set_updated_at();
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_connected_accounts') then
    create trigger set_updated_at_connected_accounts
      before update on connected_accounts
      for each row execute function public.set_updated_at();
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_scheduled_posts') then
    create trigger set_updated_at_scheduled_posts
      before update on scheduled_posts
      for each row execute function public.set_updated_at();
  end if;
end
$$;
