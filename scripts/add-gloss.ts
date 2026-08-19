/**
 * JAS catalogue extension — inserts the Gloss By Sal triple shine lip
 * gloss set with two photos served from /public and a launch compare-at
 * price (GH₵200 -> GH₵180).
 *
 * Usage:
 *   npm run add-gloss
 *
 * Idempotent: the product upserts by slug and its images/options/variants
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
// Product definition
// ------------------------------------------------------------

/** GHS float -> integer pesewas (the DB's money unit). */
function toPesewas(ghs: number): number {
  return Math.round(ghs * 100);
}

const PRODUCT = {
  name: "Gloss By Sal – Triple Shine Lip Gloss Set",
  slug: "gloss-by-sal-triple-shine-lip-gloss-set",
  sku: "JAS-027",
  images: ["/gloss-by-sal-triple-shine-1.png", "/gloss-by-sal-triple-shine-2.png"],
  parentSlug: "beauty-fragrance",
  subcategory: "Lip Gloss",
  priceGhs: 180,
  compareAtGhs: 200,
  size: "One Size",
  stockPerVariant: 5,
  description:
    "A beautiful three-piece lip gloss collection featuring clear, soft pink and vibrant red shades. " +
    "Each gloss delivers a smooth, high-shine finish that can be worn alone or layered over lipstick—perfect " +
    "for everyday looks and special occasions.\n\nIncludes: 3 lip glosses\nShades: Crystal Clear, Pretty Pink and Cherry Red\nFinish: Glossy",
};

function fail(
  context: string,
  error: { message: string } | null
): asserts error is null {
  if (error) {
    console.error(`Add-gloss failed while ${context}: ${error.message}`);
    process.exit(1);
  }
}

// ------------------------------------------------------------
// Insert steps
// ------------------------------------------------------------

async function ensureSubcategory(): Promise<string> {
  const { data: parents, error: parentError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", PRODUCT.parentSlug)
    .maybeSingle();
  fail("loading parent category", parentError);
  if (!parents) {
    console.error(`Parent category "${PRODUCT.parentSlug}" does not exist. Run npm run seed first.`);
    process.exit(1);
  }

  const { data: sub, error: subError } = await supabase
    .from("categories")
    .upsert(
      {
        name: PRODUCT.subcategory,
        slug: "lip-gloss",
        parent_id: parents.id,
        display_order: 12,
        is_active: true,
        is_homepage_visible: true,
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();
  fail("upserting subcategory", subError);
  return sub.id;
}

async function insertProduct(categoryId: string) {
  const pricePesewas = toPesewas(PRODUCT.priceGhs);
  const compareAtPesewas = toPesewas(PRODUCT.compareAtGhs);

  const { data: inserted, error } = await supabase
    .from("products")
    .upsert(
      {
        name: PRODUCT.name,
        slug: PRODUCT.slug,
        sku: PRODUCT.sku,
        short_description: PRODUCT.description.slice(0, 160),
        description: PRODUCT.description,
        category_id: categoryId,
        brand: "Gloss By Sal",
        base_price: pricePesewas,
        compare_at_price: compareAtPesewas,
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
  fail(`upserting product ${PRODUCT.slug}`, error);
  if (!inserted) {
    throw new Error(`No row returned after upserting ${PRODUCT.slug}.`);
  }
  const productId = inserted.id;

  // Rebuild children so reruns stay deterministic (junction rows
  // cascade-delete with their variants).
  for (const table of ["product_images", "product_options", "product_variants"]) {
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .eq("product_id", productId);
    fail(`clearing ${table} for ${PRODUCT.slug}`, deleteError);
  }

  // Photos live in /public; the mapper passes "/"-prefixed paths through.
  const { error: imageError } = await supabase.from("product_images").insert(
    PRODUCT.images.map((src, i) => ({
      product_id: productId,
      storage_path: src,
      alt_text: PRODUCT.name,
      display_order: i,
      is_primary: i === 0,
    }))
  );
  fail(`inserting images for ${PRODUCT.slug}`, imageError);

  const { data: options, error: optionError } = await supabase
    .from("product_options")
    .insert([{ product_id: productId, name: "Size", display_order: 0 }])
    .select("id");
  fail(`inserting options for ${PRODUCT.slug}`, optionError);

  const { data: valueRows, error: valueError } = await supabase
    .from("product_option_values")
    .insert([{ option_id: options![0].id, value: PRODUCT.size, display_order: 0 }])
    .select("id");
  fail(`inserting option values for ${PRODUCT.slug}`, valueError);

  const { data: variants, error: variantError } = await supabase
    .from("product_variants")
    .insert({
      product_id: productId,
      sku: `${PRODUCT.sku}-V1`,
      title: PRODUCT.size,
      price: pricePesewas,
      compare_at_price: compareAtPesewas,
      stock_quantity: PRODUCT.stockPerVariant,
      low_stock_threshold: 2,
      is_active: true,
    })
    .select("id");
  fail(`inserting variants for ${PRODUCT.slug}`, variantError);

  const { error: junctionError } = await supabase
    .from("variant_option_values")
    .insert([{ variant_id: variants![0].id, option_value_id: valueRows![0].id }]);
  fail(`inserting variant option values for ${PRODUCT.slug}`, junctionError);
}

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------

async function main() {
  const categoryId = await ensureSubcategory();
  console.log(`✔ Subcategory "${PRODUCT.subcategory}" ready`);

  await insertProduct(categoryId);
  console.log(`✔ ${PRODUCT.name} (${PRODUCT.sku})`);
  console.log("\nDone — gloss set live.");
}

main().catch((err) => {
  console.error("Add-gloss failed:", err);
  process.exit(1);
});
