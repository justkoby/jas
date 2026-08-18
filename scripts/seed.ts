/**
 * JAS seed script — converts the storefront mock catalogue into
 * real database rows (categories, products, options, variants,
 * images, delivery methods, dev discount code).
 *
 * Usage:
 *   npm run seed            # refuses to run if data already exists
 *   npm run seed -- --force # re-seed (upserts + rebuilds variants)
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * (reads .env.local then .env when the vars are not already set).
 */

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { mockProducts } from "../src/data/products";
import type { Product } from "../src/types";

// ------------------------------------------------------------
// Environment
// ------------------------------------------------------------

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  const lines = readFileSync(path, "utf-8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

const root = resolve(__dirname, "..");
loadEnvFile(resolve(root, ".env.local"));
loadEnvFile(resolve(root, ".env"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!supabaseUrl.startsWith("http") || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Copy .env.example to .env.local and fill in your Supabase credentials."
  );
  process.exit(1);
}

// Service-role client bypasses RLS — seed runs as a trusted process.
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const FORCE = process.argv.includes("--force");

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** GHS float -> integer pesewas (the DB's money unit). */
function toPesewas(ghs: number): number {
  return Math.round(ghs * 100);
}

function fail(
  context: string,
  error: { message: string } | null
): asserts error is null {
  if (error) {
    console.error(`Seed failed while ${context}: ${error.message}`);
    process.exit(1);
  }
}

// Parent categories mirror the storefront navigation. "sale" is a
// virtual category — it exists for the nav link but holds no products.
const PARENT_CATEGORIES = [
  {
    slug: "clothing",
    name: "Clothing",
    description:
      "Effortless, premium silhouettes designed for comfort, ease, and modern style.",
  },
  {
    slug: "shoes",
    name: "Shoes",
    description:
      "Architectural shapes, soft leather mule sandals, and slide flats handmade by local artisans.",
  },
  {
    slug: "bags-accessories",
    name: "Bags & Accessories",
    description:
      "Structured genuine leather bags, 18K gold earrings, and authentic hand-woven accents.",
  },
  {
    slug: "beauty-fragrance",
    name: "Beauty & Fragrance",
    description:
      "Signature amber perfumes, DAMASK rose mists, and cold-pressed organic skincare oils.",
  },
  {
    slug: "home-living",
    name: "Home & Living",
    description:
      "Rechargeable dome lamps, Sandy ceramic stoneware, and hand-poured coconut-soy wax candles.",
  },
  {
    slug: "sale",
    name: "Sale",
    description:
      "Refresh your lifestyle. Selected wardrobe, fragrance, and home design pieces at private offer rates.",
  },
];

/** Second option name per mock variationType (colour is always first). */
const VARIATION_OPTION_NAME: Record<string, string> = {
  size: "Size",
  volume: "Volume",
  material: "Material",
  scent: "Scent",
};

const DELIVERY_METHODS = [
  {
    code: "standard_accra",
    name: "Standard Delivery (Accra)",
    description: "Doorstep delivery within Greater Accra.",
    fee: 3000,
    free_delivery_threshold: 100000,
    estimated_duration: "1-2 business days",
    display_order: 1,
  },
  {
    code: "express_accra",
    name: "Express Delivery (Accra)",
    description: "Priority same/next-day delivery within Accra.",
    fee: 5000,
    free_delivery_threshold: 100000,
    estimated_duration: "Within 24 hours",
    display_order: 2,
  },
  {
    code: "pickup_rider",
    name: "Pickup / Rider Meetup",
    description: "Collect in person or send your own rider (free).",
    fee: 0,
    free_delivery_threshold: null,
    estimated_duration: "Same day — arrange via WhatsApp",
    display_order: 3,
  },
  {
    code: "outside_accra",
    name: "Delivery Outside Accra",
    description: "Nationwide delivery via trusted bus/courier partners.",
    fee: 8000,
    free_delivery_threshold: null,
    estimated_duration: "2-4 business days",
    display_order: 4,
  },
];

const DEV_DISCOUNT = {
  code: "WELCOME10",
  description: "Development-only welcome discount (disable in production).",
  discount_type: "percentage",
  discount_value: 10,
  minimum_order_amount: 0,
  is_active: true,
};

// ------------------------------------------------------------
// Seed steps
// ------------------------------------------------------------

async function seedCategories(): Promise<Map<string, string>> {
  // Upsert parents first so children can reference them.
  const { data: parents, error: parentError } = await supabase
    .from("categories")
    .upsert(
      PARENT_CATEGORIES.map((c, i) => ({
        ...c,
        parent_id: null,
        display_order: i + 1,
        is_active: true,
        is_homepage_visible: true,
      })),
      { onConflict: "slug" }
    )
    .select("id, slug");
  fail("upserting parent categories", parentError);

  const ids = new Map<string, string>();
  for (const p of parents ?? []) ids.set(p.slug, p.id);

  // Subcategories derived from the mock catalogue (unique per parent).
  const subRows: {
    name: string;
    slug: string;
    parent_slug: string;
  }[] = [];
  const seen = new Set<string>();
  for (const product of mockProducts) {
    const key = `${product.category}/${product.subcategory}`;
    if (seen.has(key)) continue;
    seen.add(key);
    subRows.push({
      name: product.subcategory,
      slug: slugify(product.subcategory),
      parent_slug: product.category,
    });
  }

  const { data: children, error: childError } = await supabase
    .from("categories")
    .upsert(
      subRows.map((s, i) => ({
        name: s.name,
        slug: s.slug,
        parent_id: ids.get(s.parent_slug) ?? null,
        display_order: i + 1,
        is_active: true,
        is_homepage_visible: true,
      })),
      { onConflict: "slug" }
    )
    .select("id, slug");
  fail("upserting subcategories", childError);

  for (const c of children ?? []) ids.set(c.slug, c.id);
  return ids;
}

async function seedProduct(
  product: Product,
  index: number,
  categoryIds: Map<string, string>
) {
  const subSlug = slugify(product.subcategory);
  const categoryId = categoryIds.get(subSlug);
  if (!categoryId) {
    throw new Error(`Subcategory "${product.subcategory}" was not seeded.`);
  }

  const sku = `JAS-${String(index + 1).padStart(3, "0")}`;
  const detailBullets = (product.details ?? [])
    .map((d) => `- ${d}`)
    .join("\n");
  const careBullets = (product.care ?? []).map((c) => `- ${c}`).join("\n");
  const description = [
    product.description,
    detailBullets ? `Details:\n${detailBullets}` : "",
    careBullets ? `Care:\n${careBullets}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const { data: inserted, error } = await supabase
    .from("products")
    .upsert(
      {
        name: product.name,
        slug: product.slug,
        sku,
        short_description: product.description.slice(0, 160),
        description,
        category_id: categoryId,
        brand: "JAS",
        base_price: toPesewas(product.price),
        compare_at_price: product.originalPrice
          ? toPesewas(product.originalPrice)
          : null,
        status: "active",
        is_featured: product.isFeatured,
        is_new_arrival: product.isNew,
        is_bestseller: false,
        is_limited: false,
        track_inventory: true,
        published_at: new Date().toISOString(),
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();
  fail(`upserting product ${product.slug}`, error);
  if (!inserted) {
    throw new Error(`No row returned after upserting product ${product.slug}.`);
  }
  const productId = inserted.id;

  // Rebuild children on every run so --force stays deterministic.
  for (const table of ["product_images", "product_options", "product_variants"]) {
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .eq("product_id", productId);
    fail(`clearing ${table} for ${product.slug}`, deleteError);
  }

  // Placeholder image record — storage_path null; the storefront
  // mapper falls back to /placeholder.jpg until real photos exist.
  const { error: imageError } = await supabase.from("product_images").insert({
    product_id: productId,
    storage_path: null,
    alt_text: product.name,
    display_order: 0,
    is_primary: true,
  });
  fail(`inserting image for ${product.slug}`, imageError);

  // Options: colour first, then the variationType option.
  const optionName2 =
    VARIATION_OPTION_NAME[product.variationType ?? "size"] ?? "Size";
  const values2 = product.sizes?.length ? product.sizes : ["Standard"];

  const { data: options, error: optionError } = await supabase
    .from("product_options")
    .insert([
      { product_id: productId, name: "Colour", display_order: 0 },
      { product_id: productId, name: optionName2, display_order: 1 },
    ])
    .select("id, name");
  fail(`inserting options for ${product.slug}`, optionError);

  const colourOptionId = options!.find((o) => o.name === "Colour")!.id;
  const secondOptionId = options!.find((o) => o.name !== "Colour")!.id;

  const colourValueRows = product.colors.map((c, i) => ({
    option_id: colourOptionId,
    value: c.name,
    display_order: i,
  }));
  const secondValueRows = values2.map((v, i) => ({
    option_id: secondOptionId,
    value: v,
    display_order: i,
  }));

  const { data: valueRows, error: valueError } = await supabase
    .from("product_option_values")
    .insert([...colourValueRows, ...secondValueRows])
    .select("id, option_id, value");
  fail(`inserting option values for ${product.slug}`, valueError);

  const colourValueIds = new Map<string, string>();
  const secondValueIds = new Map<string, string>();
  for (const row of valueRows ?? []) {
    if (row.option_id === colourOptionId) colourValueIds.set(row.value, row.id);
    else secondValueIds.set(row.value, row.id);
  }

  // Variants: colour x size cartesian product. Stock is spread
  // evenly with the remainder going to the first variants.
  const combos: { colour: string; second: string; title: string }[] = [];
  for (const colour of product.colors) {
    for (const second of values2) {
      combos.push({
        colour: colour.name,
        second,
        title: values2.length === 1 && second === "Standard"
          ? colour.name
          : `${colour.name} / ${second}`,
      });
    }
  }

  const perVariant = Math.floor(product.stock / combos.length);
  const remainder = product.stock % combos.length;
  const pricePesewas = toPesewas(product.price);
  const comparePesewas = product.originalPrice
    ? toPesewas(product.originalPrice)
    : null;

  const variantRows = combos.map((combo, i) => ({
    product_id: productId,
    sku: `${sku}-V${i + 1}`,
    title: combo.title,
    price: pricePesewas,
    compare_at_price: comparePesewas,
    stock_quantity: perVariant + (i < remainder ? 1 : 0),
    low_stock_threshold: 2,
    is_active: true,
  }));

  const { data: variants, error: variantError } = await supabase
    .from("product_variants")
    .insert(variantRows)
    .select("id, sku");
  fail(`inserting variants for ${product.slug}`, variantError);

  const junctionRows = (variants ?? []).flatMap((variant, i) => {
    const combo = combos[i];
    return [
      {
        variant_id: variant.id,
        option_value_id: colourValueIds.get(combo.colour)!,
      },
      {
        variant_id: variant.id,
        option_value_id: secondValueIds.get(combo.second)!,
      },
    ];
  });

  const { error: junctionError } = await supabase
    .from("variant_option_values")
    .insert(junctionRows);
  fail(`inserting variant option values for ${product.slug}`, junctionError);
}

async function seedCommerceSettings() {
  const { error: deliveryError } = await supabase
    .from("delivery_methods")
    .upsert(DELIVERY_METHODS, { onConflict: "code" });
  fail("upserting delivery methods", deliveryError);

  const { error: discountError } = await supabase
    .from("discount_codes")
    .upsert(DEV_DISCOUNT, { onConflict: "code" });
  fail("upserting discount codes", discountError);
}

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------

async function main() {
  const { count, error: countError } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });
  fail("checking existing data", countError);

  if ((count ?? 0) > 0 && !FORCE) {
    console.error(
      `Products already exist (${count} rows). Refusing to seed again.\n` +
        "Run `npm run seed -- --force` to upsert and rebuild the seed data."
    );
    process.exit(1);
  }

  console.log(`Seeding ${mockProducts.length} products${FORCE ? " (force)" : ""}...`);

  const categoryIds = await seedCategories();
  console.log(`✔ Categories seeded (${categoryIds.size} rows)`);

  for (let i = 0; i < mockProducts.length; i++) {
    await seedProduct(mockProducts[i], i, categoryIds);
    console.log(`✔ ${mockProducts[i].name}`);
  }

  await seedCommerceSettings();
  console.log("✔ Delivery methods + WELCOME10 discount seeded");

  console.log("\nSeed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
