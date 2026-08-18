/**
 * JAS catalogue extension — inserts the first real product drop
 * (wedges, mules, chain bags, slides) with photos served from /public.
 *
 * Usage:
 *   npm run add-products
 *
 * Idempotent: products upsert by slug and their images/options/variants
 * are rebuilt on every run. Requires NEXT_PUBLIC_SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY (reads .env.local then .env).
 */

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

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

// Service-role client bypasses RLS — this runs as a trusted process.
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ------------------------------------------------------------
// Catalogue definition
// ------------------------------------------------------------

const EU_SHOE_SIZES = ["36", "37", "38", "39", "40", "41", "42"];

interface NewProduct {
  name: string;
  slug: string;
  sku: string;
  image: string;
  parentSlug: string;
  subcategory: string;
  priceGhs: number;
  colours: string[];
  sizes: string[];
  stockPerVariant: number;
  description: string;
}

const NEW_PRODUCTS: NewProduct[] = [
  {
    name: "Nia Clear Platform Wedges",
    slug: "nia-clear-platform-wedges",
    sku: "JAS-023",
    image: "/nia-clear-platform-wedges.jpeg",
    parentSlug: "shoes",
    subcategory: "Wedges",
    priceGhs: 280,
    colours: ["Black/Clear"],
    sizes: EU_SHOE_SIZES,
    stockPerVariant: 3,
    description:
      "Statement black platform wedges finished with a transparent upper. Bold, comfortable and perfect for parties, brunch dates and elevated casual looks.",
  },
  {
    name: "Amara Floral Stiletto Mules",
    slug: "amara-floral-stiletto-mules",
    sku: "JAS-024",
    image: "/amara-floral-stiletto-mules.jpeg",
    parentSlug: "shoes",
    subcategory: "Heels",
    priceGhs: 320,
    colours: ["Black/Gold"],
    sizes: EU_SHOE_SIZES,
    stockPerVariant: 3,
    description:
      "Elegant black slip-on heels featuring delicate straps and a gold floral accent. Designed to add a sophisticated finish to evening and occasion outfits.",
  },
  {
    name: "Sienna Padded Chain Bag",
    slug: "sienna-padded-chain-bag",
    sku: "JAS-025",
    image: "/sienna-padded-chain-bag.jpeg",
    parentSlug: "bags-accessories",
    subcategory: "Bags",
    priceGhs: 250,
    colours: ["Midnight Black", "Soft Beige", "Emerald Green"],
    sizes: ["One Size"],
    stockPerVariant: 5,
    description:
      "A soft, textured shoulder bag with a plush structured shape and polished gold chain strap. Spacious enough for your everyday essentials.",
  },
  {
    name: "Kiss Me Statement Slides",
    slug: "kiss-me-statement-slides",
    sku: "JAS-026",
    image: "/kiss-me-statement-slides.jpeg",
    parentSlug: "shoes",
    subcategory: "Slides",
    priceGhs: 220,
    colours: ["White/Multi"],
    sizes: EU_SHOE_SIZES,
    stockPerVariant: 3,
    description:
      "Playful white slides decorated with a colourful lip print and gold-tone detail. Easy to wear for relaxed days, errands and casual outings.",
  },
];

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
    console.error(`Add-products failed while ${context}: ${error.message}`);
    process.exit(1);
  }
}

// ------------------------------------------------------------
// Insert steps
// ------------------------------------------------------------

async function ensureSubcategories(): Promise<Map<string, string>> {
  const parentSlugs = NEW_PRODUCTS
    .map((p) => p.parentSlug)
    .filter((slug, i, arr) => arr.indexOf(slug) === i);
  const { data: parents, error: parentError } = await supabase
    .from("categories")
    .select("id, slug")
    .in("slug", parentSlugs);
  fail("loading parent categories", parentError);

  const parentIds = new Map<string, string>();
  for (const p of parents ?? []) parentIds.set(p.slug, p.id);
  for (const slug of parentSlugs) {
    if (!parentIds.has(slug)) {
      console.error(`Parent category "${slug}" does not exist. Run npm run seed first.`);
      process.exit(1);
    }
  }

  const seen = new Set<string>();
  const subRows: { name: string; slug: string; parent_id: string }[] = [];
  for (const p of NEW_PRODUCTS) {
    const slug = slugify(p.subcategory);
    if (seen.has(slug)) continue;
    seen.add(slug);
    subRows.push({ name: p.subcategory, slug, parent_id: parentIds.get(p.parentSlug)! });
  }

  const { data: subs, error: subError } = await supabase
    .from("categories")
    .upsert(
      subRows.map((s, i) => ({
        ...s,
        display_order: i + 10,
        is_active: true,
        is_homepage_visible: true,
      })),
      { onConflict: "slug" }
    )
    .select("id, slug");
  fail("upserting subcategories", subError);

  const ids = new Map<string, string>();
  for (const s of subs ?? []) ids.set(s.slug, s.id);
  return ids;
}

