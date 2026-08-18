import { Product } from "@/types";
import { DbProduct, DbProductVariant } from "@/types/database";
import { mockProducts } from "@/data/products";
import { createAnonClient } from "@/lib/supabase/anon";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ghsToPesewas } from "@/lib/format/money";
import { mapDbProduct } from "@/lib/storefront/map-product";

// Simulates a short delay to mimic a network request (mock fallback only)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ProductFilterOptions {
  category?: string;
  subcategory?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  isSale?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  sortBy?: "featured" | "newest" | "price-low-high" | "price-high-low" | "best-selling";
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
}

const SORT_TO_DB: Record<NonNullable<ProductFilterOptions["sortBy"]>, string> = {
  featured: "featured",
  newest: "newest",
  "price-low-high": "price-asc",
  "price-high-low": "price-desc",
  "best-selling": "best-selling",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ------------------------------------------------------------
// Database queries (used when Supabase is configured)
// ------------------------------------------------------------

async function dbSearchProducts(
  options: ProductFilterOptions,
  page = 1,
  pageSize = 24
): Promise<PaginatedProducts> {
  const supabase = createAnonClient();

  const isSaleCategory = options.category?.toLowerCase() === "sale";
  const categorySlug =
    options.category && options.category.toLowerCase() !== "all" && !isSaleCategory
      ? options.category
      : null;

  const { data, error } = await supabase.rpc("search_products", {
    p_category_slug: categorySlug,
    p_subcategory_slug: options.subcategory ? slugify(options.subcategory) : null,
    p_search: options.search?.trim() || null,
    p_colours: options.colors && options.colors.length > 0 ? options.colors : null,
    p_sizes: options.sizes && options.sizes.length > 0 ? options.sizes : null,
    p_min_price: options.minPrice !== undefined ? ghsToPesewas(options.minPrice) : null,
    p_max_price: options.maxPrice !== undefined ? ghsToPesewas(options.maxPrice) : null,
    p_on_sale: isSaleCategory || options.isSale ? true : null,
    p_is_new: options.isNew ?? null,
    p_is_featured: options.isFeatured ?? null,
    p_sort: SORT_TO_DB[options.sortBy ?? "featured"],
    p_page: page,
    p_page_size: pageSize,
  });

  if (error) {
    console.error("search_products failed:", error.message);
    return { items: [], total: 0 };
  }

  const rows = (data ?? []) as { product: DbProduct; total_count: number }[];
  return {
    items: rows.map((row) => mapDbProduct(row.product)),
    total: rows[0]?.total_count ?? 0,
  };
}

async function dbGetProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createAnonClient();

  // RLS restricts the public to active, published products.
  const { data: product, error: productError } = await supabase
    .from("products")
    .select(
      "*, category:categories(id, name, slug, parent:categories!parent_id(id, name, slug))"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (productError || !product) return null;

  const [{ data: images }, { data: options }, { data: variants }] =
    await Promise.all([
      supabase
        .from("product_images")
        .select("id, storage_path, alt_text, is_primary, display_order")
        .eq("product_id", product.id)
        .order("is_primary", { ascending: false })
        .order("display_order"),
      supabase
        .from("product_options")
        .select("id, name, display_order")
        .eq("product_id", product.id)
        .order("display_order"),
      supabase
        .from("product_variants")
        .select("id, sku, title, price, compare_at_price, stock_quantity, is_active, created_at")
        .eq("product_id", product.id)
        .eq("is_active", true)
        .order("created_at"),
    ]);

  // Option values for every option of this product.
  const optionIds = (options ?? []).map((o) => o.id);
  const { data: optionValues } =
    optionIds.length > 0
      ? await supabase
          .from("product_option_values")
          .select("id, option_id, value, display_order")
          .in("option_id", optionIds)
          .order("display_order")
      : { data: [] };

  // Junction rows resolve each variant's composing option values.
  const variantIds = (variants ?? []).map((v) => v.id);
  const { data: junctionRows } =
    variantIds.length > 0
      ? await supabase
          .from("variant_option_values")
          .select(
            "variant_id, option_value:product_option_values(value, option:product_options(name))"
          )
          .in("variant_id", variantIds)
      : { data: [] };

  const valuesByOption = new Map<string, { id: string; value: string }[]>();
  for (const value of optionValues ?? []) {
    const list = valuesByOption.get(value.option_id) ?? [];
    list.push({ id: value.id, value: value.value });
    valuesByOption.set(value.option_id, list);
  }

  const junctionByVariant = new Map<string, { option_name: string; value: string }[]>();
  // PostgREST returns the many-to-one embeds as objects at runtime;
  // the generated types infer arrays, so cast to the real shape.
  const junctionData = (junctionRows ?? []) as unknown as {
    variant_id: string;
    option_value: { value: string; option: { name: string } } | null;
  }[];
  for (const row of junctionData) {
    const list = junctionByVariant.get(row.variant_id) ?? [];
    list.push({
      option_name: row.option_value?.option?.name ?? "",
      value: row.option_value?.value ?? "",
    });
    junctionByVariant.set(row.variant_id, list);
  }

  const dbProduct: DbProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    short_description: product.short_description,
    description: product.description,
    brand: product.brand,
    base_price: product.base_price,
    compare_at_price: product.compare_at_price,
    is_featured: product.is_featured,
    is_new_arrival: product.is_new_arrival,
    is_bestseller: product.is_bestseller,
    is_limited: product.is_limited,
    track_inventory: product.track_inventory,
    created_at: product.created_at,
    published_at: product.published_at,
    category: product.category,
    images: images ?? [],
    options: (options ?? []).map((o) => ({
      id: o.id,
      name: o.name,
      values: valuesByOption.get(o.id) ?? [],
    })),
    variants: (variants ?? []).map(
      (v): DbProductVariant => ({
        id: v.id,
        sku: v.sku,
        title: v.title,
        price: v.price,
        compare_at_price: v.compare_at_price,
        stock_quantity: v.stock_quantity,
        is_active: v.is_active,
        option_values: junctionByVariant.get(v.id) ?? [],
      })
    ),
  };

  return mapDbProduct(dbProduct);
}

