-- Add is_admin to user_profile. Only admins can access /admin.
alter table if exists public.user_profile
  add column if not exists is_admin boolean not null default false;

comment on column public.user_profile.is_admin is 'When true, user can access /admin (feature requests, etc.).';