async function insertProduct(
  product: NewProduct,
  categoryIds: Map<string, string>
) {
  const categoryId = categoryIds.get(slugify(product.subcategory));
  if (!categoryId) {
    throw new Error(`Subcategory "${product.subcategory}" was not resolved.`);
  }

  const { data: inserted, error } = await supabase
    .from("products")
    .upsert(
      {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        short_description: product.description.slice(0, 160),
        description: product.description,
        category_id: categoryId,
        brand: "JAS",
        base_price: toPesewas(product.priceGhs),
        compare_at_price: null,
        status: "active",
        is_featured: false,
        is_new_arrival: true,
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
    throw new Error(`No row returned after upserting ${product.slug}.`);
  }
  const productId = inserted.id;

  // Rebuild children so reruns stay deterministic (junction rows
  // cascade-delete with their variants).
  for (const table of ["product_images", "product_options", "product_variants"]) {
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .eq("product_id", productId);
    fail(`clearing ${table} for ${product.slug}`, deleteError);
  }

  // Photo lives in /public; the mapper passes "/"-prefixed paths through.
  const { error: imageError } = await supabase.from("product_images").insert({
    product_id: productId,
    storage_path: product.image,
    alt_text: product.name,
    display_order: 0,
    is_primary: true,
  });
  fail(`inserting image for ${product.slug}`, imageError);

  const { data: options, error: optionError } = await supabase
    .from("product_options")
    .insert([
      { product_id: productId, name: "Colour", display_order: 0 },
      { product_id: productId, name: "Size", display_order: 1 },
    ])
    .select("id, name");
  fail(`inserting options for ${product.slug}`, optionError);

  const colourOptionId = options!.find((o) => o.name === "Colour")!.id;
  const sizeOptionId = options!.find((o) => o.name === "Size")!.id;

  const { data: valueRows, error: valueError } = await supabase
    .from("product_option_values")
    .insert([
      ...product.colours.map((value, i) => ({
        option_id: colourOptionId,
        value,
        display_order: i,
      })),
      ...product.sizes.map((value, i) => ({
        option_id: sizeOptionId,
        value,
        display_order: i,
      })),
    ])
    .select("id, option_id, value");
  fail(`inserting option values for ${product.slug}`, valueError);

  const colourValueIds = new Map<string, string>();
  const sizeValueIds = new Map<string, string>();
  for (const row of valueRows ?? []) {
    if (row.option_id === colourOptionId) colourValueIds.set(row.value, row.id);
    else sizeValueIds.set(row.value, row.id);
  }

  const combos: { colour: string; size: string }[] = [];
  for (const colour of product.colours) {
    for (const size of product.sizes) combos.push({ colour, size });
  }

  const pricePesewas = toPesewas(product.priceGhs);
  const variantRows = combos.map((combo, i) => ({
    product_id: productId,
    sku: `${product.sku}-V${i + 1}`,
    title: `${combo.colour} / ${combo.size}`,
    price: pricePesewas,
    compare_at_price: null,
    stock_quantity: product.stockPerVariant,
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
      { variant_id: variant.id, option_value_id: colourValueIds.get(combo.colour)! },
      { variant_id: variant.id, option_value_id: sizeValueIds.get(combo.size)! },
    ];
  });

  const { error: junctionError } = await supabase
    .from("variant_option_values")
    .insert(junctionRows);
  fail(`inserting variant option values for ${product.slug}`, junctionError);
}

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------

async function main() {
  const categoryIds = await ensureSubcategories();
  console.log(`✔ Subcategories ready (${categoryIds.size} rows)`);

  for (const product of NEW_PRODUCTS) {
    await insertProduct(product, categoryIds);
    console.log(`✔ ${product.name} (${product.sku})`);
  }

  console.log(`\nDone — ${NEW_PRODUCTS.length} products live.`);
}

main().catch((err) => {
  console.error("Add-products failed:", err);
  process.exit(1);
});
