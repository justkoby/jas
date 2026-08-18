-- ============================================================
-- 0007_customers_wishlist.sql
-- Customer addresses and database-backed wishlists.
-- ============================================================

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  label text,
  recipient_name text not null,
  phone text,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  region text,
  digital_address text,
  delivery_notes text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_customer_addresses_customer_id on public.customer_addresses (customer_id);

create trigger trg_customer_addresses_updated_at
  before update on public.customer_addresses
  for each row execute function public.set_updated_at();

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (customer_id, product_id)
);

create index if not exists idx_wishlist_items_customer_id on public.wishlist_items (customer_id);
create index if not exists idx_wishlist_items_product_id on public.wishlist_items (product_id);

-- ------------------------------------------------------------
-- Row Level Security — customers manage only their own rows.
-- ------------------------------------------------------------

alter table public.customer_addresses enable row level security;
alter table public.wishlist_items enable row level security;

create policy "customer_addresses_all_own"
  on public.customer_addresses for all
  to authenticated
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

create policy "wishlist_items_select_own"
  on public.wishlist_items for select
  to authenticated
  using (customer_id = auth.uid());

create policy "wishlist_items_insert_own"
  on public.wishlist_items for insert
  to authenticated
  with check (customer_id = auth.uid());

create policy "wishlist_items_delete_own"
  on public.wishlist_items for delete
  to authenticated
  using (customer_id = auth.uid());
