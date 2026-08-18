import { adminListDeliveryMethods } from "@/lib/admin/queries";
import { DeliveryManager } from "@/components/admin/DeliveryManager";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminDeliveryPage() {
  const methods = await adminListDeliveryMethods();

  return (
    <>
      <PageHeader
        title="Delivery methods"
        subtitle="Options shown to customers at checkout."
      />
      <DeliveryManager methods={methods} />
    </>
  );
}
