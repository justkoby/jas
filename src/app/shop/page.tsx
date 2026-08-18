import React from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CatalogView from "@/components/storefront/CatalogView";
import { getPaginatedProducts } from "@/services/products";
import {
  ALL_SUBCATEGORIES,
  SHOP_CATEGORY_CHIPS,
} from "@/lib/storefront/categories";
import {
  CATALOG_PAGE_SIZE,
  filtersFromUrlState,
  parseCatalogParams,
} from "@/lib/storefront/catalog-url";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const state = parseCatalogParams(searchParams);
  const filters = filtersFromUrlState(state);
  const { items, total } = await getPaginatedProducts(
    filters,
    state.page,
    CATALOG_PAGE_SIZE
  );

  const activeChip = SHOP_CATEGORY_CHIPS.find((c) => c.value === state.category);
  const title = state.q
    ? `Search: “${state.q}”`
    : activeChip?.name ?? "Shop Catalogue";

  return (
    <div className="bg-brand-bg min-h-screen pb-20 md:pb-12 text-brand-charcoal">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <Breadcrumbs items={[{ label: "Shop" }]} />

        {/* Page Title & Stats */}
        <div className="mt-4 mb-8 text-center md:text-left flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-light tracking-wide">
              {title}
            </h1>
            <p className="font-sans text-xs text-brand-taupe mt-1 tracking-wider uppercase">
              JAS Curated Lifestyle Shop
            </p>
          </div>
          <span className="font-sans text-xs text-brand-taupe font-medium">
            {total} {total === 1 ? "product" : "products"}
          </span>
        </div>

        <CatalogView
          products={items}
          total={total}
          state={state}
          pageSize={CATALOG_PAGE_SIZE}
          basePath="/shop"
          showCategoryChips
          subcategoryChips={ALL_SUBCATEGORIES}
        />
      </div>
    </div>
  );
}
