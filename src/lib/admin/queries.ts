import { createClient } from "@/lib/supabase/server";
import {
  AdminProductRow,
  DbCategoryRow,
  DbDiscountCode,
  DbDeliveryMethod,
  DbOrder,
  DbOrderItem,
  DbPayment,
  DbProductImage,
  DbProductOption,
  DbProductVariant,
  DbProfileRow,
  DbSubscriber,
} from "@/types/database";

/**
 * Staff-scoped admin reads. Uses the cookie server client so Row
 * Level Security (staff policies) applies; nothing here bypasses RLS.
 */

export const ADMIN_PAGE_SIZE = 20;

// ------------------------------------------------------------
// Products
// ------------------------------------------------------------

export interface AdminProductListParams {
  q?: string;
  status?: "all" | "draft" | "active" | "archived";
  page?: number;
}

type RawAdminProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  status: AdminProductRow["status"];
  base_price: number;
  compare_at_price: number | null;
  is_featured: boolean;
  is_new_arrival: boolean;
  updated_at: string;
  category: AdminProductRow["category"];
  variants: { stock_quantity: number; is_active: boolean }[];
  images: { storage_path: string | null; is_primary: boolean; display_order: number }[];
};

export async function adminListProducts(
  params: AdminProductListParams = {}
): Promise<{ rows: AdminProductRow[]; total: number }> {
  const supabase = createClient();
  const page = Math.max(1, params.page ?? 1);
  const from = (page - 1) * ADMIN_PAGE_SIZE;
  const to = from + ADMIN_PAGE_SIZE - 1;

  let query = supabase
    .from("products")
    .select(
      `id, name, slug, sku, status, base_price, compare_at_price,
       is_featured, is_new_arrival, updated_at,
       category:categories(id, name, slug, parent:categories!parent_id(id, name, slug)),
       variants:product_variants(stock_quantity, is_active),
       images:product_images(storage_path, is_primary, display_order)`,
      { count: "exact" }
    )
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (params.q?.trim()) {
    query = query.ilike("name", `%${params.q.trim()}%`);
  }
  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("adminListProducts failed:", error.message);
    return { rows: [], total: 0 };
  }

  const rows = (data as unknown as RawAdminProduct[]).map((row) => {
    const primary =
      row.images.find((i) => i.is_primary && i.storage_path) ??
      [...row.images]
        .sort((a, b) => a.display_order - b.display_order)
        .find((i) => i.storage_path);
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      sku: row.sku,
      status: row.status,
      base_price: row.base_price,
      compare_at_price: row.compare_at_price,
      is_featured: row.is_featured,
      is_new_arrival: row.is_new_arrival,
      updated_at: row.updated_at,
      total_stock: row.variants
        .filter((v) => v.is_active)
        .reduce((sum, v) => sum + v.stock_quantity, 0),
      primary_image: primary?.storage_path ?? null,
      category: row.category,
    };
  });

  return { rows, total: count ?? 0 };
}

export interface AdminProductAggregate {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string | null;
    short_description: string | null;
    description: string | null;
    brand: string | null;
    base_price: number;
    compare_at_price: number | null;
    cost_price: number | null;
    status: AdminProductRow["status"];
    is_featured: boolean;
    is_new_arrival: boolean;
    is_bestseller: boolean;
    is_limited: boolean;
    track_inventory: boolean;
    seo_title: string | null;
    seo_description: string | null;
    category_id: string | null;
  };
  images: DbProductImage[];
  options: DbProductOption[];
  variants: DbProductVariant[];
}

