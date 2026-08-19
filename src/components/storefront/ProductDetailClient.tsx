"use client";

/**
 * Interactive half of the product detail page. The server
 * component fetches product + related items; this component
 * handles selections, stock display and cart interactions.
 */

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, Star, ShoppingBag, MessageSquare, ChevronDown, ArrowLeft } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useUI } from "@/context/UIContext";
import { findVariant } from "@/lib/storefront/map-product";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProductCarousel from "@/components/ui/ProductCarousel";
import QuantitySelector from "@/components/ui/QuantitySelector";
import ColorSelector from "@/components/ui/ColorSelector";
import SizeSelector from "@/components/ui/SizeSelector";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "233598010104";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

interface ProductDetailClientProps {
  product: Product;
  related: Product[];
}

export default function ProductDetailClient({
  product,
  related,
}: ProductDetailClientProps) {
  const router = useRouter();

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { setCartOpen, showToast } = useUI();

  // User Selections
  const [selectedColor, setSelectedColor] = useState<{ name: string; value: string } | null>(
    product.colors[0] ?? null
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes?.[0] ?? "Standard"
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Accordion Toggles
  const [openSection, setOpenSection] = useState<string | null>("desc");

  // Sticky add to bag trigger ref
  const mainBuyBtnRef = useRef<HTMLButtonElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Reset selections when navigating between products (same route).
  useEffect(() => {
    setSelectedColor(product.colors[0] ?? null);
    setSelectedSize(product.sizes?.[0] ?? "Standard");
    setQuantity(1);
    setActiveImageIndex(0);

    // Track Recently Viewed (localStorage)
    const stored = localStorage.getItem("jas_recent");
    let recent: string[] = [];
    if (stored) {
      try { recent = JSON.parse(stored); } catch {}
    }
    recent = [product.slug, ...recent.filter((s) => s !== product.slug)].slice(0, 4);
    localStorage.setItem("jas_recent", JSON.stringify(recent));
  }, [product.slug, product.colors, product.sizes]);

  // Handle intersection scroll for Mobile Sticky Buy Bar
  useEffect(() => {
    const handleScroll = () => {
      if (!mainBuyBtnRef.current) return;
      const rect = mainBuyBtnRef.current.getBoundingClientRect();
      // Show sticky bar when the main buy button scrolls out of view at the top
      setShowStickyBar(rect.bottom < 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [product]);

  const favorited = isInWishlist(product.id);

  // Live variant stock: when DB variants exist, availability is
  // resolved for the exact colour/size selection.
  const selectedVariant =
    selectedColor ? findVariant(product, selectedColor.name, selectedSize) : null;
  const effectiveStock = product.variants
    ? selectedVariant?.stock_quantity ?? 0
    : product.stock;
  const outOfStock = effectiveStock <= 0;

  const handleAddToBag = () => {
    if (!selectedColor || outOfStock) return;
    addToCart(product, selectedColor, selectedSize, quantity);
    showToast(`Added ${quantity} x "${product.name}" to your bag!`);
    setCartOpen(true);
  };

  const handleBuyNow = () => {
    if (!selectedColor || outOfStock) return;
    addToCart(product, selectedColor, selectedSize, quantity);
    router.push("/checkout");
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const gallery =
    product.images.length > 1
      ? product.images
      : [product.images[0] || "/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"];

  return (
    <div className="bg-brand-bg min-h-screen pb-24 md:pb-12 text-brand-charcoal">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <Breadcrumbs
          items={[
            { label: product.category, href: `/category/${product.category}` },
            { label: product.name }
          ]}
        />

        {/* Back Link on Mobile */}
        <button
          onClick={() => router.back()}
          className="md:hidden flex items-center gap-1.5 font-sans text-xs text-brand-taupe font-semibold tracking-wider uppercase mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Main Product Layout */}
        <div className="mt-2 flex flex-col md:flex-row gap-8 md:gap-16">
          {/* 1. Image Gallery */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            {/* Active Image Box */}
            <div className="relative aspect-[4/5] w-full bg-brand-beige overflow-hidden rounded-md border border-brand-border/40">
              <Image
                src={gallery[activeImageIndex]}
                alt={`${product.name} Gallery ${activeImageIndex + 1}`}
                fill
                priority
                className="object-cover"
              />

              {/* Mobile Swipe indicators */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 md:hidden">
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === activeImageIndex ? "w-4 bg-brand-burgundy" : "bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop Thumbnails */}
            <div className="hidden md:flex gap-3">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`relative w-20 h-24 rounded overflow-hidden bg-brand-beige border transition-all ${
                    i === activeImageIndex
                      ? "border-brand-burgundy scale-102 ring-1 ring-brand-burgundy"
                      : "border-brand-border hover:border-brand-taupe"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} Thumbnail ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 2. Details & Purchase form */}
          <div className="w-full md:w-1/2 flex flex-col">
            {/* Category / Badges */}
            <div className="flex justify-between items-center gap-2 mb-2">
              <span className="font-sans text-xs text-brand-taupe uppercase tracking-widest block">
                {product.subcategory}
              </span>
              <div className="flex gap-1.5">
                {product.isSale && (
                  <span className="bg-brand-burgundy text-brand-bg text-[9px] font-sans font-bold tracking-widest px-2 py-0.5 rounded uppercase">
                    Sale
                  </span>
                )}
                {product.isNew && (
                  <span className="bg-brand-charcoal text-brand-bg text-[9px] font-sans font-bold tracking-widest px-2 py-0.5 rounded uppercase">
                    New
                  </span>
                )}
              </div>
            </div>

            {/* Product Name */}
            <h1 className="font-serif text-2xl md:text-4xl font-light tracking-wide text-brand-charcoal leading-tight mb-2">
              {product.name}
            </h1>

            {/* Ratings & Reviews — hidden until reviews exist */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2.5 mb-5">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating) ? "fill-current" : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-sans text-brand-taupe">
                  {product.rating.toFixed(1)} • {product.reviewCount} Reviews
                </span>
              </div>
            )}

            {/* Pricing */}
            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-brand-border/60">
              <span className="font-sans font-bold text-2xl text-brand-charcoal">
                GH₵{product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="font-sans text-sm text-brand-taupe line-through">
                  GH₵{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="font-sans text-sm text-brand-taupe leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Color Selector */}
            {selectedColor && (
              <div className="mb-6">
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-brand-charcoal block mb-2">
                  Select Color: <span className="text-brand-burgundy">{selectedColor.name}</span>
                </span>
                <ColorSelector
                  colors={product.colors}
                  selectedColor={selectedColor}
                  onChange={setSelectedColor}
                />
              </div>
            )}

            {/* Size / Variation Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <SizeSelector
                  sizes={product.sizes}
                  selectedSize={selectedSize}
                  onChange={setSelectedSize}
                  variationType={product.variationType}
                />
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-brand-charcoal block mb-2">
                Quantity
              </span>
              <QuantitySelector
                quantity={quantity}
                max={Math.max(effectiveStock, 1)}
                onChange={setQuantity}
              />
            </div>

            {/* Availability (variant-aware when DB data is present) */}
            <div className="mb-8 font-sans text-xs text-brand-taupe">
              Status:{" "}
              {!outOfStock ? (
                <span className="text-emerald-600 font-semibold">
                  In Stock ({effectiveStock} {effectiveStock === 1 ? "item" : "items"} left)
                </span>
              ) : (
                <span className="text-rose-600 font-semibold">
                  {product.variants ? "This combination is sold out" : "Sold Out"}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                ref={mainBuyBtnRef}
                onClick={handleAddToBag}
                disabled={outOfStock}
                className="flex-1 bg-brand-charcoal text-brand-bg hover:bg-brand-burgundy py-3.5 px-8 rounded-full font-sans text-sm font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 disabled:bg-brand-taupe disabled:cursor-not-allowed shadow-sm h-12"
              >
                <ShoppingBag className="h-4 w-4" /> Add To Bag
              </button>
              <button
                onClick={handleBuyNow}
                disabled={outOfStock}
                className="flex-1 bg-brand-burgundy text-brand-bg hover:bg-brand-rose py-3.5 px-8 rounded-full font-sans text-sm font-semibold tracking-wider uppercase transition-colors disabled:bg-brand-taupe disabled:cursor-not-allowed shadow-sm h-12"
              >
                Buy Now
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className="p-3 border border-brand-border rounded-full hover:text-brand-burgundy hover:border-brand-burgundy transition-all bg-white shadow-sm flex items-center justify-center h-12 w-12"
                aria-label="Toggle Wishlist"
              >
                <Heart className={`h-5 w-5 ${favorited ? "fill-brand-burgundy text-brand-burgundy" : ""}`} />
              </button>
            </div>

            {/* Quick Fulfilment Details */}
            <div className="bg-brand-beige/35 border border-brand-border/60 rounded-md p-4 mb-8 space-y-2.5 font-sans text-xs text-brand-taupe leading-relaxed">
              <p>
                🛵 <span className="font-semibold text-brand-charcoal">Delivery Estimate</span>: Standard delivery in Accra (1-2 days) for GH₵50. Free above GH₵1,000. Outside Accra delivery (2-4 days) via transport.
              </p>
              <p>
                🏬 <span className="font-semibold text-brand-charcoal">Self-Pickup</span>: Select pickup at checkout, send your rider (MDS/Bolt) to our shop in East Legon.
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Hi JAS! I am inquiring about the product "${product.name}" (${SITE_URL}/product/${product.slug})`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-brand-burgundy hover:underline font-semibold mt-1"
              >
                <MessageSquare className="h-4 w-4 fill-current" /> Have questions? Enquire via WhatsApp
              </a>
            </div>

            {/* Expandable Accordion Sections */}
            <div className="border-t border-brand-border/60 divide-y divide-brand-border/60">
              {/* Accordion 1: Description */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleSection("desc")}
                  className="w-full flex justify-between items-center font-sans text-xs font-bold uppercase tracking-wider text-brand-charcoal"
                >
                  Description
                  <ChevronDown className={`h-4 w-4 text-brand-taupe transform transition-transform ${openSection === "desc" ? "rotate-180" : ""}`} />
                </button>
                {openSection === "desc" && (
                  <div className="mt-3 font-sans text-xs text-brand-taupe leading-relaxed space-y-2">
                    <p className="whitespace-pre-line">{product.description}</p>
                  </div>
                )}
              </div>

              {/* Accordion 2: Details / Specs */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleSection("details")}
                  className="w-full flex justify-between items-center font-sans text-xs font-bold uppercase tracking-wider text-brand-charcoal"
                >
                  Details & Materials
                  <ChevronDown className={`h-4 w-4 text-brand-taupe transform transition-transform ${openSection === "details" ? "rotate-180" : ""}`} />
                </button>
                {openSection === "details" && (
                  <ul className="mt-3 font-sans text-xs text-brand-taupe leading-relaxed list-disc pl-4 space-y-1.5">
                    {product.details?.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    )) || (
                      <>
                        <li>Premium category selection</li>
                        <li>Sourced with careful details</li>
                        <li>Exclusively available at JAS</li>
                      </>
                    )}
                  </ul>
                )}
              </div>

              {/* Accordion 3: Care Instructions */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleSection("care")}
                  className="w-full flex justify-between items-center font-sans text-xs font-bold uppercase tracking-wider text-brand-charcoal"
                >
                  Care Instructions
                  <ChevronDown className={`h-4 w-4 text-brand-taupe transform transition-transform ${openSection === "care" ? "rotate-180" : ""}`} />
                </button>
                {openSection === "care" && (
                  <ul className="mt-3 font-sans text-xs text-brand-taupe leading-relaxed list-disc pl-4 space-y-1.5">
                    {product.care?.map((careItem, idx) => (
                      <li key={idx}>{careItem}</li>
                    )) || (
                      <>
                        <li>Store in dry, cool settings</li>
                        <li>Wipe clean with a lint-free dry cloth</li>
                        <li>Keep away from intense moisture</li>
                      </>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Carousel */}
        {related.length > 0 && (
          <section className="pt-16 mt-16 border-t border-brand-border/60">
            <h2 className="font-serif text-2xl font-light mb-8 text-center md:text-left">
              You May Also Like
            </h2>
            <ProductCarousel products={related} />
          </section>
        )}
      </div>

      {/* MOBILE STICKY BUY BAR (Rendered at bottom of screen when main buttons are out of view) */}
      <div
        className={`md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-brand-border p-3.5 z-20 flex items-center justify-between gap-3 shadow-lg transform transition-all duration-300 ${
          showStickyBar ? "translate-y-0 opacity-100 animate-slideUp" : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-2 max-w-[55%]">
          <div className="relative w-10 aspect-[4/5] bg-brand-beige flex-shrink-0 overflow-hidden rounded">
            <Image
              src={product.images[0] || "/placeholder.jpg"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="overflow-hidden">
            <p className="font-serif text-xs text-brand-charcoal truncate">{product.name}</p>
            <p className="font-sans text-[11px] text-brand-burgundy font-bold">
              GH₵{product.price.toFixed(2)}
            </p>
          </div>
        </div>
        <button
          onClick={handleAddToBag}
          disabled={outOfStock}
          className="flex-1 bg-brand-burgundy text-brand-bg py-2.5 px-4 rounded-full font-sans text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow disabled:bg-brand-taupe disabled:cursor-not-allowed"
        >
          <ShoppingBag className="h-3.5 w-3.5" /> Add to Bag
        </button>
      </div>
    </div>
  );
}
