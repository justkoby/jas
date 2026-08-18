-- ============================================================
-- 0008_commerce_settings.sql
-- Discount codes, delivery methods, newsletter subscribers.
-- Monetary values are integer Ghana PESEWAS.
-- Percentage discount values are whole percentages (10 = 10%).
-- ============================================================

-- ------------------------------------------------------------
-- Discount codes
-- ------------------------------------------------------------

create table if not exists public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code)),
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value integer not null check (discount_value > 0),
  minimum_order_amount integer not null default 0 check (minimum_order_amount >= 0),
  maximum_discount_amount integer check (maximum_discount_amount >= 0),
  usage_limit integer check (usage_limit > 0),
  usage_count integer not null default 0 check (usage_count >= 0),
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Percentage discounts are capped at 100%.
  check (discount_type <> 'percentage' or discount_value <= 100)
);

create trigger trg_discount_codes_updated_at
  before update on public.discount_codes
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Delivery methods — fees/thresholds editable without code.
-- ------------------------------------------------------------

create table if not exists public.delivery_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  description text,
  fee integer not null default 0 check (fee >= 0),
  free_delivery_threshold integer check (free_delivery_threshold >= 0),
  estimated_duration text,
  is_active boolean not null default true,
  display_order integer not null default 0
);

create index if not exists idx_delivery_methods_display_order on public.delivery_methods (display_order);

-- ------------------------------------------------------------
-- Newsletter subscribers — no duplicate emails.
-- ------------------------------------------------------------

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  source text not null default 'homepage',
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

-- ------------------------------------------------------------
-- Row Level Security
-- Delivery methods are publicly readable while active.
-- Discounts and subscribers are validated server-side only.
-- ------------------------------------------------------------

alter table public.discount_codes enable row level security;
alter table public.delivery_methods enable row level security;
alter table public.newsletter_subscribers enable row level security;

create policy "delivery_methods_select_active"
  on public.delivery_methods for select
  to anon, authenticated
  using (is_active = true or public.is_staff());

create policy "delivery_methods_insert_staff"
  on public.delivery_methods for insert
  to authenticated
  with check (public.is_staff());

create policy "delivery_methods_update_staff"
  on public.delivery_methods for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "delivery_methods_delete_staff"
  on public.delivery_methods for delete
  to authenticated
  using (public.is_staff());

create policy "discount_codes_select_staff"
  on public.discount_codes for select
  to authenticated
  using (public.is_staff());

create policy "discount_codes_insert_staff"
  on public.discount_codes for insert
  to authenticated
  with check (public.is_staff());

create policy "discount_codes_update_staff"
  on public.discount_codes for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "discount_codes_delete_staff"
  on public.discount_codes for delete
  to authenticated
  using (public.is_staff());

create policy "newsletter_subscribers_select_staff"
  on public.newsletter_subscribers for select
  to authenticated
  using (public.is_staff());

create policy "newsletter_subscribers_update_staff"
  on public.newsletter_subscribers for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Subscription inserts happen through a secure server action
-- (service role) so no anon insert policy is created.
