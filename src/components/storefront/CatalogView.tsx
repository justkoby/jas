"use client";

/**
 * Interactive catalogue shell shared by /shop and /category/[slug].
 * The server component fetches the current page of products; this
 * component only translates user intent into URL changes
 * (router.replace), so every filter/sort/page state is shareable
 * and server-rendered.
 */

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types";
import { ProductFilterOptions } from "@/services/products";
import ProductGrid from "@/components/ui/ProductGrid";
import FilterDrawer from "@/components/ui/FilterDrawer";
import {
  AVAILABLE_COLORS,
  AVAILABLE_SIZES,
  SHOP_CATEGORY_CHIPS,
} from "@/lib/storefront/categories";
import {
  CatalogUrlState,
  catalogQueryString,
  DEFAULT_MAX_PRICE,
} from "@/lib/storefront/catalog-url";

interface CatalogViewProps {
  products: Product[];
  total: number;
  state: CatalogUrlState;
  pageSize: number;
  /** Base path without query, e.g. "/shop" or "/category/clothing". */
  basePath: string;
  /** Locked category for /category/[slug] pages. */
  fixedCategory?: string;
  showCategoryChips?: boolean;
  subcategoryChips: string[];
}

export default function CatalogView({
  products,
  total,
  state,
  pageSize,
  basePath,
  fixedCategory,
  showCategoryChips = false,
  subcategoryChips,
}: CatalogViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const basePathForNav = basePath || pathname;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rangeStart = total === 0 ? 0 : (state.page - 1) * pageSize + 1;
  const rangeEnd = Math.min(state.page * pageSize, total);

  const navigate = (next: CatalogUrlState) => {
    router.replace(`${basePathForNav}${catalogQueryString(next)}`);
  };

  const update = (patch: Partial<CatalogUrlState>, resetPage = true) => {
    navigate({ ...state, ...patch, page: resetPage ? 1 : state.page });
  };

  // FilterDrawer speaks ProductFilterOptions — translate both ways.
  const filtersForDrawer: ProductFilterOptions = {
    category: fixedCategory ?? state.category,
    subcategory: state.sub,
    colors: state.colours,
    sizes: state.sizes,
    minPrice: 0,
    maxPrice: state.max ?? DEFAULT_MAX_PRICE,
    isSale: state.sale,
    isNew: state.fresh,
    sortBy: state.sort as ProductFilterOptions["sortBy"],
  };

  const handleDrawerApply = (next: ProductFilterOptions) => {
    update({
      sub: next.subcategory,
      colours: next.colors ?? [],
      sizes: next.sizes ?? [],
      max: next.maxPrice !== undefined && next.maxPrice < DEFAULT_MAX_PRICE ? next.maxPrice : undefined,
      sale: next.isSale,
      fresh: next.isNew,
    });
  };

  const activeFilterCount =
    state.colours.length + state.sizes.length + (state.sub ? 1 : 0);

  const handleResetAll = () => {
    navigate({
      category: fixedCategory ?? "all",
      colours: [],
      sizes: [],
      sort: "featured",
      page: 1,
    });
  };

  return (
    <>
      {/* Category Chips Carousel (shop page only) */}
      {showCategoryChips && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-6 -mx-4 px-4 md:mx-0 md:px-0">
          {SHOP_CATEGORY_CHIPS.map((cat) => {
            const isSelected = state.category === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => update({ category: cat.value, sub: undefined })}
                className={`px-6 py-2.5 rounded-full text-xs font-sans font-semibold tracking-wider uppercase border transition-all duration-200 flex-shrink-0 ${
                  isSelected
                    ? "bg-brand-burgundy border-brand-burgundy text-brand-bg"
                    : "bg-white border-brand-border text-brand-taupe hover:border-brand-taupe"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Subcategory chips (category pages) */}
      {subcategoryChips.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-4 mb-4 mt-2">
          {subcategoryChips.map((sub) => {
            const isSelected = state.sub === sub;
            return (
              <button
                key={sub}
                onClick={() =>
                  update({ sub: state.sub === sub ? undefined : sub })
                }
                className={`px-5 py-2 rounded-full text-xs font-sans font-semibold tracking-wider transition-colors ${
                  isSelected
                    ? "bg-brand-burgundy border border-brand-burgundy text-brand-bg"
                    : "bg-white border border-brand-border text-brand-taupe hover:border-brand-taupe"
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>
      )}

      {/* Action Bar (Filters trigger & Sort menu) */}
      <div className="flex justify-between items-center border-t border-b border-brand-border/60 py-4 mb-8 mt-4">
        {/* Filters Toggle */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 bg-white border border-brand-border rounded-full py-2.5 px-6 font-sans text-xs font-bold uppercase tracking-wider hover:border-brand-taupe active:scale-98 transition-all"
        >
          <SlidersHorizontal className="h-4 w-4 text-brand-charcoal" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-brand-burgundy text-brand-bg h-4.5 w-4.5 rounded-full flex items-center justify-center text-[9px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort Dropdown */}
        <div className="relative flex items-center gap-2 bg-white border border-brand-border rounded-full py-1 pl-4 pr-2.5 font-sans text-xs text-brand-taupe">
          <span className="font-semibold uppercase tracking-wider text-brand-charcoal">
            Sort:
          </span>
          <select
            value={state.sort}
            onChange={(e) => update({ sort: e.target.value })}
            className="bg-transparent pr-4 font-sans text-xs focus:outline-none cursor-pointer text-brand-taupe appearance-none font-medium h-8"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="best-selling">Best Selling</option>
          </select>
          <ChevronDown className="absolute right-3.5 h-3.5 w-3.5 pointer-events-none text-brand-taupe" />
        </div>
      </div>

      {/* Main Grid Content */}
      {products.length > 0 ? (
        <>
          <ProductGrid products={products} />

          {/* Pagination */}
          <div className="flex flex-col items-center gap-4 mt-12 md:mt-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => update({ page: state.page - 1 }, false)}
                disabled={state.page <= 1}
                aria-label="Previous page"
                className="p-2.5 rounded-full bg-white border border-brand-border text-brand-charcoal hover:border-brand-burgundy hover:text-brand-burgundy transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-sans text-xs text-brand-taupe font-medium tracking-wider uppercase">
                Page {state.page} of {totalPages}
              </span>
              <button
                onClick={() => update({ page: state.page + 1 }, false)}
                disabled={state.page >= totalPages}
                aria-label="Next page"
                className="p-2.5 rounded-full bg-white border border-brand-border text-brand-charcoal hover:border-brand-burgundy hover:text-brand-burgundy transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <span className="font-sans text-[10px] text-brand-taupe">
              Showing {rangeStart}&ndash;{rangeEnd} of {total}{" "}
              {total === 1 ? "product" : "products"}
            </span>
          </div>
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded border border-dashed border-brand-border/60 max-w-lg mx-auto">
          <p className="font-serif text-lg text-brand-charcoal mb-2">
            No products found
          </p>
          <p className="font-sans text-sm text-brand-taupe mb-6 max-w-sm mx-auto">
            We couldn&rsquo;t find any products matching your active filters.
            Try loosening your selections.
          </p>
          <button
            onClick={handleResetAll}
            className="bg-brand-burgundy text-brand-bg px-8 py-3 rounded-full font-sans text-xs font-bold tracking-widest uppercase hover:bg-brand-rose transition-colors duration-200"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Slideout Filter Menu */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filtersForDrawer}
        setFilters={handleDrawerApply}
        availableColors={AVAILABLE_COLORS}
        availableSizes={AVAILABLE_SIZES}
        availableSubcategories={subcategoryChips}
      />
    </>
  );
}
