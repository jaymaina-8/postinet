-- USER PROFILE
create table if not exists user_profile (
  id uuid references auth.users(id) primary key,
  niche text,
  content_goals text,
  tone text,
  frequency text,
  audience text,
  competitors text,
  onboarded boolean default false,
  created_at timestamptz default now()
);

alter table if exists user_profile enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'user_profile' and policyname = 'Own profile access'
  ) then
    create policy "Own profile access"
      on user_profile
      for all
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end
$$;

-- CONNECTED ACCOUNTS
create table if not exists connected_accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  platform text not null, -- 'twitter'
  access_token text not null,
  refresh_token text,
  platform_user_id text,
  platform_username text,
  expires_at bigint,
  created_at timestamptz default now()
);

create unique index if not exists connected_accounts_user_platform_idx
  on connected_accounts (user_id, platform);

alter table if exists connected_accounts enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'connected_accounts' and policyname = 'Own connected account access'
  ) then
    create policy "Own connected account access"
      on connected_accounts
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end
$$;

-- POSTS
create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  content text,
  media_url text,
  ai_caption text,
  ai_hashtags text,
  scheduled_at timestamptz,
  posted_at timestamptz,
  platform_post_id text,
  metrics jsonb,
  created_at timestamptz default now()
);

alter table if exists posts enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'posts' and policyname = 'Own posts access'
  ) then
    create policy "Own posts access"
      on posts
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end
$$;

-- TEMPLATES
create table if not exists templates (
  id serial primary key,
  title text not null,
  prompt text not null
);

alter table if exists templates enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'templates' and policyname = 'Templates readable to all'
  ) then
    create policy "Templates readable to all"
      on templates
      for select
      using (true);
  end if;
end
$$;