// ------------------------------------------------------------
// Mock fallback (identical behaviour to the original service)
// ------------------------------------------------------------

function mockFilterProducts(options: ProductFilterOptions): Product[] {
  let products = [...mockProducts];

  if (options.category && options.category.toLowerCase() !== "all") {
    if (options.category.toLowerCase() === "sale") {
      products = products.filter((p) => p.isSale);
    } else {
      products = products.filter((p) => p.category.toLowerCase() === options.category?.toLowerCase());
    }
  }

  if (options.subcategory) {
    products = products.filter((p) => p.subcategory.toLowerCase() === options.subcategory?.toLowerCase());
  }

  if (options.search) {
    const searchLower = options.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.subcategory.toLowerCase().includes(searchLower)
    );
  }

  if (options.minPrice !== undefined) {
    products = products.filter((p) => p.price >= (options.minPrice ?? 0));
  }

  if (options.maxPrice !== undefined) {
    products = products.filter((p) => p.price <= (options.maxPrice ?? Infinity));
  }

  if (options.colors && options.colors.length > 0) {
    products = products.filter((p) =>
      p.colors.some((color) => options.colors?.includes(color.name))
    );
  }

  if (options.sizes && options.sizes.length > 0) {
    products = products.filter((p) =>
      p.sizes?.some((size) => options.sizes?.includes(size))
    );
  }

  if (options.isSale !== undefined) {
    products = products.filter((p) => p.isSale === options.isSale);
  }

  if (options.isNew !== undefined) {
    products = products.filter((p) => p.isNew === options.isNew);
  }

  if (options.isFeatured !== undefined) {
    products = products.filter((p) => p.isFeatured === options.isFeatured);
  }

  if (options.sortBy) {
    switch (options.sortBy) {
      case "newest":
        products.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case "price-low-high":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        products.sort((a, b) => b.price - a.price);
        break;
      case "best-selling":
        products.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "featured":
      default:
        products.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }
  }

  return products;
}

