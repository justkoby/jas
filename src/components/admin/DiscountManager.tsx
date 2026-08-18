"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteDiscount, saveDiscount } from "@/app/admin/actions/commerce";
import { formatPesewas, pesewasToGhs } from "@/lib/format/money";
import type { DbDiscountCode } from "@/types/database";
import {
  Badge,
  Banner,
  Card,
  EmptyNote,
  Field,
  btnDanger,
  btnPrimary,
  btnSecondary,
  inputCls,
  tdCls,
  thCls,
} from "@/components/admin/ui";

interface FormState {
  id: string | null;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  minOrderGhs: string;
  maxDiscountGhs: string;
  usageLimit: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  id: null,
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  minOrderGhs: "0",
  maxDiscountGhs: "",
  usageLimit: "",
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

/** datetime-local inputs want "YYYY-MM-DDTHH:mm" — trim DB timestamps. */
function toLocalInput(value: string | null): string {
  return value ? value.slice(0, 16) : "";
}

function toNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function DiscountManager({ discounts }: { discounts: DbDiscountCode[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [feedback, setFeedback] = useState<{ kind: "saved" | "error"; text: string } | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startEdit(discount: DbDiscountCode) {
    setFeedback(null);
    setForm({
      id: discount.id,
      code: discount.code,
      description: discount.description ?? "",
      discountType: discount.discount_type,
      discountValue:
        discount.discount_type === "percentage"
          ? String(discount.discount_value)
          : String(pesewasToGhs(discount.discount_value)),
      minOrderGhs: String(pesewasToGhs(discount.minimum_order_amount)),
      maxDiscountGhs:
        discount.maximum_discount_amount === null
          ? ""
          : String(pesewasToGhs(discount.maximum_discount_amount)),
      usageLimit: discount.usage_limit === null ? "" : String(discount.usage_limit),
      startsAt: toLocalInput(discount.starts_at),
      expiresAt: toLocalInput(discount.expires_at),
      isActive: discount.is_active,
    });
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setFeedback(null);
  }

  function handleSubmit() {
    setFeedback(null);
    const discountValue = toNumber(form.discountValue);
    const minOrderGhs = toNumber(form.minOrderGhs);
    if (discountValue === null || Number.isNaN(discountValue)) {
      setFeedback({ kind: "error", text: "Enter a discount value." });
      return;
    }
    if (minOrderGhs === null || Number.isNaN(minOrderGhs)) {
      setFeedback({ kind: "error", text: "Enter a minimum order amount." });
      return;
    }
    const maxDiscountGhs = toNumber(form.maxDiscountGhs);
    if (maxDiscountGhs !== null && Number.isNaN(maxDiscountGhs)) {
      setFeedback({ kind: "error", text: "Maximum discount must be a number." });
      return;
    }
    const usageLimit = toNumber(form.usageLimit);
    if (usageLimit !== null && (Number.isNaN(usageLimit) || usageLimit < 1)) {
      setFeedback({ kind: "error", text: "Usage limit must be a positive number." });
      return;
    }

    startTransition(async () => {
      const result = await saveDiscount({
        id: form.id ?? undefined,
        code: form.code.toUpperCase(),
        description: form.description || undefined,
        discountType: form.discountType,
        discountValue,
        minOrderGhs,
        maxDiscountGhs,
        usageLimit: usageLimit === null ? null : Math.round(usageLimit),
        startsAt: form.startsAt || null,
        expiresAt: form.expiresAt || null,
        isActive: form.isActive,
      });
      if (result.error) {
        setFeedback({ kind: "error", text: result.error });
        return;
      }
      resetForm();
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!window.confirm("Delete this discount code?")) return;
    setFeedback(null);
    startTransition(async () => {
      const result = await deleteDiscount(id);
      if (result.error) {
        setFeedback({ kind: "error", text: result.error });
        return;
      }
      if (form.id === id) setForm(EMPTY_FORM);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {feedback ? <Banner kind={feedback.kind} text={feedback.text} /> : null}

      <section className="bg-white border border-brand-border rounded-lg shadow-card p-6 space-y-4">
        <h2 className="font-sans text-[11px] font-bold uppercase tracking-widest text-brand-taupe">
          {form.id ? "Edit discount code" : "New discount code"}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Code">
            <input
              className={inputCls}
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              placeholder="WELCOME10"
            />
          </Field>
          <Field label="Type">
            <select
              className={inputCls}
              value={form.discountType}
              onChange={(e) =>
                set("discountType", e.target.value as "percentage" | "fixed")
              }
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed (GHS)</option>
            </select>
          </Field>
          <Field label={form.discountType === "percentage" ? "Value (%)" : "Value (GHS)"}>
            <input
              type="number"
              min="0"
              step="any"
              className={inputCls}
              value={form.discountValue}
              onChange={(e) => set("discountValue", e.target.value)}
            />
          </Field>
          <Field label="Minimum order (GHS)">
            <input
              type="number"
              min="0"
              step="any"
              className={inputCls}
              value={form.minOrderGhs}
              onChange={(e) => set("minOrderGhs", e.target.value)}
            />
          </Field>
          <Field label="Max discount (GHS)" hint="Optional cap for percentage codes.">
            <input
              type="number"
              min="0"
              step="any"
              className={inputCls}
              value={form.maxDiscountGhs}
              onChange={(e) => set("maxDiscountGhs", e.target.value)}
            />
          </Field>
          <Field label="Usage limit" hint="Blank = unlimited.">
            <input
              type="number"
              min="1"
              step="1"
              className={inputCls}
              value={form.usageLimit}
              onChange={(e) => set("usageLimit", e.target.value)}
            />
          </Field>
          <Field label="Starts at" hint="Blank = immediately.">
            <input
              type="datetime-local"
              className={inputCls}
              value={form.startsAt}
              onChange={(e) => set("startsAt", e.target.value)}
            />
          </Field>
          <Field label="Expires at" hint="Blank = never.">
            <input
              type="datetime-local"
              className={inputCls}
              value={form.expiresAt}
              onChange={(e) => set("expiresAt", e.target.value)}
            />
          </Field>
          <Field label="Description">
            <input
              className={inputCls}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Internal note…"
            />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-brand-charcoal">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
          />
          Active
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={handleSubmit}
            className={btnPrimary}
          >
            {isPending ? "Saving…" : form.id ? "Save changes" : "Create code"}
          </button>
          {form.id ? (
            <button type="button" onClick={resetForm} className={btnSecondary}>
              Cancel
            </button>
          ) : null}
        </div>
      </section>

      <Card className="overflow-hidden">
        {discounts.length === 0 ? (
          <EmptyNote>No discount codes yet.</EmptyNote>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-brand-beige/60">
                <tr>
                  <th className={thCls}>Code</th>
                  <th className={thCls}>Discount</th>
                  <th className={thCls}>Min order</th>
                  <th className={thCls}>Usage</th>
                  <th className={thCls}>Window</th>
                  <th className={thCls}>Status</th>
                  <th className={thCls}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {discounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-brand-beige/40">
                    <td className={tdCls}>
                      <span className="font-semibold">{discount.code}</span>
                      {discount.description ? (
                        <span className="block text-xs text-brand-taupe">
                          {discount.description}
                        </span>
                      ) : null}
                    </td>
                    <td className={tdCls}>
                      {discount.discount_type === "percentage"
                        ? `${discount.discount_value}%`
                        : formatPesewas(discount.discount_value)}
                      {discount.maximum_discount_amount !== null ? (
                        <span className="block text-xs text-brand-taupe">
                          capped at {formatPesewas(discount.maximum_discount_amount)}
                        </span>
                      ) : null}
                    </td>
                    <td className={tdCls}>
                      {formatPesewas(discount.minimum_order_amount)}
                    </td>
                    <td className={tdCls}>
                      {discount.usage_count}
                      {discount.usage_limit !== null ? ` / ${discount.usage_limit}` : ""}
                    </td>
                    <td className={`${tdCls} text-xs text-brand-taupe`}>
                      {discount.starts_at
                        ? new Date(discount.starts_at).toLocaleDateString()
                        : "now"}
                      {" → "}
                      {discount.expires_at
                        ? new Date(discount.expires_at).toLocaleDateString()
                        : "never"}
                    </td>
                    <td className={tdCls}>
                      <Badge tone={discount.is_active ? "green" : "gray"}>
                        {discount.is_active ? "active" : "inactive"}
                      </Badge>
                    </td>
                    <td className={`${tdCls} text-right whitespace-nowrap`}>
                      <button
                        type="button"
                        onClick={() => startEdit(discount)}
                        className={btnSecondary}
                      >
                        Edit
                      </button>{" "}
                      <button
                        type="button"
                        onClick={() => handleDelete(discount.id)}
                        className={btnDanger}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
