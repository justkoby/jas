"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, Search, Heart, ShoppingBag } from "lucide-react";
import { useUI } from "@/context/UIContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { setSearchOpen, setCartOpen } = useUI();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const navItems = [
    {
      label: "Home",
      icon: Home,
      href: "/",
      onClick: null,
    },
    {
      label: "Shop",
      icon: Grid,
      href: "/shop",
      onClick: null,
    },
    {
      label: "Search",
      icon: Search,
      href: "#",
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        setSearchOpen(true);
      },
    },
    {
      label: "Wishlist",
      icon: Heart,
      href: "/wishlist",
      onClick: null,
      badge: wishlistCount,
    },
    {
      label: "Bag",
      icon: ShoppingBag,
      href: "#",
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        setCartOpen(true);
      },
      badge: cartCount,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-bg/95 backdrop-blur border-t border-brand-border z-30 pb-safe">
      <nav className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive =
            item.href !== "#" &&
            (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href));

          if (item.onClick) {
            return (
              <button
                key={index}
                onClick={item.onClick}
                className="flex flex-col items-center justify-center w-14 h-14 relative text-brand-taupe hover:text-brand-burgundy transition-colors duration-200"
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-brand-burgundy text-brand-bg text-[8px] font-sans font-bold h-4 w-4 rounded-full flex items-center justify-center border border-brand-bg">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-sans mt-1 tracking-wider uppercase font-medium">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={index}
              href={item.href}
              className={`flex flex-col items-center justify-center w-14 h-14 relative transition-colors duration-200 ${
                isActive ? "text-brand-burgundy" : "text-brand-taupe hover:text-brand-burgundy"
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? "fill-brand-burgundy/10" : ""}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-brand-burgundy text-brand-bg text-[8px] font-sans font-bold h-4 w-4 rounded-full flex items-center justify-center border border-brand-bg">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-sans mt-1 tracking-wider uppercase font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
