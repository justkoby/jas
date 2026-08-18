import type { DbProductVariant } from "./database";

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  description: string;
  price: number; // In GHS (Ghana Cedis)
  originalPrice?: number; // Pre-discount price
  images: string[]; // Absolute paths or public image references
  colors: { name: string; value: string }[]; // Array of color name and hex code
  sizes?: string[]; // e.g. ["XS", "S", "M", "L"] or ["50ml", "100ml"] or ["Standard"]
  variationType?: 'size' | 'volume' | 'material' | 'scent'; // Determines labels in selectors
  stock: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isNew: boolean;
  isSale: boolean;
  details?: string[]; // Bullets for description drawer
  care?: string[]; // Bullets for care drawer
  variants?: DbProductVariant[]; // Present when loaded from Supabase
}

export interface CartItem {
  id: string; // Composite ID of product.id + color + size/variation
  product: Product;
  selectedColor: { name: string; value: string };
  selectedSizeOrVariation: string;
  quantity: number;
  variantId?: string; // Exact DB variant when purchased from Supabase data
}

export interface WishlistItem {
  product: Product;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingMethod: string;
  address: {
    fullName: string;
    email: string;
    phone: string;
    addressLine: string;
    city: string;
    region: string;
  };
}