/** Full product aggregate for the edit form (includes inactive variants). */
export async function adminGetProduct(
  id: string
): Promise<AdminProductAggregate | null> {
  const supabase = createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(
      `id, name, slug, sku, short_description, description, brand,
       base_price, compare_at_price, cost_price, status,
       is_featured, is_new_arrival, is_bestseller, is_limited,
       track_inventory, seo_title, seo_description, category_id`
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !product) return null;

  const [{ data: images }, { data: options }, { data: variants }] =
    await Promise.all([
      supabase
        .from("product_images")
        .select("id, storage_path, alt_text, is_primary, display_order")
        .eq("product_id", id)
        .order("is_primary", { ascending: false })
        .order("display_order"),
      supabase
        .from("product_options")
        .select("id, name, display_order")
        .eq("product_id", id)
        .order("display_order"),
      supabase
        .from("product_variants")
        .select("id, sku, title, price, compare_at_price, stock_quantity, is_active, created_at")
        .eq("product_id", id)
        .order("created_at"),
    ]);

  const optionIds = (options ?? []).map((o) => o.id);
  const { data: optionValues } =
    optionIds.length > 0
      ? await supabase
          .from("product_option_values")
          .select("id, option_id, value, display_order")
          .in("option_id", optionIds)
          .order("display_order")
      : { data: [] };

  const variantIds = (variants ?? []).map((v) => v.id);
  const { data: junctionRows } =
    variantIds.length > 0
      ? await supabase
          .from("variant_option_values")
          .select("variant_id, option_value:product_option_values(value, option:product_options(name))")
          .in("variant_id", variantIds)
      : { data: [] };

  const valuesByOption = new Map<string, { id: string; value: string }[]>();
  for (const value of optionValues ?? []) {
    const list = valuesByOption.get(value.option_id) ?? [];
    list.push({ id: value.id, value: value.value });
    valuesByOption.set(value.option_id, list);
  }

  const junctionData = (junctionRows ?? []) as unknown as {
    variant_id: string;
    option_value: { value: string; option: { name: string } } | null;
  }[];
  const junctionByVariant = new Map<string, { option_name: string; value: string }[]>();
  for (const row of junctionData) {
    const list = junctionByVariant.get(row.variant_id) ?? [];
    list.push({
      option_name: row.option_value?.option?.name ?? "",
      value: row.option_value?.value ?? "",
    });
    junctionByVariant.set(row.variant_id, list);
  }

  return {
    product,
    images: (images ?? []) as DbProductImage[],
    options: (options ?? []).map((o) => ({
      id: o.id,
      name: o.name,
      values: valuesByOption.get(o.id) ?? [],
    })),
    variants: (variants ?? []).map((v) => ({
      id: v.id,
      sku: v.sku,
      title: v.title,
      price: v.price,
      compare_at_price: v.compare_at_price,
      stock_quantity: v.stock_quantity,
      is_active: v.is_active,
      option_values: junctionByVariant.get(v.id) ?? [],
    })),
  };
}

// ------------------------------------------------------------
// Categories
// ------------------------------------------------------------

export async function adminCategoryRows(): Promise<DbCategoryRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select(
      "id, name, slug, description, image_url, parent_id, display_order, is_active, is_homepage_visible"
    )
    .order("parent_id", { ascending: true, nullsFirst: true })
    .order("display_order");

  if (error) {
    console.error("adminCategoryRows failed:", error.message);
    return [];
  }
  return data as DbCategoryRow[];
}

// ------------------------------------------------------------
// Orders
// ------------------------------------------------------------

export interface AdminOrderListParams {
  q?: string;
  status?: string;
  payment?: string;
  page?: number;
}

export async function adminListOrders(
  params: AdminOrderListParams = {}
): Promise<{ rows: DbOrder[]; total: number }> {
  const supabase = createClient();
  const page = Math.max(1, params.page ?? 1);
  const from = (page - 1) * ADMIN_PAGE_SIZE;
  const to = from + ADMIN_PAGE_SIZE - 1;

  let query = supabase
    .from("orders")
    .select(
      `id, order_number, customer_id, customer_email, customer_name, customer_phone,
       status, payment_status, payment_method, fulfilment_method,
       subtotal, discount_amount, delivery_fee, total,
       delivery_address_snapshot, customer_notes, admin_notes, created_at, paid_at`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }
  if (params.payment && params.payment !== "all") {
    query = query.eq("payment_status", params.payment);
  }
  if (params.q?.trim()) {
    const term = params.q.trim();
    query = query.or(`order_number.ilike.%${term}%,customer_email.ilike.%${term}%,customer_name.ilike.%${term}%`);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("adminListOrders failed:", error.message);
    return { rows: [], total: 0 };
  }
  return { rows: (data ?? []) as DbOrder[], total: count ?? 0 };
}

export async function adminGetOrder(
  id: string
): Promise<{ order: DbOrder; items: DbOrderItem[]; payments: DbPayment[] } | null> {
  const supabase = createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `id, order_number, customer_id, customer_email, customer_name, customer_phone,
       status, payment_status, payment_method, fulfilment_method,
       subtotal, discount_amount, delivery_fee, total,
       delivery_address_snapshot, customer_notes, admin_notes, created_at, paid_at`
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !order) return null;

  const [{ data: items }, { data: payments }] = await Promise.all([
    supabase
      .from("order_items")
      .select("id, product_name, variant_name, sku, quantity, unit_price, line_total, image_url")
      .eq("order_id", id)
      .order("created_at"),
    // provider_response is deliberately never selected.
    supabase
      .from("payments")
      .select("id, provider, provider_reference, amount, status, created_at, verified_at")
      .eq("order_id", id)
      .order("created_at"),
  ]);

  return {
    order: order as DbOrder,
    items: (items ?? []) as DbOrderItem[],
    payments: (payments ?? []) as DbPayment[],
  };
}

