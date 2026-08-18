"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Search, ShoppingBag, Heart, User } from "lucide-react";
import { useUI } from "@/context/UIContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function Header() {
  const { setMenuOpen, setSearchOpen, setCartOpen } = useUI();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`w-full z-30 transition-all duration-300 ${
        isSticky
          ? "fixed top-0 bg-brand-bg/85 backdrop-blur-md border-b border-brand-border shadow-sm"
          : "relative bg-brand-bg border-b border-brand-border/40"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
        {/* Mobile Left: Menu Icon */}
        <button
          onClick={() => setMenuOpen(true)}
          className="md:hidden p-2 text-brand-charcoal hover:text-brand-burgundy transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Brand Logo / Wordmark */}
        <div className="flex-shrink-0 absolute left-1/2 transform -translate-x-1/2 md:static md:translate-x-0">
          <Link href="/" className="flex items-center gap-1.5">
            <div className="relative w-[90px] h-[32px] md:w-[110px] md:h-[40px]">
              <Image
                src="/jas-logo.svg"
                alt="JAS Logo"
                fill
                priority
                className="object-contain"
                onError={(e) => {
                  // If logo is not found or fails to render, display a wordmark
                  const target = e.target as HTMLElement;
                  target.style.display = "none";
                }}
              />
            </div>
            {/* Fallback Wordmark style */}
            <span className="hidden md:hidden font-serif font-black text-2xl tracking-widest text-brand-charcoal select-none">
              JAS
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-sans text-[11px] font-semibold uppercase tracking-widest">
          <Link href="/shop?new=true" className="text-brand-charcoal hover:text-brand-burgundy transition-colors">
            New Arrivals
          </Link>
          <Link href="/category/clothing" className="text-brand-charcoal hover:text-brand-burgundy transition-colors">
            Clothing
          </Link>
          <Link href="/category/shoes" className="text-brand-charcoal hover:text-brand-burgundy transition-colors">
            Shoes
          </Link>
          <Link href="/category/bags-accessories" className="text-brand-charcoal hover:text-brand-burgundy transition-colors">
            Bags & Accessories
          </Link>
          <Link href="/category/beauty-fragrance" className="text-brand-charcoal hover:text-brand-burgundy transition-colors">
            Beauty & Fragrance
          </Link>
          <Link href="/category/home-living" className="text-brand-charcoal hover:text-brand-burgundy transition-colors">
            Home & Living
          </Link>
          <Link href="/category/sale" className="text-brand-burgundy font-bold hover:text-brand-rose transition-colors">
            Sale
          </Link>
        </nav>

        {/* Action Icons */}
        <div className="flex items-center gap-1.5 md:gap-3">
          {/* Search Icon */}
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 text-brand-charcoal hover:text-brand-burgundy transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5 md:h-5 md:w-5" />
          </button>

          {/* Account Icon (Desktop only) */}
          <Link
            href="/account"
            className="hidden md:block p-2 text-brand-charcoal hover:text-brand-burgundy transition-colors"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </Link>

          {/* Wishlist Icon (Desktop only) */}
          <Link
            href="/wishlist"
            className="hidden md:block p-2 text-brand-charcoal hover:text-brand-burgundy transition-colors relative"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brand-burgundy text-brand-bg text-[9px] font-sans font-bold h-4 w-4 rounded-full flex items-center justify-center border border-brand-bg">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Shopping Bag Icon */}
          <button
            onClick={() => setCartOpen(true)}
            className="p-2 text-brand-charcoal hover:text-brand-burgundy transition-colors relative"
            aria-label="Shopping Bag"
          >
            <ShoppingBag className="h-5 w-5 md:h-5 md:w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brand-burgundy text-brand-bg text-[9px] font-sans font-bold h-4 w-4 rounded-full flex items-center justify-center border border-brand-bg">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
      {/* Spacer to prevent page content jump when header becomes sticky */}
      {isSticky && <div className="h-16 md:h-20" />}
    </header>
  );
}
