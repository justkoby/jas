import { NextRequest, NextResponse } from "next/server";
import { getSearchSuggestions } from "@/services/products";

export interface SearchSuggestion {
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  category: string;
  subcategory: string;
}

/**
 * Debounced search suggestions for the storefront overlay.
 * Matching happens inside the parameterised `search_products`
 * RPC (ilike across name/description/sku/brand + category name).
 */
export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") ?? "").trim();

  if (!query) {
    return NextResponse.json({ suggestions: [] });
  }

  const products = await getSearchSuggestions(query, 8);

  const suggestions: SearchSuggestion[] = products.map((p) => ({
    name: p.name,
    slug: p.slug,
    price: p.price,
    originalPrice: p.originalPrice ?? null,
    image: p.images[0] ?? null,
    category: p.category,
    subcategory: p.subcategory,
  }));

  return NextResponse.json({ suggestions });
}
