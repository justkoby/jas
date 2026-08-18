"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertStaff, ForbiddenError } from "@/lib/admin/guard";
import { orderStatusSchema, type OrderStatusInput } from "@/lib/validation/schemas";
import type { AdminActionResult } from "./products";

/**
 * Order writes bypass RLS by design (orders have no client write
 * policies), so this action re-verifies the staff role itself and
 * records an activity log entry for every status change.
 */
export async function updateOrder(
  input: OrderStatusInput
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

  const parsed = orderStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid order data." };
  }
  const data = parsed.data;

  const admin = createAdminClient();

  const { data: current } = await admin
    .from("orders")
    .select("status, payment_status")
    .eq("id", data.orderId)
    .maybeSingle();
  if (!current) {
    return { error: "Order not found." };
  }

  const { error } = await admin
    .from("orders")
    .update({
      status: data.status,
      payment_status: data.paymentStatus,
      admin_notes: data.adminNotes ?? undefined,
    })
    .eq("id", data.orderId);
  if (error) {
    return { error: error.message };
  }

  const changed =
    current.status !== data.status ||
    current.payment_status !== data.paymentStatus;
  if (changed) {
    const { error: logError } = await admin.from("admin_activity_logs").insert({
      admin_id: session.userId,
      action: "order_status_change",
      entity_type: "order",
      entity_id: data.orderId,
      metadata: {
        status_from: current.status,
        status_to: data.status,
        payment_from: current.payment_status,
        payment_to: data.paymentStatus,
      },
    });
    if (logError) {
      console.error("admin_activity_logs insert failed:", logError.message);
    }
  }

  revalidatePath("/admin", "layout");
  return { message: "Order updated." };
}
