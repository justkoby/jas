"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X, MessageSquare } from "lucide-react";
import { useUI } from "@/context/UIContext";

const menuItems = [
  { label: "New Arrivals", href: "/shop?new=true" },
  { label: "Clothing", href: "/category/clothing" },
  { label: "Shoes", href: "/category/shoes" },
  { label: "Bags & Accessories", href: "/category/bags-accessories" },
  { label: "Beauty & Fragrance", href: "/category/beauty-fragrance" },
  { label: "Home & Living", href: "/category/home-living" },
  { label: "Sale", href: "/category/sale", isHighlight: true }
];

export default function MobileMenuDrawer() {
  const { isMenuOpen, setMenuOpen } = useUI();

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Overlay Backdrop */}
      <div
        className={`fixed inset-0 bg-brand-charcoal/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-4/5 max-w-sm bg-brand-bg shadow-soft z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-brand-border">
          <span className="font-serif font-bold text-xl tracking-widest text-brand-charcoal">JAS</span>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-1 hover:text-brand-burgundy transition-colors"
          >
            <X className="h-6 w-6 text-brand-charcoal" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`font-serif text-xl tracking-wide transition-colors duration-200 ${
                item.isHighlight
                  ? "text-brand-burgundy font-medium hover:text-brand-rose"
                  : "text-brand-charcoal hover:text-brand-taupe"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-6 py-8 border-t border-brand-border bg-brand-beige/50">
          <div className="text-center">
            <span className="font-serif text-sm italic text-brand-taupe block mb-4">Style your life.</span>
            <div className="flex justify-center gap-6">
              <a
                href="https://www.instagram.com/jasmiine.sss/"
                target="_blank"
                rel="noreferrer"
                className="text-brand-taupe hover:text-brand-burgundy transition-colors"
              >
                <svg className="h-5 w-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://wa.me/233598010104"
                target="_blank"
                rel="noreferrer"
                className="text-brand-taupe hover:text-brand-burgundy transition-colors"
              >
                <MessageSquare className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
