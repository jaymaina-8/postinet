-- Migration: Add missing scheduled_posts columns
alter table scheduled_posts
  add column if not exists created_at timestamptz default now();

alter table scheduled_posts
  add column if not exists updated_at timestamptz default now();

alter table scheduled_posts
  add column if not exists published_once boolean default false;

alter table scheduled_posts
  add column if not exists published_at timestamptz;
