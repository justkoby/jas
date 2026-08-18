import { adminListDiscounts } from "@/lib/admin/queries";
import { DiscountManager } from "@/components/admin/DiscountManager";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage() {
  const discounts = await adminListDiscounts();

  return (
    <>
      <PageHeader
        title="Discount codes"
        subtitle={`${discounts.length} code${discounts.length === 1 ? "" : "s"}`}
      />
      <DiscountManager discounts={discounts} />
    </>
  );
}
