"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useUI } from "@/context/UIContext";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const { isCartOpen, setCartOpen } = useUI();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    freeDeliveryThreshold,
    freeDeliveryProgress,
    isFreeDelivery
  } = useCart();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-brand-charcoal/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setCartOpen(false)}
      />

      {/* Cart Slider */}
      <div
        className={`fixed top-0 bottom-0 right-0 w-full sm:w-[440px] bg-brand-bg shadow-soft z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand-charcoal" />
            <span className="font-serif font-bold text-lg tracking-wider text-brand-charcoal uppercase">
              Shopping Bag ({cartItems.length})
            </span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-1 hover:text-brand-burgundy transition-colors"
          >
            <X className="h-6 w-6 text-brand-charcoal" />
          </button>
        </div>

        {/* Free Shipping Indicator */}
        {cartItems.length > 0 && (
          <div className="bg-brand-beige/50 px-6 py-4 border-b border-brand-border font-sans text-xs">
            {isFreeDelivery ? (
              <p className="text-brand-burgundy font-medium mb-1">
                🎉 Your order qualifies for free delivery in Accra!
              </p>
            ) : (
              <p className="text-brand-charcoal mb-1">
                Add <span className="font-semibold">GH₵{(freeDeliveryThreshold - cartSubtotal).toFixed(2)}</span> more for free delivery in Accra.
              </p>
            )}
            <div className="w-full bg-brand-border h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-brand-burgundy h-full transition-all duration-500 ease-out"
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-brand-border">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center py-10">
              <div className="w-16 h-16 rounded-full bg-brand-beige flex items-center justify-center mb-4">
                <ShoppingBag className="h-6 w-6 text-brand-taupe" />
              </div>
              <h3 className="font-serif text-lg text-brand-charcoal mb-2">Your bag is empty</h3>
              <p className="font-sans text-sm text-brand-taupe max-w-xs mb-6">
                Discover curated fashion, beauty, and home essentials to fill your bag.
              </p>
              <button
                onClick={() => setCartOpen(false)}
                className="bg-brand-burgundy text-brand-bg px-8 py-3 rounded-full font-sans text-sm font-semibold hover:bg-brand-rose transition-colors duration-200"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="py-4 flex gap-4">
                {/* Product Image */}
                <div className="relative w-20 aspect-[4/5] bg-brand-beige flex-shrink-0 overflow-hidden rounded border border-brand-border">
                  <Image
                    src={item.product.images[0] || "/placeholder.jpg"}
                    alt={item.product.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="font-serif text-sm text-brand-charcoal line-clamp-1">
                        <Link href={`/product/${item.product.slug}`} onClick={() => setCartOpen(false)}>
                          {item.product.name}
                        </Link>
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-brand-taupe hover:text-brand-burgundy p-1 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-x-2 gap-y-1 font-sans text-xs text-brand-taupe mt-1">
                      <span>Col: {item.selectedColor.name}</span>
                      <span>•</span>
                      <span>
                        {item.product.variationType === "volume"
                          ? "Vol"
                          : item.product.variationType === "material"
                          ? "Mat"
                          : "Size"}{" "}
                        : {item.selectedSizeOrVariation}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-brand-border rounded-full overflow-hidden bg-brand-beige">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-brand-taupe hover:text-brand-charcoal transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2 text-xs font-sans font-semibold text-brand-charcoal min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-brand-taupe hover:text-brand-charcoal transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Price */}
                    <span className="font-sans font-semibold text-sm text-brand-charcoal">
                      GH₵{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Panel */}
        {cartItems.length > 0 && (
          <div className="border-t border-brand-border px-6 py-6 bg-brand-bg flex flex-col gap-4">
            <div className="flex justify-between items-center font-sans text-sm">
              <span className="text-brand-taupe uppercase tracking-wider">Subtotal</span>
              <span className="font-semibold text-lg text-brand-charcoal">
                GH₵{cartSubtotal.toFixed(2)}
              </span>
            </div>
            <p className="font-sans text-[11px] text-brand-taupe leading-relaxed">
              Standard Accra shipping calculated at checkout. Free shipping applies above GH₵1,000.
            </p>

            <div className="flex flex-col gap-2.5 mt-2">
              <Link
                href="/checkout"
                onClick={() => setCartOpen(false)}
                className="bg-brand-burgundy text-brand-bg text-center py-3.5 rounded-full font-sans text-sm font-semibold tracking-wider hover:bg-brand-rose transition-colors duration-200"
              >
                PROCEED TO CHECKOUT
              </Link>
              <Link
                href="/cart"
                onClick={() => setCartOpen(false)}
                className="border border-brand-charcoal text-brand-charcoal text-center py-3 rounded-full font-sans text-sm font-semibold tracking-wider hover:bg-brand-charcoal hover:text-brand-bg transition-all duration-200"
              >
                VIEW SHOPPING BAG
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
