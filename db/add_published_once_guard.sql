-- Migration: Add published_once guard for posts
alter table posts
  add column if not exists published_once boolean default false;

alter table posts
  add column if not exists published_at timestamptz;
