"use client";

import React from "react";

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onChange: (size: string) => void;
  variationType?: 'size' | 'volume' | 'material' | 'scent';
}

export default function SizeSelector({
  sizes,
  selectedSize,
  onChange,
  variationType = "size",
}: SizeSelectorProps) {
  const getLabel = () => {
    switch (variationType) {
      case "volume":
        return "Volume";
      case "material":
        return "Material";
      case "scent":
        return "Scent";
      case "size":
      default:
        return "Select Size";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="font-sans text-xs font-bold uppercase tracking-wider text-brand-charcoal">
          {getLabel()}: <span className="font-semibold text-brand-burgundy">{selectedSize}</span>
        </span>
        {variationType === "size" && (
          <button
            type="button"
            className="font-sans text-xs text-brand-taupe underline hover:text-brand-burgundy transition-colors"
          >
            Size Guide
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2.5">
        {sizes.map((size) => {
          const isSelected = selectedSize === size;
          return (
            <button
              key={size}
              type="button"
              onClick={() => onChange(size)}
              className={`min-w-[44px] min-h-[44px] px-4 py-2 border rounded font-sans text-xs font-semibold tracking-wider transition-all duration-200 flex items-center justify-center ${
                isSelected
                  ? "border-brand-burgundy bg-brand-burgundy text-brand-bg shadow-sm"
                  : "border-brand-border bg-white text-brand-charcoal hover:border-brand-taupe"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
