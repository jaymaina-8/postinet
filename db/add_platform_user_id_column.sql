-- Migration: Add platform_user_id column to connected_accounts if missing
alter table if exists connected_accounts
  add column if not exists platform_user_id text;
