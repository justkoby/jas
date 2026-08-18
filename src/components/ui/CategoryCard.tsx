"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface CategoryCardProps {
  name: string;
  slug: string;
  image: string;
  itemCount?: number;
}

export default function CategoryCard({ name, slug, image, itemCount }: CategoryCardProps) {
  return (
    <Link
      href={`/category/${slug}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-md bg-brand-beige border border-brand-border/40 shadow-card hover:shadow-soft transition-all duration-300"
    >
      {/* Background Image */}
      <Image
        src={image || "/placeholder.jpg"}
        alt={`${name} Category`}
        fill
        sizes="(max-width: 768px) 50vw, 20vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Dark tint overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/70 via-brand-charcoal/20 to-transparent transition-opacity duration-300" />

      {/* Label Info Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end text-brand-bg select-none">
        <h3 className="font-serif text-lg md:text-xl font-bold tracking-wider uppercase group-hover:translate-x-1 transition-transform duration-300">
          {name}
        </h3>
        {itemCount !== undefined && (
          <span className="font-sans text-[10px] tracking-widest uppercase text-brand-beige/80 mt-1">
            {itemCount} {itemCount === 1 ? "Item" : "Items"}
          </span>
        )}
      </div>
    </Link>
  );
}
