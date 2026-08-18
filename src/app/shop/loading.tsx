import React from "react";
import { GridSkeleton } from "@/components/ui/SkeletonLoader";

export default function Loading() {
  return (
    <div className="bg-brand-bg min-h-screen pb-20 md:pb-12 text-brand-charcoal">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="h-4 w-24 bg-brand-border rounded animate-pulse mb-6" />
        <div className="h-9 w-48 bg-brand-border rounded animate-pulse mb-10" />
        <GridSkeleton count={8} />
      </div>
    </div>
  );
}
