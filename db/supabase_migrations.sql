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
  platform text not null,
  access_token text not null,
  refresh_token text,
  platform_user_id text,
  platform_username text,
  expires_at bigint,
  -- Facebook Page-specific fields
  facebook_page_id text,
  facebook_page_name text,
  facebook_page_access_token text,
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
  created_at timestamptz default now()
);

-- Add new columns if they don't exist (for existing tables)
alter table if exists posts 
  add column if not exists scheduled_at timestamptz;

alter table if exists posts 
  add column if not exists posted_at timestamptz;

alter table if exists posts 
  add column if not exists platform_post_id text;

alter table if exists posts 
  add column if not exists metrics jsonb;

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

-- Add new columns if they don't exist (for existing tables)
alter table if exists templates 
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table if exists templates 
  add column if not exists is_custom boolean default false;

alter table if exists templates 
  add column if not exists created_at timestamptz default now();

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
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'templates' and policyname = 'Users can insert custom templates'
  ) then
    create policy "Users can insert custom templates"
      on templates
      for insert
      with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'templates' and policyname = 'Users can update own templates'
  ) then
    create policy "Users can update own templates"
      on templates
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'templates' and policyname = 'Users can delete own templates'
  ) then
    create policy "Users can delete own templates"
      on templates
      for delete
      using (auth.uid() = user_id);
  end if;
end
$$;

-- SCHEDULED POSTS
create table if not exists scheduled_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled',
  published_once boolean default false,
  published_at timestamptz,
  platform text not null,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists scheduled_posts_user_id_idx on scheduled_posts(user_id);
create index if not exists scheduled_posts_scheduled_at_idx on scheduled_posts(scheduled_at);
create index if not exists scheduled_posts_status_idx on scheduled_posts(status);

alter table if exists scheduled_posts enable row level security;

-- Add Facebook Page columns if they don't exist (for existing tables)
alter table if exists connected_accounts 
  add column if not exists facebook_page_id text;

alter table if exists connected_accounts 
  add column if not exists facebook_page_name text;

alter table if exists connected_accounts 
  add column if not exists facebook_page_access_token text;

-- Add index for faster lookups by page ID
create index if not exists connected_accounts_facebook_page_id_idx 
  on connected_accounts(facebook_page_id) 
  where platform = 'facebook' and facebook_page_id is not null;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'scheduled_posts' and policyname = 'Own scheduled posts access'
  ) then
    create policy "Own scheduled posts access"
      on scheduled_posts
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end
$$;

