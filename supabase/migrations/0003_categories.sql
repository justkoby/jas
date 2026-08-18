-- ============================================================
-- 0003_categories.sql
-- Categories with parent/subcategory support.
-- ============================================================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  parent_id uuid references public.categories (id) on delete set null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  is_homepage_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (parent_id is distinct from id)
);

create index if not exists idx_categories_parent_id on public.categories (parent_id);
create index if not exists idx_categories_is_active on public.categories (is_active);
create index if not exists idx_categories_display_order on public.categories (display_order);

create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

alter table public.categories enable row level security;

-- Public users can view only active categories.
create policy "categories_select_active"
  on public.categories for select
  to anon, authenticated
  using (is_active = true or public.is_staff());

-- Only staff/admins can manage categories.
create policy "categories_insert_staff"
  on public.categories for insert
  to authenticated
  with check (public.is_staff());

create policy "categories_update_staff"
  on public.categories for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "categories_delete_staff"
  on public.categories for delete
  to authenticated
  using (public.is_staff());
