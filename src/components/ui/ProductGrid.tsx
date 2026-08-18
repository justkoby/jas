"use client";

import React from "react";
import { Product } from "@/types";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  onProductClick?: () => void;
}

export default function ProductGrid({ products, onProductClick }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onCardClick={onProductClick}
        />
      ))}
    </div>
  );
}
