"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { signOut } from "@/app/account/actions";
import type { UserRole } from "@/types/database";

/**
 * Admin chrome: charcoal sidebar on desktop, slide-over on mobile.
 * The Staff link only renders for super admins.
 */

interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
  superAdminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/discounts", label: "Discounts" },
  { href: "/admin/delivery", label: "Delivery" },
  { href: "/admin/subscribers", label: "Subscribers" },
  { href: "/admin/staff", label: "Staff", superAdminOnly: true },
];

export function AdminShell({
  role,
  name,
  children,
}: {
  role: UserRole;
  name: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const items = NAV_ITEMS.filter(
    (item) => !item.superAdminOnly || role === "super_admin"
  );

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const nav = (
    <nav className="flex-1 px-3 space-y-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setMobileOpen(false)}
          className={`block rounded-md px-3 py-2 font-sans text-sm transition-colors ${
            isActive(item)
              ? "bg-brand-burgundy text-white font-semibold"
              : "text-brand-beige/80 hover:bg-white/10 hover:text-white"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  const sidebarFooter = (
    <div className="px-3 pb-4 space-y-1 border-t border-white/10 pt-3">
      <Link
        href="/"
        className="block rounded-md px-3 py-2 font-sans text-sm text-brand-beige/80 hover:bg-white/10 hover:text-white transition-colors"
      >
        View store
      </Link>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await signOut();
          })
        }
        className="w-full text-left rounded-md px-3 py-2 font-sans text-sm text-brand-beige/80 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
      >
        {isPending ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );

  const sidebarInner = (
    <>
      <div className="px-6 py-6 border-b border-white/10">
        <Link href="/admin" className="block">
          <span className="font-serif text-xl text-white tracking-wide">JAS</span>
          <span className="block font-sans text-[10px] font-bold uppercase tracking-widest text-brand-beige/60 mt-0.5">
            Admin
          </span>
        </Link>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto py-4">{nav}</div>
      {sidebarFooter}
    </>
  );

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col bg-brand-charcoal">
        {sidebarInner}
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-brand-charcoal px-4 py-3">
        <Link href="/admin" className="font-serif text-lg text-white">
          JAS <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-brand-beige/60">Admin</span>
        </Link>
        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setMobileOpen((open) => !open)}
          className="text-brand-beige p-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile slide-over */}
      {mobileOpen ? (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 flex flex-col bg-brand-charcoal">
            {sidebarInner}
          </aside>
        </div>
      ) : null}

      {/* Content */}
      <div className="md:pl-60">
        <main className="max-w-6xl mx-auto w-full px-4 md:px-8 py-6 md:py-10">
          <div className="hidden md:flex items-center justify-end mb-6">
            <p className="font-sans text-xs text-brand-taupe">
              Signed in as{" "}
              <span className="font-semibold text-brand-charcoal">
                {name ?? "Staff"}
              </span>{" "}
              · {role.replace("_", " ")}
            </p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
