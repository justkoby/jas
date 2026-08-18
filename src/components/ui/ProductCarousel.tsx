"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types";
import ProductCard from "./ProductCard";

interface ProductCarouselProps {
  products: Product[];
}

export default function ProductCarousel({ products }: ProductCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo =
        direction === "left" ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
      carouselRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="relative group">
      {/* Carousel Scroll Buttons (Desktop only) */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-[-22px] top-1/2 transform -translate-y-1/2 bg-white text-brand-charcoal hover:text-brand-burgundy w-11 h-11 rounded-full border border-brand-border shadow-soft flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex"
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={() => scroll("right")}
        className="absolute right-[-22px] top-1/2 transform -translate-y-1/2 bg-white text-brand-charcoal hover:text-brand-burgundy w-11 h-11 rounded-full border border-brand-border shadow-soft flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex"
        aria-label="Scroll right"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Swipeable Container */}
      <div
        ref={carouselRef}
        className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 select-none cursor-grab active:cursor-grabbing"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[200px] sm:w-[240px] md:w-[280px] flex-shrink-0 snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
