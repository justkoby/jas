-- ============================================================
-- 0004_products.sql
-- Products. All monetary values are integer Ghana PESEWAS
-- (GH₵250.00 = 25000). Never floating-point cedis.
-- ============================================================

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sku text unique,
  short_description text,
  description text,
  category_id uuid references public.categories (id) on delete set null,
  brand text,
  base_price integer not null check (base_price >= 0),
  compare_at_price integer check (compare_at_price >= 0),
  cost_price integer check (cost_price >= 0),
  status text not null default 'draft'
    check (status in ('draft', 'active', 'archived')),
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  is_bestseller boolean not null default false,
  is_limited boolean not null default false,
  track_inventory boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists idx_products_status on public.products (status);
create index if not exists idx_products_category_id on public.products (category_id);
create index if not exists idx_products_is_featured on public.products (is_featured) where is_featured = true;
create index if not exists idx_products_is_new_arrival on public.products (is_new_arrival) where is_new_arrival = true;
create index if not exists idx_products_is_bestseller on public.products (is_bestseller) where is_bestseller = true;
create index if not exists idx_products_published_at on public.products (published_at desc);
create index if not exists idx_products_created_at on public.products (created_at desc);

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

alter table public.products enable row level security;

-- Public users can view only published, active products.
create policy "products_select_published"
  on public.products for select
  to anon, authenticated
  using (
    (status = 'active' and (published_at is null or published_at <= now()))
    or public.is_staff()
  );

-- Only staff/admins can manage products.
create policy "products_insert_staff"
  on public.products for insert
  to authenticated
  with check (public.is_staff());

create policy "products_update_staff"
  on public.products for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "products_delete_staff"
  on public.products for delete
  to authenticated
  using (public.is_staff());
