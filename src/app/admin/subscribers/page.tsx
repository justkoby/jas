import { adminListSubscribers } from "@/lib/admin/queries";
import { SubscriberList } from "@/components/admin/SubscriberList";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  const subscribers = await adminListSubscribers();
  const activeCount = subscribers.filter((s) => s.status === "active").length;

  return (
    <>
      <PageHeader
        title="Newsletter subscribers"
        subtitle={`${activeCount} active of ${subscribers.length} total`}
      />
      <SubscriberList subscribers={subscribers} />
    </>
  );
}
