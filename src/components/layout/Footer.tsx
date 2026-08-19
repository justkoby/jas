"use client";

import React from "react";
import Link from "next/link";
import { Smartphone, MessageSquare } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "233598010104";

  const footerLinks = {
    shop: [
      { label: "New Arrivals", href: "/shop?new=true" },
      { label: "Clothing", href: "/category/clothing" },
      { label: "Shoes", href: "/category/shoes" },
      { label: "Bags & Accessories", href: "/category/bags-accessories" },
      { label: "Beauty & Fragrance", href: "/category/beauty-fragrance" },
      { label: "Home & Living", href: "/category/home-living" },
      { label: "Sale", href: "/category/sale" },
    ],
    customerCare: [
      { label: "Contact Us", href: "/contact" },
      { label: "FAQs", href: "/faqs" },
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Returns & Exchanges", href: "/returns" },
      { label: "Size Guide", href: "/size-guide" },
    ],
    about: [
      { label: "Our Story", href: "/story" },
      { label: "Curated Philosophy", href: "/philosophy" },
      { label: "Journal", href: "/journal" },
      { label: "Careers", href: "/careers" },
    ],
  };

  return (
    <footer className="bg-brand-beige/40 border-t border-brand-border pt-16 pb-24 md:pb-12 text-brand-charcoal">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-y-10 gap-x-6 pb-16 border-b border-brand-border">
          {/* Brand Col */}
          <div className="col-span-2 flex flex-col gap-4">
            <Link href="/" className="font-serif font-black text-2xl tracking-widest text-brand-charcoal uppercase">
              JAS
            </Link>
            <p className="font-sans text-xs text-brand-taupe leading-relaxed max-w-sm">
              Discover fashion, fragrance, beauty, and living essentials selected to make every day feel more like you. Curated premium lifestyle products with a modern Ghanaian soul.
            </p>
            <div className="flex gap-4 mt-2">
              <a
                href="https://www.instagram.com/jasmiine.sss/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white border border-brand-border text-brand-taupe hover:text-brand-burgundy transition-colors hover:scale-105"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white border border-brand-border text-brand-taupe hover:text-brand-burgundy transition-colors hover:scale-105"
                aria-label="TikTok"
              >
                {/* Custom TikTok Icon */}
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.58 4.22.94 1.15 2.23 1.94 3.66 2.24v3.85a9.38 9.38 0 0 1-5.13-1.63v7.4c.03 2.1-.63 4.23-1.99 5.8a8.2 8.2 0 0 1-6.19 3.06c-2.3.06-4.63-.74-6.3-2.31A8.93 8.93 0 0 1 .46 16.4c-.06-2.54 1.05-5.07 2.94-6.73a8.87 8.87 0 0 1 7.23-1.78v3.98a4.92 4.92 0 0 0-3.3 1.83c-.93 1.16-1.25 2.76-.84 4.19.4 1.34 1.48 2.45 2.85 2.8 1.54.43 3.29-.02 4.34-1.2.66-.75.98-1.75.96-2.75V.02Z" />
                </svg>
              </a>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white border border-brand-border text-brand-taupe hover:text-brand-burgundy transition-colors hover:scale-105"
                aria-label="WhatsApp"
              >
                <MessageSquare className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="font-sans text-[10px] font-bold uppercase tracking-widest text-brand-charcoal mb-4">
              Shop Categories
            </h4>
            <ul className="flex flex-col gap-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="font-sans text-xs text-brand-taupe hover:text-brand-burgundy transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="font-sans text-[10px] font-bold uppercase tracking-widest text-brand-charcoal mb-4">
              Customer Service
            </h4>
            <ul className="flex flex-col gap-2.5">
              {footerLinks.customerCare.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="font-sans text-xs text-brand-taupe hover:text-brand-burgundy transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links 3 */}
          <div>
            <h4 className="font-sans text-[10px] font-bold uppercase tracking-widest text-brand-charcoal mb-4">
              About JAS
            </h4>
            <ul className="flex flex-col gap-2.5">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="font-sans text-xs text-brand-taupe hover:text-brand-burgundy transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Col */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-brand-taupe">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-sans text-[11px]">
            <Link href="/shipping" className="hover:text-brand-charcoal transition-colors">Shipping & Delivery</Link>
            <Link href="/returns" className="hover:text-brand-charcoal transition-colors">Returns & Exchanges</Link>
            <Link href="/privacy" className="hover:text-brand-charcoal transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-brand-charcoal transition-colors">Terms & Conditions</Link>
          </div>

          {/* Payments and Currency */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <span className="font-sans text-[11px] font-medium text-brand-charcoal flex items-center gap-1 bg-white border border-brand-border px-3 py-1 rounded">
              🇬🇭 GH₵ (GHS)
            </span>
            <div className="flex items-center gap-2">
              {/* Mock Mobile Money Badge */}
              <div className="bg-white border border-brand-border rounded px-2 py-1 text-[9px] font-bold font-sans tracking-wide uppercase text-brand-charcoal flex items-center gap-1 shadow-sm">
                <Smartphone className="h-3 w-3 text-brand-burgundy" /> MoMo
              </div>
              {/* Visa Badge */}
              <div className="bg-white border border-brand-border rounded px-2 py-1 text-[9px] font-bold font-sans tracking-widest uppercase text-[#0B1E6F] shadow-sm">
                Visa
              </div>
              {/* Mastercard Badge */}
              <div className="bg-white border border-brand-border rounded px-2 py-1 text-[9px] font-bold font-sans tracking-widest uppercase text-[#E02626] shadow-sm">
                MC
              </div>
            </div>
          </div>

          <p className="font-sans text-[10px]">
            © {currentYear} JAS. All rights reserved. Made in Ghana.
          </p>
        </div>
      </div>
    </footer>
  );
}
