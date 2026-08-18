/**
 * URL <-> filter state helpers for the shop/category catalogues.
 * All filtering, sorting and pagination is driven by the query
 * string so pages stay server-rendered, shareable and cacheable.
 *
 * Params: ?category=&sub=&colour=a,b&size=a,b&max=2000&sale=1&new=1
 *         &sort=&page=&q=
 */

import { ProductFilterOptions } from "@/services/products";

export const CATALOG_PAGE_SIZE = 12;
export const DEFAULT_MAX_PRICE = 2000;

export interface CatalogUrlState {
  category: string; // "all" for the whole shop
  sub?: string;
  colours: string[];
  sizes: string[];
  max?: number;
  sale?: boolean;
  fresh?: boolean; // "new" is reserved in some contexts; URL param stays `new`
  sort: string;
  page: number;
  q?: string;
}

const VALID_SORTS = [
  "featured",
  "newest",
  "price-low-high",
  "price-high-low",
  "best-selling",
];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function list(value: string | string[] | undefined): string[] {
  const raw = first(value);
  if (!raw) return [];
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function parseCatalogParams(
  searchParams: Record<string, string | string[] | undefined>
): CatalogUrlState {
  const page = Math.max(1, parseInt(first(searchParams.page) ?? "1", 10) || 1);
  const sort = first(searchParams.sort) ?? "featured";
  const maxRaw = first(searchParams.max);
  const max = maxRaw !== undefined ? parseInt(maxRaw, 10) : undefined;

  return {
    category: first(searchParams.category)?.toLowerCase() ?? "all",
    sub: first(searchParams.sub) || undefined,
    colours: list(searchParams.colour),
    sizes: list(searchParams.size),
    max: Number.isFinite(max) && (max as number) < DEFAULT_MAX_PRICE ? (max as number) : undefined,
    sale: first(searchParams.sale) === "1" || undefined,
    fresh: first(searchParams.new) === "1" || undefined,
    sort: VALID_SORTS.includes(sort) ? sort : "featured",
    page,
    q: first(searchParams.q)?.trim() || undefined,
  };
}

export function catalogQueryString(state: CatalogUrlState): string {
  const params = new URLSearchParams();
  if (state.category && state.category !== "all") params.set("category", state.category);
  if (state.sub) params.set("sub", state.sub);
  if (state.colours.length > 0) params.set("colour", state.colours.join(","));
  if (state.sizes.length > 0) params.set("size", state.sizes.join(","));
  if (state.max !== undefined) params.set("max", String(state.max));
  if (state.sale) params.set("sale", "1");
  if (state.fresh) params.set("new", "1");
  if (state.sort && state.sort !== "featured") params.set("sort", state.sort);
  if (state.page > 1) params.set("page", String(state.page));
  if (state.q) params.set("q", state.q);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** Converts URL state into the service-layer filter options. */
export function filtersFromUrlState(
  state: CatalogUrlState,
  fixedCategory?: string
): ProductFilterOptions {
  const category = fixedCategory ?? state.category;
  return {
    category: category === "all" ? undefined : category,
    subcategory: state.sub,
    search: state.q,
    maxPrice: state.max ?? DEFAULT_MAX_PRICE,
    minPrice: 0,
    colors: state.colours,
    sizes: state.sizes,
    isSale: state.sale,
    isNew: state.fresh,
    sortBy: state.sort as ProductFilterOptions["sortBy"],
  };
}
