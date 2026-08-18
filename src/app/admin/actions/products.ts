"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertStaff, ForbiddenError } from "@/lib/admin/guard";
import {
  productFormSchema,
  type ProductFormInput,
} from "@/lib/validation/schemas";
import { ghsToPesewas } from "@/lib/format/money";

export interface AdminActionResult {
  error?: string;
  message?: string;
  id?: string;
}

const ZERO_UUID = "00000000-0000-0000-0000-000000000000";

interface StockMovement {
  variant_id: string;
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
}

/**
 * Creates or updates a product and synchronises its options,
 * option values and variants. The sync is non-destructive:
 * variants that fall out of the expected combo grid are
 * deactivated (never deleted) so order and inventory history
 * stay intact.
 */
export async function saveProduct(
  input: ProductFormInput
): Promise<AdminActionResult> {
  let session;
  try {
    session = await assertStaff();
  } catch (error) {
    return {
      error:
        error instanceof ForbiddenError
          ? error.message
          : "You are not authorised to do that.",
    };
  }

  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product data." };
  }
  const data = parsed.data;

  const supabase = createClient();

  // Slug must stay unique across the catalogue.
  const { data: slugClash } = await supabase
    .from("products")
    .select("id")
    .eq("slug", data.slug)
    .neq("id", data.id ?? ZERO_UUID)
    .maybeSingle();
  if (slugClash) {
    return { error: "Another product already uses this slug." };
  }

  const basePrice = ghsToPesewas(data.basePriceGhs);
  const compareAt = data.compareAtPriceGhs
    ? ghsToPesewas(data.compareAtPriceGhs)
    : null;
  const costPrice = data.costPriceGhs ? ghsToPesewas(data.costPriceGhs) : null;

  const fields = {
    name: data.name,
    slug: data.slug,
    sku: data.sku?.trim() ? data.sku.trim() : null,
    brand: data.brand?.trim() ? data.brand.trim() : null,
    category_id: data.categoryId,
    short_description: data.shortDescription?.trim() || null,
    description: data.description?.trim() || null,
    seo_title: data.seoTitle?.trim() || null,
    seo_description: data.seoDescription?.trim() || null,
    base_price: basePrice,
    compare_at_price: compareAt,
    cost_price: costPrice,
    status: data.status,
    is_featured: data.isFeatured,
    is_new_arrival: data.isNewArrival,
    is_bestseller: data.isBestseller,
    is_limited: data.isLimited,
    track_inventory: data.trackInventory,
  };

  let productId = data.id;

  if (productId) {
    const { data: current } = await supabase
      .from("products")
      .select("published_at")
      .eq("id", productId)
      .maybeSingle();
    if (!current) return { error: "Product not found." };

    const update: Record<string, unknown> = { ...fields };
    // First activation stamps the publish time used by RLS.
    if (data.status === "active" && !current.published_at) {
      update.published_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("products")
      .update(update)
      .eq("id", productId);
    if (error) return { error: error.message };
  } else {
    const insert: Record<string, unknown> = {
      ...fields,
      published_at: data.status === "active" ? new Date().toISOString() : null,
    };
    const { data: inserted, error } = await supabase
      .from("products")
      .insert(insert)
      .select("id")
      .single();
    if (error || !inserted) {
      return { error: error?.message ?? "Could not create the product." };
    }
    productId = inserted.id;
  }

  // ------------------------------------------------------------
  // Options + values sync
  // ------------------------------------------------------------

  const secondName = data.secondOptionName ?? "Size";
  const expectedOptions = [
    { name: "Colour", values: data.colours, display_order: 0 },
    { name: secondName, values: data.secondValues, display_order: 1 },
  ];

  const { data: existingOptions } = await supabase
    .from("product_options")
    .select("id, name")
    .eq("product_id", productId);

  const expectedNames = expectedOptions.map((o) => o.name);
  for (const option of existingOptions ?? []) {
    if (!expectedNames.includes(option.name)) {
      // Cascades to its values and their junction rows.
      await supabase.from("product_options").delete().eq("id", option.id);
    }
  }

  const valueIdByCombo = new Map<string, string>();
  for (const expected of expectedOptions) {
    let optionId = (existingOptions ?? []).find(
      (o) => o.name === expected.name
    )?.id;

    if (!optionId) {
      const { data: inserted, error } = await supabase
        .from("product_options")
        .insert({
          product_id: productId,
          name: expected.name,
          display_order: expected.display_order,
        })
        .select("id")
        .single();
      if (error || !inserted) return { error: error?.message ?? "Option sync failed." };
      optionId = inserted.id;
    }

    const { data: existingValues } = await supabase
      .from("product_option_values")
      .select("id, value")
      .eq("option_id", optionId);

    for (const value of existingValues ?? []) {
      if (!expected.values.includes(value.value)) {
        await supabase.from("product_option_values").delete().eq("id", value.id);
      }
    }

    let order = 0;
    for (const value of expected.values) {
      const existing = (existingValues ?? []).find((v) => v.value === value);
      if (existing) {
        valueIdByCombo.set(`${expected.name}|${value}`, existing.id);
      } else {
        const { data: inserted, error } = await supabase
          .from("product_option_values")
          .insert({ option_id: optionId, value, display_order: order })
          .select("id")
          .single();
        if (error || !inserted) {
          return { error: error?.message ?? "Option value sync failed." };
        }
        valueIdByCombo.set(`${expected.name}|${value}`, inserted.id);
      }
      order += 1;
    }
  }

  // ------------------------------------------------------------
  // Variants sync (match by Colour|Second combo key)
  // ------------------------------------------------------------

  const { data: existingVariants } = await supabase
    .from("product_variants")
    .select("id, sku, title, price, compare_at_price, stock_quantity, is_active")
    .eq("product_id", productId);

  const variantIds = (existingVariants ?? []).map((v) => v.id);
  const junctionByVariant = new Map<string, { option_name: string; value: string }[]>();
  if (variantIds.length > 0) {
    const { data: junctionRows } = await supabase
      .from("variant_option_values")
      .select(
        "variant_id, option_value:product_option_values(value, option:product_options(name))"
      )
      .in("variant_id", variantIds);

    const rows = (junctionRows ?? []) as unknown as {
      variant_id: string;
      option_value: { value: string; option: { name: string } } | null;
    }[];
    for (const row of rows) {
      const list = junctionByVariant.get(row.variant_id) ?? [];
      list.push({
        option_name: row.option_value?.option?.name ?? "",
        value: row.option_value?.value ?? "",
      });
      junctionByVariant.set(row.variant_id, list);
    }
  }

  const comboKey = (list: { option_name: string; value: string }[]) => {
    const colour = list.find((ov) => ov.option_name === "Colour")?.value ?? "";
    const second = list.find((ov) => ov.option_name !== "Colour")?.value ?? "";
    return `${colour}|${second}`;
  };

  const existingByKey = new Map<
    string,
    NonNullable<typeof existingVariants>[number]
  >();
  for (const variant of existingVariants ?? []) {
    existingByKey.set(comboKey(junctionByVariant.get(variant.id) ?? []), variant);
  }

  const movements: StockMovement[] = [];
  const seenKeys = new Set<string>();

  for (const row of data.variants) {
    const key = `${row.colour}|${row.secondValue}`;
    seenKeys.add(key);

    const price = ghsToPesewas(row.priceGhs);
    const variantCompareAt = row.compareAtGhs
      ? ghsToPesewas(row.compareAtGhs)
      : null;
    const title = `${row.colour} / ${row.secondValue}`;
    const existing = existingByKey.get(key);

    if (existing) {
      const { error } = await supabase
        .from("product_variants")
        .update({
          title,
          price,
          compare_at_price: variantCompareAt,
          stock_quantity: row.stock,
          sku: row.sku?.trim() ? row.sku.trim() : null,
          is_active: row.active,
        })
        .eq("id", existing.id);
      if (error) return { error: error.message };

      if (data.trackInventory && existing.stock_quantity !== row.stock) {
        movements.push({
          variant_id: existing.id,
          quantity_change: row.stock - existing.stock_quantity,
          quantity_before: existing.stock_quantity,
          quantity_after: row.stock,
        });
      }
    } else {
      const { data: inserted, error } = await supabase
        .from("product_variants")
        .insert({
          product_id: productId,
          title,
          price,
          compare_at_price: variantCompareAt,
          stock_quantity: row.stock,
          sku: row.sku?.trim() ? row.sku.trim() : null,
          is_active: row.active,
          low_stock_threshold: 5,
        })
        .select("id")
        .single();
      if (error || !inserted) {
        return { error: error?.message ?? "Variant sync failed." };
      }

      const junctionInserts = [
        valueIdByCombo.get(`Colour|${row.colour}`),
        valueIdByCombo.get(`${secondName}|${row.secondValue}`),
      ]
        .filter((id): id is string => Boolean(id))
        .map((option_value_id) => ({
          variant_id: inserted.id,
          option_value_id,
        }));

      if (junctionInserts.length > 0) {
        const { error: junctionError } = await supabase
          .from("variant_option_values")
          .insert(junctionInserts);
        if (junctionError) return { error: junctionError.message };
      }

      if (data.trackInventory && row.stock > 0) {
        movements.push({
          variant_id: inserted.id,
          quantity_change: row.stock,
          quantity_before: 0,
          quantity_after: row.stock,
        });
      }
    }
  }

  // Combos removed from the grid are deactivated, not deleted.
  for (const variant of existingVariants ?? []) {
    const key = comboKey(junctionByVariant.get(variant.id) ?? []);
    if (!seenKeys.has(key) && variant.is_active) {
      await supabase
        .from("product_variants")
        .update({ is_active: false })
        .eq("id", variant.id);
    }
  }

  // Stock adjustments are written with the service role (no client
  // insert policy on inventory_movements). Failures are logged but
  // do not roll back the product save.
  if (movements.length > 0) {
    try {
      const admin = createAdminClient();
      const { error: movementError } = await admin
        .from("inventory_movements")
        .insert(
          movements.map((m) => ({
            variant_id: m.variant_id,
            movement_type: "adjustment",
            quantity_change: m.quantity_change,
            quantity_before: m.quantity_before,
            quantity_after: m.quantity_after,
            reason: "Admin stock edit",
            created_by: session.userId,
          }))
        );
      if (movementError) {
        console.error("inventory_movements insert failed:", movementError.message);
      }
    } catch (error) {
      console.error("inventory_movements insert failed:", error);
    }
  }

  revalidatePath("/admin", "layout");
  return { message: "Product saved.", id: productId };
}
