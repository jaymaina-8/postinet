-- Extend user_profile with select-to-answer onboarding metadata.
-- Idempotent: safe to run multiple times.

-- 1) Add columns (preferred: extend user_profile)
alter table if exists public.user_profile
  add column if not exists onboarding_complete boolean not null default false,
  add column if not exists onboarding_platforms text[] not null default '{}'::text[],
  add column if not exists onboarding_frequency text null,
  add column if not exists onboarding_goal text null,
  add column if not exists onboarding_creation_style text null,
  add column if not exists onboarding_testing boolean not null default false,
  add column if not exists onboarding_completed_at timestamptz null,
  add column if not exists updated_at timestamptz not null default now();

-- Back-compat: if legacy onboarded exists, map it forward (do not overwrite true -> false)
update public.user_profile
set onboarding_complete = true,
    updated_at = now()
where onboarded = true and onboarding_complete = false;

-- 2) updated_at auto-update trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'trg_user_profile_updated_at'
  ) then
    create trigger trg_user_profile_updated_at
    before update on public.user_profile
    for each row
    execute function public.set_updated_at();
  end if;
end
$$;