// ------------------------------------------------------------
// Commerce settings
// ------------------------------------------------------------

export async function adminListDiscounts(): Promise<DbDiscountCode[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("discount_codes")
    .select(
      `id, code, description, discount_type, discount_value, minimum_order_amount,
       maximum_discount_amount, usage_limit, usage_count, starts_at, expires_at, is_active`
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("adminListDiscounts failed:", error.message);
    return [];
  }
  return data as DbDiscountCode[];
}

export async function adminListDeliveryMethods(): Promise<DbDeliveryMethod[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("delivery_methods")
    .select(
      "id, name, code, description, fee, free_delivery_threshold, estimated_duration, is_active, display_order"
    )
    .order("display_order");

  if (error) {
    console.error("adminListDeliveryMethods failed:", error.message);
    return [];
  }
  return data as DbDeliveryMethod[];
}

export async function adminListSubscribers(): Promise<DbSubscriber[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, status, source, subscribed_at")
    .order("subscribed_at", { ascending: false });

  if (error) {
    console.error("adminListSubscribers failed:", error.message);
    return [];
  }
  return data as DbSubscriber[];
}

// ------------------------------------------------------------
// Staff
// ------------------------------------------------------------

export async function adminListProfiles(): Promise<DbProfileRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, created_at")
    .neq("role", "customer")
    .order("created_at");

  if (error) {
    console.error("adminListProfiles failed:", error.message);
    return [];
  }
  return data as DbProfileRow[];
}

// ------------------------------------------------------------
// Dashboard stats
// ------------------------------------------------------------

export interface AdminDashboardStats {
  productCounts: { active: number; draft: number; archived: number };
  lowStock: {
    productId: string;
    productName: string;
    slug: string;
    variantTitle: string;
    stock: number;
  }[];
  orderCount: number;
  pendingOrders: number;
  revenuePesewas: number;
  recentOrders: DbOrder[];
  activeSubscribers: number;
}

export async function adminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = createClient();

  const [productsRes, variantsRes, ordersRes, subscribersRes] = await Promise.all([
    supabase.from("products").select("status"),
    supabase
      .from("product_variants")
      .select("id, stock_quantity, title, product:products(id, name, slug, track_inventory)"),
    supabase
      .from("orders")
      .select(
        `id, order_number, customer_id, customer_email, customer_name, customer_phone,
         status, payment_status, payment_method, fulfilment_method,
         subtotal, discount_amount, delivery_fee, total,
         delivery_address_snapshot, customer_notes, admin_notes, created_at, paid_at`
      )
      .order("created_at", { ascending: false }),
    supabase.from("newsletter_subscribers").select("status"),
  ]);

  const productCounts = { active: 0, draft: 0, archived: 0 };
  for (const row of productsRes.data ?? []) {
    if (row.status in productCounts) {
      productCounts[row.status as keyof typeof productCounts] += 1;
    }
  }

  const lowStockRows = (variantsRes.data ?? []) as unknown as {
    stock_quantity: number;
    title: string;
    product: { id: string; name: string; slug: string; track_inventory: boolean } | null;
  }[];
  const lowStock = lowStockRows
    .filter(
      (v) => v.product?.track_inventory && v.stock_quantity <= 5
    )
    .sort((a, b) => a.stock_quantity - b.stock_quantity)
    .slice(0, 8)
    .map((v) => ({
      productId: v.product!.id,
      productName: v.product!.name,
      slug: v.product!.slug,
      variantTitle: v.title,
      stock: v.stock_quantity,
    }));

  const orders = (ordersRes.data ?? []) as DbOrder[];
  const revenuePesewas = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + o.total, 0);

  return {
    productCounts,
    lowStock,
    orderCount: orders.length,
    pendingOrders: orders.filter((o) =>
      ["pending", "confirmed", "processing"].includes(o.status)
    ).length,
    revenuePesewas,
    recentOrders: orders.slice(0, 8),
    activeSubscribers: (subscribersRes.data ?? []).filter(
      (s) => s.status === "active"
    ).length,
  };
}
