"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbsProps {
  items: { label: string; href?: string }[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1.5 font-sans text-xs text-brand-taupe py-2 overflow-x-auto no-scrollbar whitespace-nowrap">
      <Link href="/" className="hover:text-brand-burgundy transition-colors">
        Home
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="h-3 w-3 text-brand-border flex-shrink-0" />
            {isLast || !item.href ? (
              <span className="text-brand-charcoal font-medium select-none truncate">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="hover:text-brand-burgundy transition-colors truncate">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
