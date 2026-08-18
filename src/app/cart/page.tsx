"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import EmptyState from "@/components/ui/EmptyState";

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    freeDeliveryThreshold,
    freeDeliveryProgress,
    isFreeDelivery
  } = useCart();
  const { showToast } = useUI();

  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState("");

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "JASWELCOME") {
      setDiscountPercent(10); // 10% mock discount
      setAppliedPromo("JASWELCOME");
      showToast("Coupon 'JASWELCOME' applied! 10% discount has been subtracted.");
      setPromoCode("");
    } else {
      showToast("Invalid coupon code. Try 'JASWELCOME' for 10% off.", "info");
    }
  };

  const handleRemovePromo = () => {
    setDiscountPercent(0);
    setAppliedPromo("");
    showToast("Coupon removed.");
  };

  const discountAmount = (cartSubtotal * discountPercent) / 100;
  const finalSubtotal = cartSubtotal - discountAmount;

  if (cartItems.length === 0) {
    return (
      <div className="bg-brand-bg min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Breadcrumbs items={[{ label: "Shopping Bag" }]} />
          <div className="mt-8 bg-white border border-brand-border/40 rounded-lg shadow-card p-12">
            <EmptyState
              icon={ShoppingBag}
              title="Your Shopping Bag is Empty"
              description="Discover premium silhouettes, signature fragrances, and curated homeware to style your life."
              actionLabel="SHOP NEW ARRIVALS"
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
        <Breadcrumbs items={[{ label: "Shopping Bag" }]} />

        <h1 className="font-serif text-3xl font-light tracking-wide mt-4 mb-8">
          Shopping Bag
        </h1>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* 1. Cart Items List (Left Side) */}
          <div className="w-full lg:w-2/3 bg-white border border-brand-border/40 rounded-lg shadow-card p-6 md:p-8 space-y-6">
            {/* Free Shipping bar */}
            <div className="bg-brand-beige/30 border border-brand-border/50 rounded p-4 font-sans text-xs text-brand-taupe">
              {isFreeDelivery ? (
                <p className="text-brand-burgundy font-semibold">
                  🎉 Your order qualifies for free delivery in Accra!
                </p>
              ) : (
                <p>
                  Add <span className="font-semibold text-brand-charcoal">GH₵{(freeDeliveryThreshold - cartSubtotal).toFixed(2)}</span> more to qualify for free delivery in Accra.
                </p>
              )}
              <div className="w-full bg-brand-border/60 h-1.5 rounded-full overflow-hidden mt-2.5">
                <div
                  className="bg-brand-burgundy h-full transition-all duration-500 ease-out"
                  style={{ width: `${freeDeliveryProgress}%` }}
                />
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-brand-border/60">
              {cartItems.map((item) => (
                <div key={item.id} className="py-6 flex flex-col sm:flex-row gap-4 first:pt-0 last:pb-0">
                  {/* Image */}
                  <div className="relative w-24 aspect-[4/5] bg-brand-beige overflow-hidden rounded border border-brand-border flex-shrink-0 mx-auto sm:mx-0">
                    <Image
                      src={item.product.images[0] || "/placeholder.jpg"}
                      alt={item.product.name}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-serif text-base text-brand-charcoal hover:text-brand-burgundy transition-colors">
                            <Link href={`/product/${item.product.slug}`}>
                              {item.product.name}
                            </Link>
                          </h3>
                          <span className="font-sans text-[10px] text-brand-taupe uppercase tracking-widest block mt-0.5">
                            {item.product.subcategory}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            removeFromCart(item.id);
                            showToast(`Removed "${item.product.name}" from bag.`);
                          }}
                          className="text-brand-taupe hover:text-brand-burgundy p-1.5 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-x-3 gap-y-1 font-sans text-xs text-brand-taupe mt-2">
                        <span>Color: <span className="font-semibold text-brand-charcoal">{item.selectedColor.name}</span></span>
                        <span>•</span>
                        <span>
                          {item.product.variationType === "volume"
                            ? "Volume"
                            : item.product.variationType === "material"
                            ? "Material"
                            : "Size"}{" "}
                          : <span className="font-semibold text-brand-charcoal">{item.selectedSizeOrVariation}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-brand-border rounded-full overflow-hidden bg-brand-beige">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center text-brand-taupe hover:text-brand-charcoal transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-3 font-sans font-semibold text-xs text-brand-charcoal min-w-[28px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center text-brand-taupe hover:text-brand-charcoal transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Pricing */}
                      <div className="text-right">
                        <span className="font-sans font-bold text-base text-brand-charcoal block">
                          GH₵{(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <span className="font-sans text-[11px] text-brand-taupe">
                          GH₵{item.product.price.toFixed(2)} each
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Order Summary Panel (Right Side) */}
          <div className="w-full lg:w-1/3 bg-white border border-brand-border/40 rounded-lg shadow-card p-6 md:p-8 space-y-6">
            <h2 className="font-serif text-lg text-brand-charcoal tracking-wide border-b border-brand-border pb-4 uppercase">
              Summary
            </h2>

            {/* Calculations */}
            <div className="font-sans text-sm divide-y divide-brand-border/45">
              <div className="flex justify-between items-center py-3">
                <span className="text-brand-taupe">Subtotal</span>
                <span className="font-medium text-brand-charcoal">GH₵{cartSubtotal.toFixed(2)}</span>
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between items-center py-3 text-emerald-600">
                  <span>Discount ({discountPercent}%)</span>
                  <span>-GH₵{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center py-3">
                <span className="text-brand-taupe">Delivery</span>
                <span className="text-xs text-brand-taupe font-medium italic">Calculated at next step</span>
              </div>

              <div className="flex justify-between items-center py-4 text-base font-bold">
                <span className="text-brand-charcoal uppercase tracking-wider">Total</span>
                <span className="text-brand-charcoal text-lg">GH₵{finalSubtotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Promo Code Input */}
            <div>
              {appliedPromo ? (
                <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 text-emerald-800 rounded px-4 py-2 text-xs font-sans">
                  <span>Coupon &ldquo;{appliedPromo}&rdquo; Applied</span>
                  <button onClick={handleRemovePromo} className="underline text-brand-burgundy font-bold">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Discount Code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-brand-beige border border-brand-border rounded py-2 px-3.5 text-xs text-brand-charcoal focus:outline-none focus:border-brand-burgundy font-sans uppercase"
                  />
                  <button
                    type="submit"
                    className="bg-brand-charcoal text-brand-bg px-4 py-2 rounded text-xs font-sans font-bold hover:bg-brand-burgundy transition-colors"
                  >
                    APPLY
                  </button>
                </form>
              )}
              <span className="text-[10px] font-sans text-brand-taupe mt-1 block">
                Tip: Enter code <span className="font-semibold text-brand-burgundy uppercase">JASWELCOME</span> for 10% off.
              </span>
            </div>

            {/* Checkout CTAs */}
            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/checkout"
                className="bg-brand-burgundy text-brand-bg text-center py-4 rounded-full font-sans text-sm font-semibold tracking-wider hover:bg-brand-rose transition-colors duration-200 flex items-center justify-center gap-2 shadow"
              >
                PROCEED TO CHECKOUT <ArrowRight className="h-4.5 w-4.5" />
              </Link>
              <Link
                href="/shop"
                className="text-center font-sans text-xs text-brand-taupe hover:text-brand-burgundy underline tracking-wider font-semibold py-2"
              >
                CONTINUE SHOPPING
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
