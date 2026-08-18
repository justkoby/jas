"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onActionClick,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 max-w-md mx-auto">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-brand-beige flex items-center justify-center mb-5 text-brand-taupe border border-brand-border/40">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="font-serif text-xl text-brand-charcoal mb-2.5">
        {title}
      </h3>
      <p className="font-sans text-sm text-brand-taupe leading-relaxed mb-8">
        {description}
      </p>

      {actionLabel && (
        <>
          {actionHref ? (
            <Link
              href={actionHref}
              className="bg-brand-burgundy text-brand-bg px-8 py-3.5 rounded-full font-sans text-sm font-semibold tracking-wider hover:bg-brand-rose transition-colors duration-200 shadow-sm"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onActionClick}
              className="bg-brand-burgundy text-brand-bg px-8 py-3.5 rounded-full font-sans text-sm font-semibold tracking-wider hover:bg-brand-rose transition-colors duration-200 shadow-sm"
            >
              {actionLabel}
            </button>
          )}
        </>
      )}
    </div>
  );
}
