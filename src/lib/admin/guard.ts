import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type DbProfile, type UserRole } from "@/types/database";

/**
 * Authoritative admin guarding. The middleware performs the same
 * checks as a first line of defence; every admin page and server
 * action re-verifies the session and role here.
 */

export interface AdminSession {
  userId: string;
  profile: DbProfile;
}

const STAFF_ROLES: UserRole[] = ["staff", "admin", "super_admin"];

export function isStaffRole(role: UserRole | string): boolean {
  return (STAFF_ROLES as string[]).includes(role);
}

/** Returns the signed-in staff session, or null when absent/non-staff. */
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;
  return { userId: user.id, profile };
}

/** For admin pages: redirects anonymous visitors and non-staff users. */
export async function requireStaff(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/account/login?next=/admin");
  }
  if (!isStaffRole(session.profile.role)) {
    redirect("/");
  }
  return session;
}

/** Thrown by the assert helpers; server actions catch and surface it. */
export class ForbiddenError extends Error {
  constructor() {
    super("You do not have permission to do that.");
    this.name = "ForbiddenError";
  }
}

/** For server actions: throws instead of redirecting. */
export async function assertStaff(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session || !isStaffRole(session.profile.role)) {
    throw new ForbiddenError();
  }
  return session;
}

/** For server actions that require the top role (staff management). */
export async function assertSuperAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session || session.profile.role !== "super_admin") {
    throw new ForbiddenError();
  }
  return session;
}
