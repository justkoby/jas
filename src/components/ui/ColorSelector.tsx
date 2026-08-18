"use client";

import React from "react";

interface ColorSelectorProps {
  colors: { name: string; value: string }[];
  selectedColor: { name: string; value: string };
  onChange: (color: { name: string; value: string }) => void;
}

export default function ColorSelector({ colors, selectedColor, onChange }: ColorSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => {
        const isSelected = selectedColor.name === color.name;
        return (
          <button
            key={color.name}
            type="button"
            onClick={() => onChange(color)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-sans font-medium transition-all duration-200 ${
              isSelected
                ? "border-brand-burgundy bg-white text-brand-charcoal ring-1 ring-brand-burgundy"
                : "border-brand-border bg-white text-brand-taupe hover:border-brand-taupe"
            }`}
          >
            {/* Color Dot */}
            <span
              className="w-4 h-4 rounded-full border border-black/10 flex-shrink-0"
              style={{ backgroundColor: color.value }}
            />
            <span>{color.name}</span>
          </button>
        );
      })}
    </div>
  );
}
