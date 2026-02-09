-- Migration: Add YouTube processing status fields (idempotent)

alter table if exists posts
  add column if not exists youtube_video_id text;

alter table if exists posts
  add column if not exists yt_upload_status text;

alter table if exists posts
  add column if not exists yt_processing_status text;

alter table if exists posts
  add column if not exists yt_failure_reason text;

alter table if exists posts
  add column if not exists yt_last_checked_at timestamptz;

alter table if exists posts
  add column if not exists yt_upload_type text;

-- Allow published_once during publishing/processing
alter table if exists posts
  drop constraint if exists posts_published_once_check;

alter table if exists posts
  add constraint posts_published_once_check
  check (published_once = false or status in ('publishing', 'published'));

-- Backfill YouTube video id where possible
update posts
set youtube_video_id = provider_post_id
where platform = 'youtube'
  and youtube_video_id is null
  and provider_post_id is not null;

create index if not exists posts_youtube_processing_idx
  on posts (platform, yt_processing_status, yt_last_checked_at);
