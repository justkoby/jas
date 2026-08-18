import React from "react";
import { GridSkeleton } from "@/components/ui/SkeletonLoader";

export default function Loading() {
  return (
    <div className="bg-brand-bg min-h-screen pb-20 md:pb-12 text-brand-charcoal">
      <div className="w-full h-[35vh] md:h-[45vh] bg-brand-beige animate-pulse border-b border-brand-border/30" />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <GridSkeleton count={8} />
      </div>
    </div>
  );
}
