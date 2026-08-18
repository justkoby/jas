-- ============================================================
-- 0009_inventory_activity.sql
-- Inventory movement history and admin activity logs.
-- ============================================================

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  movement_type text not null
    check (movement_type in ('sale', 'restock', 'adjustment', 'cancellation', 'return')),
  quantity_change integer not null,
  quantity_before integer not null check (quantity_before >= 0),
  quantity_after integer not null check (quantity_after >= 0),
  reason text,
  order_id uuid references public.orders (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_inventory_movements_variant_id on public.inventory_movements (variant_id);
create index if not exists idx_inventory_movements_order_id on public.inventory_movements (order_id);
create index if not exists idx_inventory_movements_created_at on public.inventory_movements (created_at desc);

create table if not exists public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_activity_logs_admin_id on public.admin_activity_logs (admin_id);
create index if not exists idx_admin_activity_logs_created_at on public.admin_activity_logs (created_at desc);

-- ------------------------------------------------------------
-- Row Level Security
-- Movements and logs are written only by secure server
-- operations (service role). Staff may read them.
-- ------------------------------------------------------------

alter table public.inventory_movements enable row level security;
alter table public.admin_activity_logs enable row level security;

create policy "inventory_movements_select_staff"
  on public.inventory_movements for select
  to authenticated
  using (public.is_staff());

create policy "admin_activity_logs_select_admin"
  on public.admin_activity_logs for select
  to authenticated
  using (public.is_admin());
