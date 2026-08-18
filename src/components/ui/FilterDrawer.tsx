"use client";

import React, { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { ProductFilterOptions } from "@/services/products";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ProductFilterOptions;
  setFilters: (filters: ProductFilterOptions) => void;
  availableColors: string[];
  availableSizes: string[];
  availableSubcategories: string[];
}

export default function FilterDrawer({
  isOpen,
  onClose,
  filters,
  setFilters,
  availableColors,
  availableSizes,
  availableSubcategories,
}: FilterDrawerProps) {
  const [localFilters, setLocalFilters] = useState<ProductFilterOptions>({ ...filters });

  // Sync with props
  useEffect(() => {
    setLocalFilters({ ...filters });
  }, [filters, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleApply = () => {
    setFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const cleared: ProductFilterOptions = {
      category: filters.category, // Keep the active top category
      sortBy: filters.sortBy,     // Keep the active sort
      colors: [],
      sizes: [],
      minPrice: 0,
      maxPrice: 2000,
      isSale: undefined,
      isNew: undefined,
    };
    setLocalFilters(cleared);
  };

  const toggleColor = (color: string) => {
    const current = localFilters.colors || [];
    const next = current.includes(color)
      ? current.filter((c) => c !== color)
      : [...current, color];
    setLocalFilters({ ...localFilters, colors: next });
  };

  const toggleSize = (size: string) => {
    const current = localFilters.sizes || [];
    const next = current.includes(size)
      ? current.filter((s) => s !== size)
      : [...current, size];
    setLocalFilters({ ...localFilters, sizes: next });
  };

  const toggleSubcategory = (sub: string) => {
    const next = localFilters.subcategory === sub ? undefined : sub;
    setLocalFilters({ ...localFilters, subcategory: next });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-brand-charcoal/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        className={`fixed bottom-0 md:top-0 md:bottom-0 right-0 w-full md:w-[400px] h-[80vh] md:h-full bg-brand-bg shadow-soft z-50 transform transition-transform duration-300 ease-in-out flex flex-col rounded-t-2xl md:rounded-t-none border-t md:border-t-0 md:border-l border-brand-border ${
          isOpen ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-brand-border flex-shrink-0">
          <span className="font-serif font-bold text-lg text-brand-charcoal tracking-wide">
            Filters
          </span>
          <button onClick={onClose} className="p-1 hover:text-brand-burgundy transition-colors">
            <X className="h-6 w-6 text-brand-charcoal" />
          </button>
        </div>

        {/* Scrollable Filters Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 font-sans">
          {/* Subcategory selection (if available) */}
          {availableSubcategories.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-3">
                Subcategory
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableSubcategories.map((sub) => {
                  const isSelected = localFilters.subcategory === sub;
                  return (
                    <button
                      key={sub}
                      onClick={() => toggleSubcategory(sub)}
                      className={`px-3 py-1.5 border rounded-full text-xs font-medium transition-colors ${
                        isSelected
                          ? "border-brand-burgundy bg-brand-burgundy text-brand-bg"
                          : "border-brand-border hover:border-brand-taupe text-brand-charcoal"
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price Range Filter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-4 flex justify-between">
              <span>Price Range</span>
              <span className="text-brand-burgundy font-semibold">
                GH₵{localFilters.minPrice ?? 0} - GH₵{localFilters.maxPrice ?? 2000}+
              </span>
            </h4>
            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={localFilters.maxPrice ?? 2000}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, maxPrice: parseInt(e.target.value) })
              }
              className="w-full h-1 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-burgundy focus:outline-none"
            />
            <div className="flex justify-between text-[10px] text-brand-taupe mt-1.5">
              <span>GH₵0</span>
              <span>GH₵1,000</span>
              <span>GH₵2,000+</span>
            </div>
          </div>

          {/* Color Filter */}
          {availableColors.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-3">
                Colors
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {availableColors.map((color) => {
                  const isSelected = localFilters.colors?.includes(color);
                  return (
                    <button
                      key={color}
                      onClick={() => toggleColor(color)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs transition-colors ${
                        isSelected
                          ? "border-brand-burgundy bg-brand-beige text-brand-charcoal ring-1 ring-brand-burgundy font-medium"
                          : "border-brand-border hover:border-brand-taupe text-brand-taupe"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 text-brand-burgundy" />}
                      <span>{color}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Filter */}
          {availableSizes.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-3">
                Sizes / Volumes
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => {
                  const isSelected = localFilters.sizes?.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`min-w-[40px] h-10 px-3 border rounded text-xs font-semibold tracking-wider transition-colors flex items-center justify-center ${
                        isSelected
                          ? "border-brand-burgundy bg-brand-burgundy text-brand-bg font-semibold"
                          : "border-brand-border hover:border-brand-taupe text-brand-charcoal"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Promotion / Tags */}
          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-3">
              Promotions & Status
            </h4>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer select-none text-xs text-brand-charcoal font-medium">
                <input
                  type="checkbox"
                  checked={localFilters.isSale === true}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      isSale: e.target.checked ? true : undefined,
                    })
                  }
                  className="w-5 h-5 rounded border-brand-border text-brand-burgundy focus:ring-brand-burgundy/30 cursor-pointer accent-brand-burgundy"
                />
                On Sale (Discounted Items)
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none text-xs text-brand-charcoal font-medium">
                <input
                  type="checkbox"
                  checked={localFilters.isNew === true}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      isNew: e.target.checked ? true : undefined,
                    })
                  }
                  className="w-5 h-5 rounded border-brand-border text-brand-burgundy focus:ring-brand-burgundy/30 cursor-pointer accent-brand-burgundy"
                />
                Just In (New Arrivals)
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-brand-border bg-white flex gap-4 flex-shrink-0">
          <button
            onClick={handleReset}
            className="flex-1 border border-brand-border text-brand-charcoal py-3 rounded-full text-sm font-semibold tracking-wider hover:bg-brand-beige transition-colors"
          >
            RESET
          </button>
          <button
            onClick={handleApply}
            className="flex-1 bg-brand-burgundy text-brand-bg py-3 rounded-full text-sm font-semibold tracking-wider hover:bg-brand-rose transition-colors"
          >
            APPLY FILTERS
          </button>
        </div>
      </div>
    </>
  );
}
