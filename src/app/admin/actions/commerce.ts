"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertStaff, ForbiddenError } from "@/lib/admin/guard";
import { ghsToPesewas } from "@/lib/format/money";
import {
  deliveryMethodSchema,
  discountSchema,
  type DeliveryMethodInput,
  type DiscountInput,
} from "@/lib/validation/schemas";
import type { AdminActionResult } from "./products";

/**
 * Commerce settings (discount codes, delivery methods, newsletter
 * subscribers) have staff RLS write policies, so these actions use
 * the cookie client — RLS still applies.
 */

async function guard(): Promise<AdminActionResult | null> {
  try {
    await assertStaff();
    return null;
  } catch (error) {
    return {
      error:
        error instanceof ForbiddenError
          ? error.message
          : "You are not authorised to do that.",
    };
  }
}

/** datetime-local strings arrive as "YYYY-MM-DDTHH:mm"; empty means unset. */
function toTimestamp(value: string | null): string | null {
  return value && value.trim() ? value.trim() : null;
}

// ------------------------------------------------------------
// Discount codes
// ------------------------------------------------------------

export async function saveDiscount(
  input: DiscountInput
): Promise<AdminActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const parsed = discountSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid discount data." };
  }
  const data = parsed.data;

  const supabase = createClient();

  const { data: codeClash } = await supabase
    .from("discount_codes")
    .select("id")
    .eq("code", data.code)
    .neq("id", data.id ?? "00000000-0000-0000-0000-000000000000")
    .maybeSingle();
  if (codeClash) {
    return { error: "Another discount code already uses this code." };
  }

  const fields = {
    code: data.code,
    description: data.description ?? null,
    discount_type: data.discountType,
    discount_value:
      data.discountType === "percentage"
        ? Math.round(data.discountValue)
        : ghsToPesewas(data.discountValue),
    minimum_order_amount: ghsToPesewas(data.minOrderGhs),
    maximum_discount_amount:
      data.maxDiscountGhs === null ? null : ghsToPesewas(data.maxDiscountGhs),
    usage_limit: data.usageLimit,
    starts_at: toTimestamp(data.startsAt),
    expires_at: toTimestamp(data.expiresAt),
    is_active: data.isActive,
  };

  if (data.id) {
    const { error } = await supabase
      .from("discount_codes")
      .update(fields)
      .eq("id", data.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("discount_codes").insert(fields);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/discounts");
  return { message: "Discount code saved." };
}

export async function deleteDiscount(id: string): Promise<AdminActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const supabase = createClient();
  const { error } = await supabase.from("discount_codes").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/discounts");
  return { message: "Discount code deleted." };
}

// ------------------------------------------------------------
// Delivery methods
// ------------------------------------------------------------

export async function saveDeliveryMethod(
  input: DeliveryMethodInput
): Promise<AdminActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const parsed = deliveryMethodSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid delivery method." };
  }
  const data = parsed.data;

  const supabase = createClient();

  const fields = {
    name: data.name,
    code: data.code,
    description: data.description ?? null,
    fee: ghsToPesewas(data.feeGhs),
    free_delivery_threshold:
      data.freeThresholdGhs === null ? null : ghsToPesewas(data.freeThresholdGhs),
    estimated_duration: data.estimatedDuration ?? null,
    is_active: data.isActive,
    display_order: data.displayOrder,
  };

  if (data.id) {
    const { error } = await supabase
      .from("delivery_methods")
      .update(fields)
      .eq("id", data.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("delivery_methods").insert(fields);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/delivery");
  return { message: "Delivery method saved." };
}

export async function deleteDeliveryMethod(
  id: string
): Promise<AdminActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const supabase = createClient();
  const { error } = await supabase.from("delivery_methods").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/delivery");
  return { message: "Delivery method deleted." };
}

// ------------------------------------------------------------
// Newsletter subscribers
// ------------------------------------------------------------

export async function toggleSubscriber(
  id: string,
  nextStatus: "active" | "unsubscribed"
): Promise<AdminActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const supabase = createClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({ status: nextStatus })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/subscribers");
  return { message: "Subscriber updated." };
}
