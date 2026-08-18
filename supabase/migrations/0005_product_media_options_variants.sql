-- ============================================================
-- 0005_product_media_options_variants.sql
-- Product images, options, option values, variants and the
-- variant<->option-value junction. Also the storefront
-- catalogue search function used for filtering, sorting and
-- pagination fully inside the database.
-- ============================================================

-- ------------------------------------------------------------
-- Images
-- ------------------------------------------------------------

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text,
  alt_text text,
  display_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (product_id, storage_path)
);

create index if not exists idx_product_images_product_id on public.product_images (product_id);

-- ------------------------------------------------------------
-- Options and option values
-- ------------------------------------------------------------

create table if not exists public.product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null,
  display_order integer not null default 0,
  unique (product_id, name)
);

create index if not exists idx_product_options_product_id on public.product_options (product_id);

create table if not exists public.product_option_values (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.product_options (id) on delete cascade,
  value text not null,
  display_order integer not null default 0,
  unique (option_id, value)
);

create index if not exists idx_product_option_values_option_id on public.product_option_values (option_id);

-- ------------------------------------------------------------
-- Variants
-- ------------------------------------------------------------

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text unique,
  title text not null,
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 0 check (low_stock_threshold >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_product_variants_product_id on public.product_variants (product_id);
create index if not exists idx_product_variants_low_stock
  on public.product_variants (stock_quantity)
  where stock_quantity <= low_stock_threshold;

create trigger trg_product_variants_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

-- Junction: which option values compose each variant
-- e.g. variant "Black / Size 39" -> Colour:Black, Size:39.
create table if not exists public.variant_option_values (
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  option_value_id uuid not null references public.product_option_values (id) on delete cascade,
  primary key (variant_id, option_value_id)
);

create index if not exists idx_variant_option_values_value_id on public.variant_option_values (option_value_id);

-- ------------------------------------------------------------
-- Row Level Security
-- Public read access is scoped to published, active products.
-- ------------------------------------------------------------

alter table public.product_images enable row level security;
alter table public.product_options enable row level security;
alter table public.product_option_values enable row level security;
alter table public.product_variants enable row level security;
alter table public.variant_option_values enable row level security;

create policy "product_images_select_published"
  on public.product_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_images.product_id
        and (p.status = 'active' and (p.published_at is null or p.published_at <= now()))
    )
    or public.is_staff()
  );

create policy "product_options_select_published"
  on public.product_options for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_options.product_id
        and (p.status = 'active' and (p.published_at is null or p.published_at <= now()))
    )
    or public.is_staff()
  );

create policy "product_option_values_select_published"
  on public.product_option_values for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.product_options po
      join public.products p on p.id = po.product_id
      where po.id = product_option_values.option_id
        and (p.status = 'active' and (p.published_at is null or p.published_at <= now()))
    )
    or public.is_staff()
  );

create policy "product_variants_select_published"
  on public.product_variants for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_variants.product_id
        and (p.status = 'active' and (p.published_at is null or p.published_at <= now()))
    )
    or public.is_staff()
  );

create policy "variant_option_values_select_published"
  on public.variant_option_values for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.product_variants pv
      join public.products p on p.id = pv.product_id
      where pv.id = variant_option_values.variant_id
        and (p.status = 'active' and (p.published_at is null or p.published_at <= now()))
    )
    or public.is_staff()
  );

-- Staff-only writes (images are managed via the admin uploader).
create policy "product_images_insert_staff"
  on public.product_images for insert
  to authenticated
  with check (public.is_staff());

create policy "product_images_update_staff"
  on public.product_images for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "product_images_delete_staff"
  on public.product_images for delete
  to authenticated
  using (public.is_staff());

create policy "product_options_insert_staff"
  on public.product_options for insert
  to authenticated
  with check (public.is_staff());

create policy "product_options_update_staff"
  on public.product_options for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "product_options_delete_staff"
  on public.product_options for delete
  to authenticated
  using (public.is_staff());

create policy "product_option_values_insert_staff"
  on public.product_option_values for insert
  to authenticated
  with check (public.is_staff());

create policy "product_option_values_update_staff"
  on public.product_option_values for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "product_option_values_delete_staff"
  on public.product_option_values for delete
  to authenticated
  using (public.is_staff());

create policy "product_variants_insert_staff"
  on public.product_variants for insert
  to authenticated
  with check (public.is_staff());

create policy "product_variants_update_staff"
  on public.product_variants for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "product_variants_delete_staff"
  on public.product_variants for delete
  to authenticated
  using (public.is_staff());

create policy "variant_option_values_insert_staff"
  on public.variant_option_values for insert
  to authenticated
  with check (public.is_staff());

create policy "variant_option_values_delete_staff"
  on public.variant_option_values for delete
  to authenticated
  using (public.is_staff());

-- ------------------------------------------------------------
-- Storefront catalogue search.
-- Filtering, sorting and pagination happen in the database —
-- the browser never downloads the full catalogue. All inputs
-- are bound parameters (no dynamic SQL string building).
-- `security definer` bypasses RLS; the function itself only
-- ever returns published, active products.
-- ------------------------------------------------------------

