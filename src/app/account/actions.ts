"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileSchema,
} from "@/lib/validation/schemas";

export interface ActionResult {
  error?: string;
  message?: string;
  role?: string;
}

const GENERIC_AUTH_ERROR =
  "We could not complete that request. Please check your details and try again.";

/** Maps raw Supabase errors to safe, generic customer messages. */
function friendlyAuthError(error: { message: string } | null): string {
  if (!error) return GENERIC_AUTH_ERROR;
  const msg = error.message.toLowerCase();

  if (msg.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }
  if (msg.includes("email not confirmed")) {
    return "Please confirm your email before signing in. Check your inbox for the confirmation link.";
  }
  if (msg.includes("already registered") || msg.includes("already been registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (msg.includes("rate limit") || msg.includes("too many")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (msg.includes("password should be at least")) {
    return "Password must be at least 6 characters.";
  }
  return GENERIC_AUTH_ERROR;
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function signIn(formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Authentication is not configured yet. Please try again later." };
  }

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_AUTH_ERROR };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: friendlyAuthError(error) };
  }

  // Let the login page route staff straight to the dashboard.
  let role: string | undefined;
  if (data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();
    role = profile?.role;
  }

  revalidatePath("/", "layout");
  return { message: "Signed in successfully.", role };
}

export async function signUp(formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Authentication is not configured yet. Please try again later." };
  }

  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_AUTH_ERROR };
  }

  const supabase = createClient();
  // The database trigger creates the profile with the `customer`
  // role — the client can never influence the role.
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${siteUrl()}/auth/callback?next=/account`,
    },
  });

  if (error) {
    return { error: friendlyAuthError(error) };
  }

  revalidatePath("/", "layout");

  // Email confirmation required — no session yet.
  if (!data.session) {
    return {
      message:
        "Account created! Check your inbox and confirm your email to finish signing in.",
    };
  }

  return { message: "Account created successfully." };
}

export async function signOut(): Promise<ActionResult> {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { message: "Signed out." };
}

export async function requestPasswordReset(
  formData: FormData
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Authentication is not configured yet. Please try again later." };
  }

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_AUTH_ERROR };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl()}/auth/callback?next=/account/reset-password`,
  });

  if (error) {
    return { error: friendlyAuthError(error) };
  }

  // Always return the same message — never reveal whether an
  // email address is registered.
  return {
    message: "If an account exists for that email, a reset link has been sent.",
  };
}

export async function resetPassword(formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Authentication is not configured yet. Please try again later." };
  }

  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_AUTH_ERROR };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: friendlyAuthError(error) };
  }

  return { message: "Password updated successfully." };
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_AUTH_ERROR };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to update your profile." };
  }

  // RLS guarantees users can only update their own profile and
  // can never change their role.
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Could not update your profile. Please try again." };
  }

  revalidatePath("/account");
  return { message: "Profile updated." };
}
