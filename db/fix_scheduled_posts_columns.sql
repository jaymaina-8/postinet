-- Migration: Ensure scheduled_posts has canonical scheduler columns
alter table scheduled_posts
  add column if not exists status text default 'scheduled';

alter table scheduled_posts
  add column if not exists scheduled_at timestamptz;

alter table scheduled_posts
  add column if not exists published_once boolean default false;

alter table scheduled_posts
  add column if not exists published_at timestamptz;

alter table scheduled_posts
  add column if not exists created_at timestamptz default now();

alter table scheduled_posts
  add column if not exists updated_at timestamptz default now();