create or replace function public.search_products(
  p_category_slug text default null,
  p_subcategory_slug text default null,
  p_search text default null,
  p_colours text[] default null,
  p_sizes text[] default null,
  p_min_price integer default null,
  p_max_price integer default null,
  p_on_sale boolean default null,
  p_is_new boolean default null,
  p_is_featured boolean default null,
  p_sort text default 'featured',
  p_page integer default 1,
  p_page_size integer default 24
)
returns table (product jsonb, total_count bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_offset integer;
  v_search text;
begin
  p_page := greatest(coalesce(p_page, 1), 1);
  p_page_size := least(greatest(coalesce(p_page_size, 24), 1), 48);
  v_offset := (p_page - 1) * p_page_size;
  -- Escape LIKE wildcards so user input is matched literally.
  v_search := nullif(
    replace(replace(replace(trim(coalesce(p_search, '')), '\', '\\'), '%', '\%'), '_', '\_'),
    ''
  );

  return query
  with filtered as (
    select p.*, c.slug as category_slug
    from public.products p
    join public.categories c on c.id = p.category_id and c.is_active = true
    where p.status = 'active'
      and (p.published_at is null or p.published_at <= now())
      -- Category chip: matches the category itself or a child of it.
      and (
        p_category_slug is null
        or c.slug = p_category_slug
        or exists (
          select 1 from public.categories par
          where par.id = c.parent_id and par.slug = p_category_slug
        )
      )
      and (p_subcategory_slug is null or c.slug = p_subcategory_slug)
      and (
        v_search is null
        or p.name ilike '%' || v_search || '%'
        or coalesce(p.description, '') ilike '%' || v_search || '%'
        or coalesce(p.sku, '') ilike '%' || v_search || '%'
        or coalesce(p.brand, '') ilike '%' || v_search || '%'
        or c.name ilike '%' || v_search || '%'
      )
      and (p_on_sale is null or (p_on_sale and p.compare_at_price is not null and p.compare_at_price > p.base_price))
      and (p_is_new is null or p.is_new_arrival = p_is_new)
      and (p_is_featured is null or p.is_featured = p_is_featured)
      and (p_min_price is null or p.base_price >= p_min_price)
      and (p_max_price is null or p.base_price <= p_max_price)
      and (
        p_colours is null
        or exists (
          select 1
          from public.product_options po
          join public.product_option_values pov on pov.option_id = po.id
          where po.product_id = p.id
            and lower(po.name) = 'colour'
            and pov.value = any (p_colours)
        )
      )
      and (
        p_sizes is null
        or exists (
          select 1
          from public.product_options po
          join public.product_option_values pov on pov.option_id = po.id
          where po.product_id = p.id
            and lower(po.name) <> 'colour'
            and pov.value = any (p_sizes)
        )
      )
  )
  select
    jsonb_build_object(
      'id', f.id,
      'name', f.name,
      'slug', f.slug,
      'sku', f.sku,
      'short_description', f.short_description,
      'description', f.description,
      'brand', f.brand,
      'base_price', f.base_price,
      'compare_at_price', f.compare_at_price,
      'is_featured', f.is_featured,
      'is_new_arrival', f.is_new_arrival,
      'is_bestseller', f.is_bestseller,
      'is_limited', f.is_limited,
      'track_inventory', f.track_inventory,
      'created_at', f.created_at,
      'published_at', f.published_at,
      'category', jsonb_build_object(
        'id', cat.id,
        'name', cat.name,
        'slug', cat.slug,
        'parent', case
          when par.id is null then null
          else jsonb_build_object('id', par.id, 'name', par.name, 'slug', par.slug)
        end
      ),
      'images', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', i.id,
            'storage_path', i.storage_path,
            'alt_text', i.alt_text,
            'is_primary', i.is_primary
          ) order by i.is_primary desc, i.display_order
        )
        from public.product_images i
        where i.product_id = f.id
      ), '[]'::jsonb),
      'options', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', o.id,
            'name', o.name,
            'values', (
              select coalesce(jsonb_agg(
                jsonb_build_object('id', ov.id, 'value', ov.value)
                order by ov.display_order
              ), '[]'::jsonb)
              from public.product_option_values ov
              where ov.option_id = o.id
            )
          ) order by o.display_order
        )
        from public.product_options o
        where o.product_id = f.id
      ), '[]'::jsonb),
      'variants', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', va.id,
            'sku', va.sku,
            'title', va.title,
            'price', va.price,
            'compare_at_price', va.compare_at_price,
            'stock_quantity', va.stock_quantity,
            'is_active', va.is_active,
            'option_values', (
              select coalesce(jsonb_agg(
                jsonb_build_object('option_name', o2.name, 'value', ov2.value)
              ), '[]'::jsonb)
              from public.variant_option_values vov
              join public.product_option_values ov2 on ov2.id = vov.option_value_id
              join public.product_options o2 on o2.id = ov2.option_id
              where vov.variant_id = va.id
            )
          ) order by va.created_at
        )
        from public.product_variants va
        where va.product_id = f.id and va.is_active = true
      ), '[]'::jsonb)
    ) as product,
    count(*) over () as total_count
  from filtered f
  join public.categories cat on cat.id = f.category_id
  left join public.categories par on par.id = cat.parent_id
  order by
    case when p_sort = 'price-asc' then f.base_price end asc nulls last,
    case when p_sort = 'price-desc' then f.base_price end desc nulls last,
    case when p_sort = 'featured' and f.is_featured then 0 else 1 end asc,
    case when p_sort = 'best-selling' and f.is_bestseller then 0 else 1 end asc,
    case when p_sort = 'newest' then coalesce(f.published_at, f.created_at) end desc nulls last,
    f.created_at desc
  limit p_page_size
  offset v_offset;
end;
$$;

revoke all on function public.search_products(text, text, text, text[], text[], integer, integer, boolean, boolean, boolean, text, integer, integer) from public;
grant execute on function public.search_products(text, text, text, text[], text[], integer, integer, boolean, boolean, boolean, text, integer, integer) to anon, authenticated;
