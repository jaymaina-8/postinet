-- Migration: Fix status CHECK constraints for scheduling
alter table scheduled_posts
  drop constraint if exists scheduled_posts_status_check;

alter table scheduled_posts
  add constraint scheduled_posts_status_check
  check (status in ('draft', 'scheduled', 'publishing', 'published', 'failed'));

alter table posts
  drop constraint if exists posts_status_check;

alter table posts
  add constraint posts_status_check
  check (status in ('draft', 'scheduled', 'publishing', 'published', 'failed'));
