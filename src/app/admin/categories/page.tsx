import { adminCategoryRows } from "@/lib/admin/queries";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const rows = await adminCategoryRows();

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Top-level categories and their subcategories."
      />
      <CategoryManager rows={rows} />
    </>
  );
}
