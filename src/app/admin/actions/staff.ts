"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertSuperAdmin, ForbiddenError } from "@/lib/admin/guard";
import { roleChangeSchema, type RoleChangeInput } from "@/lib/validation/schemas";
import type { AdminActionResult } from "./products";

/**
 * Role changes rely on the `profiles_update_super_admin` RLS policy,
 * so the cookie client is used — the policy itself enforces the role.
 * The action additionally re-verifies the role and blocks self-edits.
 */
export async function updateProfileRole(
  input: RoleChangeInput
): Promise<AdminActionResult> {
  let session;
  try {
    session = await assertSuperAdmin();
  } catch (error) {
    return {
      error:
        error instanceof ForbiddenError
          ? error.message
          : "You are not authorised to do that.",
    };
  }

  const parsed = roleChangeSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid role change." };
  }
  const data = parsed.data;

  if (data.profileId === session.userId) {
    return { error: "You cannot change your own role." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: data.role })
    .eq("id", data.profileId);
  if (error) return { error: error.message };

  revalidatePath("/admin/staff");
  return { message: "Role updated." };
}
