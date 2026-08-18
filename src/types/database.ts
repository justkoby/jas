/**
 * Row/JSON shapes returned by the Supabase schema.
 * Money is always integer Ghana pesewas at this layer —
 * conversion to GHS floats happens in src/lib/format/money.ts.
 */

export type ProductStatus = "draft" | "active" | "archived";
export type UserRole = "customer" | "staff" | "admin" | "super_admin";

export interface DbCategoryRef {
  id: string;
  name: string;
  slug: string;
  /** Parent category when this is a subcategory. */
  parent: { id: string; name: string; slug: string } | null;
}

export interface DbProductImage {
  id: string;
  storage_path: string | null;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
}

export interface DbOptionValue {
  id: string;
  value: string;
}

export interface DbProductOption {
  id: string;
  name: string;
  values: DbOptionValue[];
}

/** Option values composing a variant, e.g. { option_name: "Colour", value: "Black" }. */
export interface DbVariantOptionValue {
  option_name: string;
  value: string;
}

export interface DbProductVariant {
  id: string;
  sku: string | null;
  title: string;
  price: number; // pesewas
  compare_at_price: number | null; // pesewas
  stock_quantity: number;
  is_active: boolean;
  option_values: DbVariantOptionValue[];
}

/**
 * Product aggregate as returned by the `search_products` RPC
 * (and mirrored by the single-product nested select).
 */
export interface DbProduct {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  short_description: string | null;
  description: string | null;
  brand: string | null;
  base_price: number; // pesewas
  compare_at_price: number | null; // pesewas
  is_featured: boolean;
  is_new_arrival: boolean;
  is_bestseller: boolean;
  is_limited: boolean;
  track_inventory: boolean;
  created_at: string;
  published_at: string | null;
  category: DbCategoryRef;
  images: DbProductImage[];
  options: DbProductOption[];
  variants: DbProductVariant[];
}

export interface DbDeliveryMethod {
  id: string;
  name: string;
  code: string;
  description: string | null;
  fee: number; // pesewas
  free_delivery_threshold: number | null; // pesewas
  estimated_duration: string | null;
  is_active: boolean;
  display_order: number;
}

export interface DbProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
}

export interface DbProfileRow extends DbProfile {
  created_at: string;
}

export interface DbCategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  display_order: number;
  is_active: boolean;
  is_homepage_visible: boolean;
}

/** Slim product row for the admin product list. */
export interface AdminProductRow {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  status: ProductStatus;
  base_price: number; // pesewas
  compare_at_price: number | null; // pesewas
  is_featured: boolean;
  is_new_arrival: boolean;
  updated_at: string;
  total_stock: number;
  primary_image: string | null; // storage_path
  category: DbCategoryRef | null;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "unpaid"
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export interface DbOrder {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_email: string;
  customer_name: string;
  customer_phone: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string | null;
  fulfilment_method: string | null;
  subtotal: number; // pesewas
  discount_amount: number; // pesewas
  delivery_fee: number; // pesewas
  total: number; // pesewas
  delivery_address_snapshot: unknown;
  customer_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  paid_at: string | null;
}

export interface DbOrderItem {
  id: string;
  product_name: string;
  variant_name: string | null;
  sku: string | null;
  quantity: number;
  unit_price: number; // pesewas
  line_total: number; // pesewas
  image_url: string | null;
}

export interface DbPayment {
  id: string;
  provider: string;
  provider_reference: string | null;
  amount: number; // pesewas
  status: "pending" | "success" | "failed" | "refunded";
  created_at: string;
  verified_at: string | null;
}

export interface DbDiscountCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number; // percent or pesewas
  minimum_order_amount: number; // pesewas
  maximum_discount_amount: number | null; // pesewas
  usage_limit: number | null;
  usage_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}

export interface DbSubscriber {
  id: string;
  email: string;
  status: "active" | "unsubscribed";
  source: string;
  subscribed_at: string;
}
