-- Migration: Add platform metadata for scheduling and publishing
alter table if exists scheduled_posts
  add column if not exists platform_account_id text;

alter table if exists scheduled_posts
  alter column status set default 'scheduled';

update scheduled_posts
  set status = 'scheduled'
where status = 'pending';

alter table if exists posts
  add column if not exists platform text;

alter table if exists posts
  add column if not exists platform_account_id text;

alter table if exists posts
  add column if not exists status text default 'draft';

update posts
  set status = case
    when posted_at is not null then 'published'
    when scheduled_at is not null then 'scheduled'
    else 'draft'
  end
where status is null or status = '';

update posts
  set platform = sp.platform
from scheduled_posts sp
where posts.id = sp.post_id
  and posts.platform is null;

update posts
  set platform_account_id = sp.platform_account_id
from scheduled_posts sp
where posts.id = sp.post_id
  and posts.platform_account_id is null;
