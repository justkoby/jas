import type { ReactNode } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { requireStaff } from "@/lib/admin/guard";
import { AdminShell } from "@/components/admin/AdminShell";
import { NotConfigured } from "@/components/admin/NotConfigured";

export const dynamic = "force-dynamic";

/**
 * Admin area layout. Unconfigured projects see the setup guide;
 * configured projects pass through the authoritative role gate
 * (middleware performs the same checks earlier as a first pass).
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return <NotConfigured />;
  }

  const session = await requireStaff();

  return (
    <AdminShell role={session.profile.role} name={session.profile.full_name}>
      {children}
    </AdminShell>
  );
}
