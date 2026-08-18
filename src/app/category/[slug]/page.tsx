import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CatalogView from "@/components/storefront/CatalogView";
import { getPaginatedProducts } from "@/services/products";
import { CATEGORY_META } from "@/lib/storefront/categories";
import {
  CATALOG_PAGE_SIZE,
  filtersFromUrlState,
  parseCatalogParams,
} from "@/lib/storefront/catalog-url";

// Category pages are fully driven by the path + query string,
// so they can be cached briefly between admin updates.
export const revalidate = 60;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const slug = params.slug;
  const categoryInfo = CATEGORY_META[slug];

  // Validate slug exists in our system
  if (!categoryInfo) {
    notFound();
  }

  const state = parseCatalogParams(searchParams);
  const filters = filtersFromUrlState(state, slug);
  const { items, total } = await getPaginatedProducts(
    filters,
    state.page,
    CATALOG_PAGE_SIZE
  );

  return (
    <div className="bg-brand-bg min-h-screen pb-20 md:pb-12 text-brand-charcoal">
      {/* Category Banner Hero */}
      <section className="relative w-full h-[35vh] md:h-[45vh] bg-brand-beige flex items-center justify-center overflow-hidden border-b border-brand-border/30">
        <Image
          src={categoryInfo.bannerImage}
          alt={categoryInfo.title}
          fill
          className="object-cover object-[center_30%] filter brightness-95"
        />
        <div className="absolute inset-0 bg-brand-charcoal/30" />
        <div className="relative z-10 text-center text-white px-4 max-w-2xl">
          <h1 className="font-serif text-3xl md:text-5xl font-light tracking-wide uppercase mb-3">
            {categoryInfo.title}
          </h1>
          <p className="font-sans text-xs md:text-sm text-brand-bg/90 tracking-wide max-w-lg mx-auto">
            {categoryInfo.description}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <Breadcrumbs items={[{ label: categoryInfo.title }]} />

        <CatalogView
          products={items}
          total={total}
          state={state}
          pageSize={CATALOG_PAGE_SIZE}
          basePath={`/category/${slug}`}
          fixedCategory={slug}
          subcategoryChips={categoryInfo.subcategories}
        />
      </div>
    </div>
  );
}
