"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertStaff, ForbiddenError } from "@/lib/admin/guard";
import { categorySchema, type CategoryInput } from "@/lib/validation/schemas";
import type { AdminActionResult } from "./products";

const ZERO_UUID = "00000000-0000-0000-0000-000000000000";

export async function saveCategory(
  input: CategoryInput
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
  void session;

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid category data." };
  }
  const data = parsed.data;

  // A category can never sit under itself.
  if (data.id && data.parentId === data.id) {
    return { error: "A category cannot be its own parent." };
  }

  const supabase = createClient();

  const { data: slugClash } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", data.slug)
    .neq("id", data.id ?? ZERO_UUID)
    .maybeSingle();
  if (slugClash) {
    return { error: "Another category already uses this slug." };
  }

  const fields = {
    name: data.name,
    slug: data.slug,
    parent_id: data.parentId,
    display_order: data.displayOrder,
    is_active: data.isActive,
    is_homepage_visible: data.isHomepageVisible,
  };

  if (data.id) {
    const { error } = await supabase
      .from("categories")
      .update(fields)
      .eq("id", data.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("categories").insert(fields);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/categories");
  return { message: "Category saved." };
}
