import Link from "next/link";
import { notFound } from "next/navigation";
import { adminCategoryRows, adminGetProduct } from "@/lib/admin/queries";
import { ProductForm } from "@/components/admin/ProductForm";
import { ImageManager } from "@/components/admin/ImageManager";
import { Banner, PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminEditProductPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [aggregate, categories] = await Promise.all([
    adminGetProduct(params.id),
    adminCategoryRows(),
  ]);

  if (!aggregate) {
    notFound();
  }

  const saved = searchParams.saved === "1";

  return (
    <>
      <PageHeader
        title={aggregate.product.name}
        subtitle={`/${aggregate.product.slug}`}
        action={
          <div className="flex items-center gap-4">
            <Link
              href={`/product/${aggregate.product.slug}`}
              className="font-sans text-sm font-semibold text-brand-burgundy hover:text-brand-charcoal transition-colors"
            >
              View in store
            </Link>
            <Link
              href="/admin/products"
              className="font-sans text-sm font-semibold text-brand-taupe hover:text-brand-charcoal transition-colors"
            >
              Back to products
            </Link>
          </div>
        }
      />

      {saved ? <Banner kind="saved" text="Product saved." /> : null}

      <div className="space-y-6">
        <ProductForm
          mode="edit"
          productId={aggregate.product.id}
          categories={categories}
          initial={aggregate}
        />
        <ImageManager
          productId={aggregate.product.id}
          initialImages={aggregate.images}
        />
      </div>
    </>
  );
}
