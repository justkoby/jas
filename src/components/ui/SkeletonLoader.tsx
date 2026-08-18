"use client";

import React from "react";

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-md overflow-hidden shadow-card border border-brand-border/40 p-3.5 flex flex-col gap-3">
      <div className="w-full aspect-[4/5] bg-brand-beige/70 animate-pulse rounded" />
      <div className="h-3.5 bg-brand-beige/70 animate-pulse w-1/3 rounded" />
      <div className="h-4 bg-brand-beige/70 animate-pulse w-3/4 rounded" />
      <div className="h-3 bg-brand-beige/70 animate-pulse w-1/2 rounded" />
      <div className="flex justify-between items-center pt-2 mt-1 border-t border-brand-beige">
        <div className="h-4.5 bg-brand-beige/70 animate-pulse w-1/3 rounded" />
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-beige/70 animate-pulse" />
          <div className="w-2.5 h-2.5 rounded-full bg-brand-beige/70 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

interface GridSkeletonProps {
  count?: number;
}

export function GridSkeleton({ count = 8 }: GridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
      {[...Array(count)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 flex flex-col md:flex-row gap-8 md:gap-16">
      {/* Left Column: Image Gallery */}
      <div className="w-full md:w-1/2 flex flex-col gap-4">
        <div className="aspect-[4/5] w-full bg-brand-beige/70 animate-pulse rounded" />
        <div className="hidden md:flex gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-20 h-24 bg-brand-beige/70 animate-pulse rounded" />
          ))}
        </div>
      </div>

      {/* Right Column: Details */}
      <div className="w-full md:w-1/2 flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="h-3.5 bg-brand-beige/70 animate-pulse w-24 rounded" />
          <div className="h-8 bg-brand-beige/70 animate-pulse w-3/4 rounded" />
          <div className="h-6 bg-brand-beige/70 animate-pulse w-1/3 rounded" />
        </div>

        <div className="h-20 bg-brand-beige/70 animate-pulse w-full rounded" />

        <div className="flex flex-col gap-3">
          <div className="h-4 bg-brand-beige/70 animate-pulse w-24 rounded" />
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-brand-beige/70 animate-pulse" />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="h-4 bg-brand-beige/70 animate-pulse w-24 rounded" />
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-12 h-10 bg-brand-beige/70 animate-pulse rounded" />
            ))}
          </div>
        </div>

        <div className="h-12 bg-brand-beige/70 animate-pulse w-full rounded-full" />
      </div>
    </div>
  );
}
