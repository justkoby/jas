-- ============================================================
-- 0001_setup.sql
-- Extensions and shared helper functions.
-- ============================================================

create extension if not exists pgcrypto;

-- Trigger function: keeps `updated_at` current on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
