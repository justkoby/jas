"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Heart, Star, ShoppingBag, ArrowRight } from "lucide-react";
import { useUI } from "@/context/UIContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Link from "next/link";

export default function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, setCartOpen, showToast } = useUI();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedColor, setSelectedColor] = useState<{ name: string; value: string } | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  // Sync state when product changes
  useEffect(() => {
    if (quickViewProduct) {
      setSelectedColor(quickViewProduct.colors[0] || null);
      setSelectedSize(quickViewProduct.sizes ? quickViewProduct.sizes[0] : "Standard");
      setQuantity(1);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const isWishlisted = isInWishlist(product.id);

  const handleAddToBag = () => {
    if (!selectedColor) return;
    addToCart(product, selectedColor, selectedSize, quantity);
    showToast(`Added ${quantity} x "${product.name}" to your bag!`);
    setQuickViewProduct(null); // Close modal
    setCartOpen(true); // Open cart drawer
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-charcoal/60 backdrop-blur-sm"
        onClick={() => setQuickViewProduct(null)}
      />

      {/* Modal Card */}
      <div className="bg-brand-bg rounded-lg shadow-soft w-full max-w-4xl overflow-hidden flex flex-col md:flex-row relative z-10 max-h-[90vh] md:max-h-none animate-fadeIn border border-brand-border">
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute right-4 top-4 p-2 rounded-full bg-white/80 hover:bg-white text-brand-charcoal hover:text-brand-burgundy transition-all duration-200 z-20 shadow"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Product Images (Left side) */}
        <div className="w-full md:w-1/2 aspect-[4/5] md:aspect-auto md:h-[550px] relative bg-brand-beige overflow-hidden">
          <Image
            src={product.images[0] || "/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Product Details (Right side) */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col justify-between h-[50vh] md:h-[550px] bg-white">
          <div>
            <span className="font-sans text-[10px] text-brand-taupe uppercase tracking-widest block mb-2">
              {product.subcategory}
            </span>
            <h2 className="font-serif text-2xl text-brand-charcoal mb-2 leading-tight">
              {product.name}
            </h2>

            {/* Ratings & Price */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4.5 w-4.5 ${
                        i < Math.floor(product.rating) ? "fill-current" : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-sans text-brand-taupe">({product.reviewCount} reviews)</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-sans font-bold text-xl text-brand-charcoal">
                GH₵{product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="font-sans text-sm text-brand-taupe line-through">
                  GH₵{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            <p className="font-sans text-sm text-brand-taupe leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Color Selector */}
            <div className="mb-5">
              <label className="font-sans text-xs font-bold uppercase tracking-wider text-brand-charcoal block mb-2">
                Color: {selectedColor?.name}
              </label>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center p-0.5 transition-all duration-200 ${
                      selectedColor?.name === color.name
                        ? "border-brand-burgundy scale-105"
                        : "border-transparent"
                    }`}
                  >
                    <span
                      className="w-full h-full rounded-full border border-black/10"
                      style={{ backgroundColor: color.value }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Variation Selector (Sizes/Volume) */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <label className="font-sans text-xs font-bold uppercase tracking-wider text-brand-charcoal block mb-2">
                  {product.variationType === "volume"
                    ? "Volume"
                    : product.variationType === "material"
                    ? "Material"
                    : "Size"}{" "}
                  : {selectedSize}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border text-xs font-sans rounded transition-all duration-200 ${
                        selectedSize === size
                          ? "border-brand-burgundy bg-brand-burgundy text-brand-bg font-semibold"
                          : "border-brand-border hover:border-brand-taupe text-brand-charcoal"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock status */}
            <div className="mb-6">
              <span className="font-sans text-xs">
                Availability:{" "}
                {product.stock > 0 ? (
                  <span className="text-emerald-600 font-semibold">In Stock ({product.stock} left)</span>
                ) : (
                  <span className="text-rose-600 font-semibold">Sold Out</span>
                )}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex gap-3 mt-6 border-t border-brand-border pt-6">
            <button
              onClick={handleAddToBag}
              disabled={product.stock === 0}
              className="flex-1 bg-brand-burgundy text-brand-bg py-3 px-6 rounded-full font-sans text-sm font-semibold tracking-wider hover:bg-brand-rose transition-colors duration-200 flex items-center justify-center gap-2 disabled:bg-brand-taupe disabled:cursor-not-allowed"
            >
              <ShoppingBag className="h-4.5 w-4.5" /> ADD TO BAG
            </button>
            <button
              onClick={() => toggleWishlist(product)}
              className="p-3 border border-brand-border rounded-full hover:text-brand-burgundy hover:border-brand-burgundy transition-all duration-200 bg-brand-bg shadow-sm"
              aria-label="Wishlist"
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? "fill-brand-burgundy text-brand-burgundy" : ""}`} />
            </button>
          </div>

          <div className="text-center mt-4">
            <Link
              href={`/product/${product.slug}`}
              onClick={() => setQuickViewProduct(null)}
              className="text-xs text-brand-taupe hover:text-brand-burgundy font-sans font-medium uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors"
            >
              View Full Details <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
