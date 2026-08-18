/**
 * Maps a database product aggregate (from the `search_products`
 * RPC or the single-product nested select) into the storefront
 * `Product` shape, so ProductCard, carousels and drawers need no
 * redesign.
 */

import { Product } from "@/types";
import { DbProduct, DbProductVariant } from "@/types/database";
import { pesewasToGhs } from "@/lib/format/money";
import { publicStorageUrl } from "@/lib/supabase/config";
import { colorHex } from "./color-map";

const PLACEHOLDER_IMAGE = "/placeholder.jpg";

const VARIATION_TYPE_BY_OPTION: Record<string, Product["variationType"]> = {
  size: "size",
  volume: "volume",
  material: "material",
  scent: "scent",
};

function mapImages(db: DbProduct): string[] {
  const urls = db.images
    .map((image) =>
      image.storage_path
        ? publicStorageUrl("product-images", image.storage_path)
        : PLACEHOLDER_IMAGE
    );
  // Dedupe consecutive placeholders (seed rows all point at one file).
  const deduped = urls.filter((url, i) => url !== PLACEHOLDER_IMAGE || i === 0);
  return deduped.length > 0 ? deduped : [PLACEHOLDER_IMAGE];
}

function cheapestVariant(variants: DbProductVariant[]): DbProductVariant | null {
  if (variants.length === 0) return null;
  return variants.reduce((min, v) => (v.price < min.price ? v : min));
}

export function mapDbProduct(db: DbProduct): Product {
  const colourOption = db.options.find(
    (o) => o.name.toLowerCase() === "colour"
  );
  const secondOption = db.options.find(
    (o) => o.name.toLowerCase() !== "colour"
  );

  const colors = (colourOption?.values ?? []).map((v) => ({
    name: v.value,
    value: colorHex(v.value),
  }));

  const activeVariants = db.variants.filter((v) => v.is_active);
  const cheapest = cheapestVariant(activeVariants);

  const price = cheapest
    ? pesewasToGhs(cheapest.price)
    : pesewasToGhs(db.base_price);
  const compareAt = db.compare_at_price ?? cheapest?.compare_at_price ?? null;
  const originalPrice =
    compareAt !== null && compareAt > 0 ? pesewasToGhs(compareAt) : undefined;

  const stock = db.track_inventory
    ? activeVariants.reduce((sum, v) => sum + v.stock_quantity, 0)
    : Infinity;

  const parentSlug = db.category.parent?.slug ?? null;

  return {
    id: db.id,
    name: db.name,
    slug: db.slug,
    // Storefront expects the parent slug here (e.g. "clothing").
    category: parentSlug ?? db.category.slug,
    // ...and the child category name as the subcategory.
    subcategory: db.category.name,
    description: db.description ?? db.short_description ?? "",
    price,
    originalPrice,
    images: mapImages(db),
    colors,
    sizes: secondOption ? secondOption.values.map((v) => v.value) : undefined,
    variationType: secondOption
      ? VARIATION_TYPE_BY_OPTION[secondOption.name.toLowerCase()] ?? "size"
      : "size",
    stock,
    // Reviews arrive in a later phase.
    rating: 0,
    reviewCount: 0,
    isFeatured: db.is_featured,
    isNew: db.is_new_arrival,
    isSale: compareAt !== null && compareAt > db.base_price,
    variants: activeVariants,
  };
}

/**
 * Finds the exact variant matching a colour + size/variation
 * selection. Used by the product page for live stock display.
 */
export function findVariant(
  product: Product,
  colourName: string,
  secondValue: string
): DbProductVariant | null {
  if (!product.variants) return null;
  return (
    product.variants.find((v) =>
      v.option_values.every((ov) => {
        const name = ov.option_name.toLowerCase();
        return name === "colour" ? ov.value === colourName : ov.value === secondValue;
      })
    ) ?? null
  );
}
