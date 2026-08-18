"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const emailSchema = z.string().email("Please enter a valid email address.");

export interface NewsletterResult {
  error?: string;
  message?: string;
}

export async function subscribeNewsletter(
  formData: FormData
): Promise<NewsletterResult> {
  const parsed = emailSchema.safeParse(
    String(formData.get("email") ?? "").trim().toLowerCase()
  );
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid email." };
  }

  if (!isSupabaseConfigured()) {
    // Storefront runs without a database — accept gracefully.
    return { message: "Welcome to the JAS List! Check your inbox soon." };
  }

  // Inserts happen with the service role: no anon insert policy
  // exists on newsletter_subscribers (RLS blocks public writes).
  const supabase = createAdminClient();
  const { error } = await supabase.from("newsletter_subscribers").upsert(
    { email: parsed.data, status: "active", source: "homepage" },
    { onConflict: "email", ignoreDuplicates: true }
  );

  if (error) {
    return { error: "Could not subscribe right now. Please try again." };
  }

  return { message: "Welcome to the JAS List! Check your inbox soon." };
}
