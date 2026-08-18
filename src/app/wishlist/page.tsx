"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import { Product } from "@/types";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import EmptyState from "@/components/ui/EmptyState";

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { setCartOpen, showToast } = useUI();

  const handleMoveToBag = (product: Product) => {
    // Select defaults
    const color = product.colors[0] || { name: "Default", value: "#000" };
    const size = product.sizes ? product.sizes[0] : "Standard";
    
    addToCart(product, color, size, 1);
    removeFromWishlist(product.id);
    showToast(`Moved "${product.name}" to your shopping bag.`);
    setCartOpen(true);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="bg-brand-bg min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Breadcrumbs items={[{ label: "Wishlist" }]} />
          <div className="mt-8 bg-white border border-brand-border/40 rounded-lg shadow-card p-12">
            <EmptyState
              icon={Heart}
              title="Your Wishlist is Empty"
              description="Save your favorite pieces here to monitor stock, sizes, and purchase them later."
              actionLabel="BROWSE COLLECTIONS"
              actionHref="/shop"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg min-h-screen pb-20 md:pb-12 text-brand-charcoal">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <Breadcrumbs items={[{ label: "Wishlist" }]} />

        <h1 className="font-serif text-3xl font-light tracking-wide mt-4 mb-8">
          My Wishlist
        </h1>

        {/* Wishlist Items Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
          {wishlistItems.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-md overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 flex flex-col relative"
            >
              {/* Product Image Area */}
              <div className="relative aspect-[4/5] w-full bg-brand-beige overflow-hidden">
                <Link href={`/product/${product.slug}`} className="block w-full h-full">
                  <Image
                    src={product.images[0] || "/placeholder.jpg"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-102"
                  />
                </Link>

                {/* Remove button */}
                <button
                  onClick={() => {
                    removeFromWishlist(product.id);
                    showToast(`Removed "${product.name}" from wishlist.`, "info");
                  }}
                  className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/80 hover:bg-white text-brand-charcoal hover:text-brand-burgundy shadow-sm z-10 transition-colors duration-200"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Info Area */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="font-sans text-[10px] text-brand-taupe uppercase tracking-widest block mb-1">
                    {product.subcategory}
                  </span>
                  <h3 className="font-serif text-sm text-brand-charcoal line-clamp-1 group-hover:text-brand-burgundy transition-colors duration-200">
                    <Link href={`/product/${product.slug}`}>{product.name}</Link>
                  </h3>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="font-sans font-semibold text-sm text-brand-charcoal">
                      GH₵{product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="font-sans text-xs text-brand-taupe line-through">
                        GH₵{product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Move to Bag CTA Button */}
                <button
                  onClick={() => handleMoveToBag(product)}
                  disabled={product.stock === 0}
                  className="w-full bg-brand-charcoal hover:bg-brand-burgundy text-brand-bg py-2.5 px-4 rounded-full font-sans text-xs font-semibold uppercase tracking-wider transition-colors mt-4 flex items-center justify-center gap-1.5 disabled:bg-brand-taupe disabled:cursor-not-allowed shadow-sm"
                >
                  <ShoppingBag className="h-3.5 w-3.5" /> Move to Bag
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
