"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, CartItem } from "@/types";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, color: { name: string; value: string }, sizeOrVariation: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  freeDeliveryThreshold: number;
  freeDeliveryProgress: number;
  isFreeDelivery: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const freeDeliveryThreshold = 1000; // GH₵1,000

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("jas_cart");
      if (storedCart) {
        try {
          setCartItems(JSON.parse(storedCart));
        } catch (e) {
          console.error("Failed to parse cart items", e);
        }
      }
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      localStorage.setItem("jas_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  const addToCart = (
    product: Product,
    color: { name: string; value: string },
    sizeOrVariation: string,
    quantity = 1
  ) => {
    setCartItems((prevItems) => {
      // Create a unique compound key for item variation matching
      const itemId = `${product.id}-${color.name}-${sizeOrVariation}`;
      const existingItemIndex = prevItems.findIndex((item) => item.id === itemId);

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        const newQty = newItems[existingItemIndex].quantity + quantity;
        // Limit quantity to stock or a sensible max
        newItems[existingItemIndex].quantity = Math.min(newQty, product.stock);
        return newItems;
      } else {
        return [...prevItems, {
          id: itemId,
          product,
          selectedColor: color,
          selectedSizeOrVariation: sizeOrVariation,
          quantity: Math.min(quantity, product.stock)
        }];
      }
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === cartItemId
          ? { ...item, quantity: Math.min(quantity, item.product.stock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const isFreeDelivery = cartSubtotal >= freeDeliveryThreshold;
  const freeDeliveryProgress = Math.min((cartSubtotal / freeDeliveryThreshold) * 100, 100);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        freeDeliveryThreshold,
        freeDeliveryProgress,
        isFreeDelivery,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
