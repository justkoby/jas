import Link from "next/link";
import { adminCategoryRows } from "@/lib/admin/queries";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  const categories = await adminCategoryRows();

  return (
    <>
      <PageHeader
        title="New product"
        subtitle="Create the product first, then upload images on its page."
        action={
          <Link
            href="/admin/products"
            className="font-sans text-sm font-semibold text-brand-burgundy hover:text-brand-charcoal transition-colors"
          >
            Back to products
          </Link>
        }
      />
      <ProductForm mode="create" categories={categories} />
    </>
  );
}
