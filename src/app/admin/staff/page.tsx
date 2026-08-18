import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/guard";
import { adminListProfiles } from "@/lib/admin/queries";
import { RoleManager } from "@/components/admin/RoleManager";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminStaffPage() {
  const session = await getAdminSession();
  // The layout already enforces staff; only super_admins see this page.
  if (!session || session.profile.role !== "super_admin") {
    redirect("/admin");
  }

  const profiles = await adminListProfiles();

  return (
    <>
      <PageHeader
        title="Staff"
        subtitle={`${profiles.length} staff account${profiles.length === 1 ? "" : "s"} — role changes take effect immediately.`}
      />
      <RoleManager profiles={profiles} currentUserId={session.userId} />
    </>
  );
}
