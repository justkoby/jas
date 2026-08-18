"use client";

import React from "react";
import { Plus, Minus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  max: number;
  onChange: (quantity: number) => void;
}

export default function QuantitySelector({ quantity, max, onChange }: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (quantity > 1) {
      onChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < max) {
      onChange(quantity + 1);
    }
  };

  return (
    <div className="flex items-center border border-brand-border rounded-full overflow-hidden bg-brand-beige w-fit">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={quantity <= 1}
        className="w-11 h-11 flex items-center justify-center text-brand-taupe hover:text-brand-charcoal disabled:opacity-30 disabled:hover:text-brand-taupe transition-colors"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="px-4 font-sans font-semibold text-sm text-brand-charcoal min-w-[36px] text-center select-none">
        {quantity}
      </span>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={quantity >= max}
        className="w-11 h-11 flex items-center justify-center text-brand-taupe hover:text-brand-charcoal disabled:opacity-30 disabled:hover:text-brand-taupe transition-colors"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
