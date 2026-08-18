"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Eye, ShoppingBag, Star } from "lucide-react";
import { Product } from "@/types";
import { useWishlist } from "@/context/WishlistContext";
import { useUI } from "@/context/UIContext";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
  onCardClick?: () => void;
}

export default function ProductCard({ product, onCardClick }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { setQuickViewProduct, setCartOpen, showToast } = useUI();
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const favorited = isInWishlist(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    showToast(
      favorited
        ? `Removed "${product.name}" from your wishlist.`
        : `Added "${product.name}" to your wishlist.`,
      "info"
    );
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Use first color and first size/variation as default for quick add
    const defaultColor = product.colors[0] || { name: "Default", value: "#000" };
    const defaultSize = product.sizes ? product.sizes[0] : "Standard";
    addToCart(product, defaultColor, defaultSize, 1);
    showToast(`Added "${product.name}" to your bag!`);
    setCartOpen(true);
  };

  return (
    <div
      className="group bg-white rounded-md overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 flex flex-col relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Area */}
      <div className="relative aspect-[4/5] w-full bg-brand-beige overflow-hidden">
        <Link href={`/product/${product.slug}`} onClick={onCardClick} className="block w-full h-full">
          <Image
            src={product.images[0] || "/placeholder.jpg"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            priority={product.isFeatured}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.isSale && (
            <span className="bg-brand-burgundy text-brand-bg text-[10px] font-sans font-bold tracking-wider px-2 py-0.5 rounded uppercase">
              Sale
            </span>
          )}
          {product.isNew && (
            <span className="bg-brand-charcoal text-brand-bg text-[10px] font-sans font-bold tracking-wider px-2 py-0.5 rounded uppercase">
              New
            </span>
          )}
          {product.stock <= 3 && product.stock > 0 && (
            <span className="bg-brand-taupe text-brand-bg text-[10px] font-sans font-bold tracking-wider px-2 py-0.5 rounded uppercase">
              Low Stock
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-brand-taupe text-brand-bg text-[10px] font-sans font-bold tracking-wider px-2 py-0.5 rounded uppercase">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button Overlay */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/80 hover:bg-white text-brand-charcoal hover:text-brand-burgundy shadow-sm z-10 transition-colors duration-200"
          aria-label={favorited ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-4.5 w-4.5 ${favorited ? "fill-brand-burgundy text-brand-burgundy" : ""}`} />
        </button>

        {/* Desktop Action Buttons Overlay */}
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent p-4 flex gap-2 justify-center transition-all duration-300 md:opacity-0 md:group-hover:opacity-100 hidden md:flex ${
            isHovered ? "translate-y-0" : "translate-y-2"
          }`}
        >
          <button
            onClick={handleQuickView}
            className="flex items-center gap-1.5 bg-white text-brand-charcoal hover:bg-brand-burgundy hover:text-brand-bg px-4 py-2.5 rounded-full font-sans text-xs font-semibold tracking-wider transition-all duration-200 shadow-sm"
          >
            <Eye className="h-3.5 w-3.5" /> Quick View
          </button>
          {product.stock > 0 && (
            <button
              onClick={handleQuickAdd}
              className="flex items-center justify-center p-2.5 bg-brand-burgundy text-brand-bg hover:bg-brand-rose rounded-full transition-all duration-200 shadow-sm"
              aria-label="Quick add to bag"
            >
              <ShoppingBag className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Mobile Quick Add Icon (Always Visible for touch interface on product bottom right) */}
        {product.stock > 0 && (
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-2.5 right-2.5 md:hidden p-2.5 rounded-full bg-brand-burgundy/90 text-brand-bg shadow z-10 active:bg-brand-rose transition-colors"
            aria-label="Quick add to bag"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Info Area */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Subcategory */}
          <span className="font-sans text-[10px] text-brand-taupe uppercase tracking-widest block mb-1">
            {product.subcategory}
          </span>

          {/* Name */}
          <h3 className="font-serif text-sm text-brand-charcoal line-clamp-1 group-hover:text-brand-burgundy transition-colors duration-200">
            <Link href={`/product/${product.slug}`} onClick={onCardClick}>
              {product.name}
            </Link>
          </h3>

          {/* Rating — hidden until the product has reviews */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(product.rating) ? "fill-current" : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-sans text-brand-taupe">({product.reviewCount})</span>
            </div>
          )}
        </div>

        {/* Pricing & Colors */}
        <div className="mt-2.5 flex justify-between items-center gap-2 pt-2 border-t border-brand-beige">
          <div className="flex items-baseline gap-1.5">
            <span className="font-sans font-semibold text-sm text-brand-charcoal">
              GH₵{product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="font-sans text-xs text-brand-taupe line-through">
                GH₵{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Color Dots */}
          <div className="flex gap-1">
            {product.colors.slice(0, 3).map((col) => (
              <span
                key={col.name}
                className="w-2.5 h-2.5 rounded-full border border-brand-charcoal/10"
                style={{ backgroundColor: col.value }}
                title={col.name}
              />
            ))}
            {product.colors.length > 3 && (
              <span className="text-[8px] font-sans text-brand-taupe font-bold">
                +{product.colors.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
