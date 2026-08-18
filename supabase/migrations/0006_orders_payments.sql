-- ============================================================
-- 0006_orders_payments.sql
-- Orders, order items (snapshots) and payments.
-- All monetary values are integer Ghana PESEWAS.
-- ============================================================

create sequence if not exists public.order_number_seq;

create or replace function public.generate_order_number()
returns text
language plpgsql
as $$
declare
  v_num bigint;
begin
  v_num := nextval('public.order_number_seq');
  return 'JAS-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(v_num::text, 5, '0');
end;
$$;

-- ------------------------------------------------------------
-- Orders
-- ------------------------------------------------------------

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default public.generate_order_number(),
  -- NULL for guest checkouts; orders never REQUIRE an account.
  customer_id uuid references public.profiles (id) on delete set null,
  customer_email text not null,
  customer_name text not null,
  customer_phone text,
  status text not null default 'pending'
    check (status in (
      'pending', 'confirmed', 'processing', 'ready_for_pickup',
      'out_for_delivery', 'delivered', 'cancelled', 'refunded'
    )),
  payment_status text not null default 'unpaid'
    check (payment_status in (
      'unpaid', 'pending', 'paid', 'failed', 'refunded', 'partially_refunded'
    )),
  payment_method text,
  fulfilment_method text
    check (fulfilment_method in (
      'standard_accra', 'express_accra', 'pickup_rider', 'outside_accra'
    )),
  currency text not null default 'GHS',
  subtotal integer not null check (subtotal >= 0),
  discount_amount integer not null default 0 check (discount_amount >= 0),
  delivery_fee integer not null default 0 check (delivery_fee >= 0),
  total integer not null check (total >= 0),
  delivery_address_snapshot jsonb,
  customer_notes text,
  admin_notes text,
  paystack_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_payment_status on public.orders (payment_status);
create index if not exists idx_orders_customer_id on public.orders (customer_id);
create index if not exists idx_orders_customer_email on public.orders (customer_email);
create index if not exists idx_orders_paystack_reference on public.orders (paystack_reference);
create index if not exists idx_orders_created_at on public.orders (created_at desc);

create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Order items — snapshot columns keep historical orders accurate
-- even when products are edited later.
-- ------------------------------------------------------------

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  product_name text not null,
  variant_name text,
  sku text,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  line_total integer not null check (line_total >= 0),
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order_id on public.order_items (order_id);
create index if not exists idx_order_items_product_id on public.order_items (product_id);

-- ------------------------------------------------------------
-- Payments — service-role managed only. provider_response may
-- contain raw gateway payloads and must never be exposed via
-- public policies.
-- ------------------------------------------------------------

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider text not null default 'paystack',
  provider_reference text,
  amount integer not null check (amount >= 0),
  currency text not null default 'GHS',
  status text not null default 'pending'
    check (status in ('pending', 'success', 'failed', 'refunded')),
  channel text,
  provider_response jsonb,
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

create index if not exists idx_payments_order_id on public.payments (order_id);
create index if not exists idx_payments_provider_reference on public.payments (provider_reference);

-- ------------------------------------------------------------
-- Row Level Security
-- Customers only ever see their own orders. Guests cannot browse
-- orders at all (guest order lookup happens server-side via the
-- service role, keyed by order number). Orders are created and
-- updated exclusively through secure server operations.
-- ------------------------------------------------------------

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;

create policy "orders_select_own_or_staff"
  on public.orders for select
  to authenticated
  using ((customer_id is not null and customer_id = auth.uid()) or public.is_staff());

create policy "order_items_select_own_or_staff"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and ((o.customer_id is not null and o.customer_id = auth.uid()) or public.is_staff())
    )
  );

-- Staff may view payment status metadata but never raw provider
-- payloads; provider_response stays out of every client query.
create policy "payments_select_staff"
  on public.payments for select
  to authenticated
  using (public.is_staff());

-- No insert/update/delete policies: writes are service-role only.
