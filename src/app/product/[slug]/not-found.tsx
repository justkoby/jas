import React from "react";
import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="max-w-md mx-auto py-24 text-center px-4">
      <h2 className="font-serif text-2xl text-brand-charcoal mb-4">
        Product Not Found
      </h2>
      <p className="font-sans text-sm text-brand-taupe mb-8">
        The product you are looking for does not exist or has been removed.
      </p>
      <Link
        href="/shop"
        className="bg-brand-burgundy text-brand-bg px-8 py-3.5 rounded-full font-sans text-xs font-bold tracking-widest uppercase hover:bg-brand-rose transition-all"
      >
        Back to Shop
      </Link>
    </div>
  );
}