// ------------------------------------------------------------
// Public API (same exports as before, DB-first with mock fallback)
// ------------------------------------------------------------

export async function getProducts(options: ProductFilterOptions = {}): Promise<Product[]> {
  if (isSupabaseConfigured()) {
    const { items } = await dbSearchProducts(options, 1, 48);
    return items;
  }
  await delay(200);
  return mockFilterProducts(options);
}

/** Paginated catalogue query used by the shop/category pages. */
export async function getPaginatedProducts(
  options: ProductFilterOptions = {},
  page = 1,
  pageSize = 12
): Promise<PaginatedProducts> {
  if (isSupabaseConfigured()) {
    return dbSearchProducts(options, page, pageSize);
  }
  await delay(200);
  const filtered = mockFilterProducts(options);
  const start = (page - 1) * pageSize;
  return { items: filtered.slice(start, start + pageSize), total: filtered.length };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isSupabaseConfigured()) {
    return dbGetProductBySlug(slug);
  }
  await delay(150);
  return mockProducts.find((p) => p.slug === slug) || null;
}

export async function getProductById(id: string): Promise<Product | null> {
  if (isSupabaseConfigured()) {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from("products")
      .select("slug")
      .eq("id", id)
      .maybeSingle();
    if (!data) return null;
    return dbGetProductBySlug(data.slug);
  }
  await delay(100);
  return mockProducts.find((p) => p.id === id) || null;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await getProducts({ isFeatured: true });
  return products.slice(0, limit);
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const products = await getProducts({ isNew: true });
  return products.slice(0, limit);
}

export async function getSaleProducts(limit = 8): Promise<Product[]> {
  const products = await getProducts({ isSale: true });
  return products.slice(0, limit);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  if (isSupabaseConfigured()) {
    const sameCategory = await dbSearchProducts({ category: product.category }, 1, limit + 1);
    let related = sameCategory.items.filter((p) => p.id !== product.id);
    if (related.length < limit) {
      const fill = await dbSearchProducts({}, 1, limit + 1);
      const extra = fill.items.filter(
        (p) => p.id !== product.id && !related.some((r) => r.id === p.id)
      );
      related = [...related, ...extra];
    }
    return related.slice(0, limit);
  }
  await delay(150);
  const related = mockProducts.filter((p) => p.category === product.category && p.id !== product.id);
  if (related.length === 0) {
    return mockProducts.filter((p) => p.id !== product.id).slice(0, limit);
  }
  return related.slice(0, limit);
}

/** Debounced search suggestions (parameterised ilike inside the RPC). */
export async function getSearchSuggestions(
  query: string,
  limit = 8
): Promise<Product[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  if (isSupabaseConfigured()) {
    const { items } = await dbSearchProducts({ search: trimmed }, 1, limit);
    return items;
  }
  await delay(120);
  return mockFilterProducts({ search: trimmed }).slice(0, limit);
}

export async function getCategoriesWithCount(): Promise<{ name: string; count: number }[]> {
  if (isSupabaseConfigured()) {
    const supabase = createAnonClient();
    const { data: categories } = await supabase
      .from("categories")
      .select("slug")
      .is("parent_id", null)
      .eq("is_active", true)
      .order("display_order");

    const counts = await Promise.all(
      (categories ?? [])
        .filter((c) => c.slug !== "sale")
        .map(async (c) => {
          const { total } = await dbSearchProducts({ category: c.slug }, 1, 1);
          return { name: c.slug, count: total };
        })
    );
    return counts;
  }

  const categoriesMap: Record<string, number> = {};
  mockProducts.forEach((p) => {
    categoriesMap[p.category] = (categoriesMap[p.category] || 0) + 1;
  });
  return Object.keys(categoriesMap).map((cat) => ({
    name: cat,
    count: categoriesMap[cat],
  }));
}
