import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Small presentational primitives shared by every admin page.
 * Keeps tables/forms visually consistent without a UI library.
 */

export const inputCls =
  "w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal placeholder:text-brand-taupe/60 focus:outline-none focus:ring-2 focus:ring-brand-burgundy/25 focus:border-brand-burgundy";

export const labelCls =
  "block font-sans text-[11px] font-bold uppercase tracking-widest text-brand-taupe mb-1.5";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-md bg-brand-burgundy px-4 py-2 text-sm font-semibold text-white hover:bg-brand-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-md border border-brand-border bg-white px-4 py-2 text-sm font-semibold text-brand-charcoal hover:bg-brand-beige transition-colors disabled:opacity-50";

export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50";

export const thCls =
  "px-4 py-3 text-left font-sans text-[10px] font-bold uppercase tracking-widest text-brand-taupe";

export const tdCls = "px-4 py-3 text-sm text-brand-charcoal align-top";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white border border-brand-border rounded-lg shadow-card ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-brand-charcoal">{title}</h1>
        {subtitle ? (
          <p className="font-sans text-sm text-brand-taupe mt-1">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="p-5">
      <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-brand-taupe mb-2">
        {label}
      </p>
      <p className="font-serif text-2xl text-brand-charcoal">{value}</p>
      {hint ? (
        <p className="font-sans text-xs text-brand-taupe mt-1">{hint}</p>
      ) : null}
    </Card>
  );
}

export type BadgeTone = "green" | "amber" | "red" | "gray" | "burgundy";

const TONE_CLASSES: Record<BadgeTone, string> = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  red: "bg-red-50 text-red-700 border-red-200",
  gray: "bg-brand-beige text-brand-taupe border-brand-border",
  burgundy: "bg-brand-burgundy/10 text-brand-burgundy border-brand-burgundy/20",
};

export function Badge({
  tone = "gray",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}

/** Maps order/payment/product statuses onto badge tones. */
export function statusTone(status: string): BadgeTone {
  switch (status) {
    case "delivered":
    case "paid":
    case "active":
    case "success":
      return "green";
    case "pending":
    case "confirmed":
    case "processing":
    case "ready_for_pickup":
    case "out_for_delivery":
    case "unpaid":
      return "amber";
    case "cancelled":
    case "refunded":
    case "partially_refunded":
    case "failed":
      return "red";
    case "draft":
    case "archived":
    case "unsubscribed":
      return "gray";
    default:
      return "gray";
  }
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <span className={labelCls}>{label}</span>
      {children}
      {hint ? (
        <p className="font-sans text-xs text-brand-taupe mt-1">{hint}</p>
      ) : null}
    </div>
  );
}

export function Banner({ kind, text }: { kind: "saved" | "error"; text: string }) {
  return (
    <div
      role="status"
      className={`mb-6 rounded-md border px-4 py-3 font-sans text-sm ${
        kind === "saved"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {text}
    </div>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 py-12 text-center font-sans text-sm text-brand-taupe">
      {children}
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-4 mt-6">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={btnSecondary}>
          Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="font-sans text-xs text-brand-taupe">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={btnSecondary}>
          Next
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
