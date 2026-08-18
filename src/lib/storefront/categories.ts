/**
 * Storefront category metadata. Kept in sync with the seeded
 * `categories` table; banner images are uploaded via the admin
 * dashboard in a later phase.
 */

export interface CategoryMeta {
  title: string;
  description: string;
  subcategories: string[];
  bannerImage: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  clothing: {
    title: "Clothing",
    description: "Effortless, premium silhouettes designed for comfort, ease, and modern style.",
    subcategories: ["Dresses", "Sets", "Tops", "Trousers"],
    bannerImage: "/placeholder.jpg",
  },
  shoes: {
    title: "Shoes",
    description: "Architectural shapes, soft leather mule sandals, and slide flats handmade by local artisans.",
    subcategories: ["Heels", "Flats"],
    bannerImage: "/placeholder.jpg",
  },
  "bags-accessories": {
    title: "Bags & Accessories",
    description: "Structured genuine leather bags, 18K gold earrings, and authentic hand-woven accents.",
    subcategories: ["Bags", "Jewellery", "Hair Accessories"],
    bannerImage: "/placeholder.jpg",
  },
  "beauty-fragrance": {
    title: "Beauty & Fragrance",
    description: "Signature amber perfumes, DAMASK rose mists, and cold-pressed organic skincare oils.",
    subcategories: ["Perfumes", "Mists", "Skincare"],
    bannerImage: "/placeholder.jpg",
  },
  "home-living": {
    title: "Home & Living",
    description: "Rechargeable dome lamps, Sandy ceramic stoneware, and hand-poured coconut-soy wax candles.",
    subcategories: ["Lighting", "Decor", "Diffusers & Candles"],
    bannerImage: "/placeholder.jpg",
  },
  sale: {
    title: "Sale",
    description: "Refresh your lifestyle. Selected wardrobe, fragrance, and home design pieces at private offer rates.",
    subcategories: [],
    bannerImage: "/placeholder.jpg",
  },
};

/** Shop page category chips (mirrors the header navigation). */
export const SHOP_CATEGORY_CHIPS = [
  { name: "All Shop", value: "all" },
  { name: "Clothing", value: "clothing" },
  { name: "Shoes", value: "shoes" },
  { name: "Bags & Accessories", value: "bags-accessories" },
  { name: "Beauty & Fragrance", value: "beauty-fragrance" },
  { name: "Home & Living", value: "home-living" },
  { name: "Sale", value: "sale" },
];

/** Facet options surfaced in the filter drawer. */
export const AVAILABLE_COLORS = [
  "Dusty Rose", "Burgundy", "Charcoal", "Oatmeal", "Sage Green", "Off-White",
  "Warm Taupe", "Noir", "Tan", "Black", "Cream", "Forest Green", "Olive",
  "Beige", "Kente Multi",
];

export const AVAILABLE_SIZES = [
  "XS", "S", "M", "L", "XL", "36", "37", "38", "39", "40", "41",
  "30ml", "50ml", "100ml", "150ml", "220g", "Small", "Large",
];

export const ALL_SUBCATEGORIES = [
  "Dresses", "Sets", "Heels", "Flats", "Bags", "Perfumes", "Mists",
  "Lighting", "Decor", "Diffusers & Candles", "Skincare", "Tops",
  "Trousers", "Jewellery", "Hair Accessories",
];
