"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProduct } from "@/app/admin/actions/products";
import type { AdminProductAggregate } from "@/lib/admin/queries";
import type { DbCategoryRow, ProductStatus } from "@/types/database";
import type { ProductFormInput } from "@/lib/validation/schemas";
import { pesewasToGhs } from "@/lib/format/money";
import { Banner, Field, btnPrimary, inputCls, labelCls } from "@/components/admin/ui";

/**
 * Product create/edit form. Builds the Colour x second-option
 * variant grid client-side; the server action reconciles it with
 * the database non-destructively.
 */

const SECOND_OPTION_NAMES = ["Size", "Volume", "Material", "Scent"] as const;

interface VariantEdit {
  priceGhs: string;
  compareAtGhs: string;
  stock: string;
  sku: string;
  active: boolean;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function splitList(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
    )
  );
}

export function ProductForm({
  mode,
  productId,
  categories,
  initial,
}: {
  mode: "create" | "edit";
  productId?: string;
  categories: DbCategoryRow[];
  initial?: AdminProductAggregate;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Basics
  const [name, setName] = useState(initial?.product.name ?? "");
  const [slug, setSlug] = useState(initial?.product.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [sku, setSku] = useState(initial?.product.sku ?? "");
  const [brand, setBrand] = useState(initial?.product.brand ?? "");
  const [categoryId, setCategoryId] = useState<string>(
    initial?.product.category_id ?? ""
  );
  const [shortDescription, setShortDescription] = useState(
    initial?.product.short_description ?? ""
  );
  const [description, setDescription] = useState(
    initial?.product.description ?? ""
  );
  const [seoTitle, setSeoTitle] = useState(initial?.product.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(
    initial?.product.seo_description ?? ""
  );

  // Pricing (GHS strings in the inputs)
  const [basePrice, setBasePrice] = useState(
    initial ? String(pesewasToGhs(initial.product.base_price)) : ""
  );
  const [compareAtPrice, setCompareAtPrice] = useState(
    initial?.product.compare_at_price != null
      ? String(pesewasToGhs(initial.product.compare_at_price))
      : ""
  );
  const [costPrice, setCostPrice] = useState(
    initial?.product.cost_price != null
      ? String(pesewasToGhs(initial.product.cost_price))
      : ""
  );

  // Status + flags
  const [status, setStatus] = useState<ProductStatus>(
    initial?.product.status ?? "draft"
  );
  const [isFeatured, setIsFeatured] = useState(initial?.product.is_featured ?? false);
  const [isNewArrival, setIsNewArrival] = useState(initial?.product.is_new_arrival ?? false);
  const [isBestseller, setIsBestseller] = useState(initial?.product.is_bestseller ?? false);
  const [isLimited, setIsLimited] = useState(initial?.product.is_limited ?? false);
  const [trackInventory, setTrackInventory] = useState(initial?.product.track_inventory ?? true);

  // Options
  const colourOption = initial?.options.find((o) => o.name === "Colour");
  const secondOption = initial?.options.find((o) => o.name !== "Colour");
  const [coloursText, setColoursText] = useState(
    colourOption ? colourOption.values.map((v) => v.value).join(", ") : ""
  );
  const [secondOptionName, setSecondOptionName] = useState<string>(
    secondOption?.name ?? "Size"
  );
  const [secondValuesText, setSecondValuesText] = useState(
    secondOption ? secondOption.values.map((v) => v.value).join(", ") : "One Size"
  );

  // Per-combo variant edits, keyed "Colour|Second".
  const [variantEdits, setVariantEdits] = useState<Record<string, VariantEdit>>(
    () => {
      const edits: Record<string, VariantEdit> = {};
      for (const variant of initial?.variants ?? []) {
        const colour = variant.option_values.find(
          (ov) => ov.option_name === "Colour"
        )?.value;
        const second = variant.option_values.find(
          (ov) => ov.option_name !== "Colour"
        )?.value;
        if (!colour || !second) continue;
        edits[`${colour}|${second}`] = {
          priceGhs: String(pesewasToGhs(variant.price)),
          compareAtGhs:
            variant.compare_at_price != null
              ? String(pesewasToGhs(variant.compare_at_price))
              : "",
          stock: String(variant.stock_quantity),
          sku: variant.sku ?? "",
          active: variant.is_active,
        };
      }
      return edits;
    }
  );

  const colours = useMemo(() => splitList(coloursText), [coloursText]);
  const secondValues = useMemo(() => splitList(secondValuesText), [secondValuesText]);

  const parents = categories.filter((c) => !c.parent_id);

  function defaultEdit(): VariantEdit {
    return {
      priceGhs: basePrice,
      compareAtGhs: compareAtPrice,
      stock: "0",
      sku: "",
      active: true,
    };
  }

  function editFor(key: string): VariantEdit {
    return variantEdits[key] ?? defaultEdit();
  }

  function setEdit(key: string, patch: Partial<VariantEdit>) {
    setVariantEdits((prev) => ({
      ...prev,
      [key]: { ...editFor(key), ...patch },
    }));
  }

  function handleSubmit() {
    setError(null);

    const finalSlug = slug.trim() || slugify(name);
    const combos: ProductFormInput["variants"] = [];
    for (const colour of colours) {
      for (const second of secondValues) {
        const edit = editFor(`${colour}|${second}`);
        combos.push({
          colour,
          secondValue: second,
          priceGhs: Number(edit.priceGhs) || 0,
          compareAtGhs: edit.compareAtGhs.trim()
            ? Number(edit.compareAtGhs)
            : null,
          stock: Math.max(0, parseInt(edit.stock, 10) || 0),
          sku: edit.sku.trim() || undefined,
          active: edit.active,
        });
      }
    }

    const input: ProductFormInput = {
      id: productId,
      name: name.trim(),
      slug: finalSlug,
      sku: sku.trim() || undefined,
      brand: brand.trim() || undefined,
      categoryId: categoryId || null,
      shortDescription: shortDescription.trim() || undefined,
      description: description.trim() || undefined,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
      basePriceGhs: Number(basePrice) || 0,
      compareAtPriceGhs: compareAtPrice.trim() ? Number(compareAtPrice) : null,
      costPriceGhs: costPrice.trim() ? Number(costPrice) : null,
      status: status as ProductFormInput["status"],
      isFeatured,
      isNewArrival,
      isBestseller,
      isLimited,
      trackInventory,
      colours,
      secondOptionName: secondOptionName as ProductFormInput["secondOptionName"],
      secondValues,
      variants: combos,
    };

    startTransition(async () => {
      const result = await saveProduct(input);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(`/admin/products/${result.id}?saved=1`);
    });
  }

  return (
    <div className="space-y-6">
      {error ? <Banner kind="error" text={error} /> : null}

      {/* Basics */}
      <section className="bg-white border border-brand-border rounded-lg shadow-card p-6 space-y-4">
        <h2 className="font-sans text-[11px] font-bold uppercase tracking-widest text-brand-taupe">
          Basics
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Name">
            <input
              className={inputCls}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder="Amara Ruched Midi Dress"
            />
          </Field>
          <Field label="Slug">
            <input
              className={inputCls}
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder="amara-ruched-midi-dress"
            />
          </Field>
          <Field label="Category">
            <select
              className={inputCls}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select a category…</option>
              {parents.map((parent) => (
                <optgroup key={parent.id} label={parent.name}>
                  <option value={parent.id}>{parent.name} (parent)</option>
                  {categories
                    .filter((c) => c.parent_id === parent.id)
                    .map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </Field>
          <Field label="Brand">
            <input
              className={inputCls}
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="JAS"
            />
          </Field>
          <Field label="Product SKU">
            <input
              className={inputCls}
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Optional base SKU"
            />
          </Field>
          <Field label="Status">
            <select
              className={inputCls}
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus)}
            >
              <option value="draft">Draft</option>
              <option value="active">Active (published)</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
        </div>
        <Field label="Short description">
          <textarea
            className={`${inputCls} min-h-[70px]`}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
          />
        </Field>
        <Field label="Full description">
          <textarea
            className={`${inputCls} min-h-[120px]`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
      </section>

      {/* Pricing */}
      <section className="bg-white border border-brand-border rounded-lg shadow-card p-6 space-y-4">
        <h2 className="font-sans text-[11px] font-bold uppercase tracking-widest text-brand-taupe">
          Pricing (GHS)
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Base price">
            <input
              className={inputCls}
              type="number"
              min="0"
              step="0.01"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
            />
          </Field>
          <Field label="Compare-at price" hint="Shows a strikethrough + Sale badge.">
            <input
              className={inputCls}
              type="number"
              min="0"
              step="0.01"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
            />
          </Field>
          <Field label="Cost price" hint="Internal only, never shown.">
            <input
              className={inputCls}
              type="number"
              min="0"
              step="0.01"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
            />
          </Field>
        </div>
      </section>

      {/* Flags */}
      <section className="bg-white border border-brand-border rounded-lg shadow-card p-6">
        <h2 className="font-sans text-[11px] font-bold uppercase tracking-widest text-brand-taupe mb-4">
          Merchandising
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(
            [
              ["Featured", isFeatured, setIsFeatured],
              ["New arrival", isNewArrival, setIsNewArrival],
              ["Bestseller", isBestseller, setIsBestseller],
              ["Limited edition", isLimited, setIsLimited],
              ["Track inventory", trackInventory, setTrackInventory],
            ] as [string, boolean, (v: boolean) => void][]
          ).map(([label, value, setter]) => (
            <label
              key={label}
              className="flex items-center gap-2 font-sans text-sm text-brand-charcoal"
            >
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setter(e.target.checked)}
                className="h-4 w-4 accent-[#9A3B5A]"
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      {/* Options + variants */}
      <section className="bg-white border border-brand-border rounded-lg shadow-card p-6 space-y-4">
        <h2 className="font-sans text-[11px] font-bold uppercase tracking-widest text-brand-taupe">
          Options & variants
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Colours (comma separated)">
            <input
              className={inputCls}
              value={coloursText}
              onChange={(e) => setColoursText(e.target.value)}
              placeholder="Dusty Rose, Burgundy, Charcoal"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Second option">
              <select
                className={inputCls}
                value={secondOptionName}
                onChange={(e) => setSecondOptionName(e.target.value)}
              >
                {SECOND_OPTION_NAMES.map((optionName) => (
                  <option key={optionName} value={optionName}>
                    {optionName}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={`${secondOptionName}s (comma separated)`}>
              <input
                className={inputCls}
                value={secondValuesText}
                onChange={(e) => setSecondValuesText(e.target.value)}
                placeholder="XS, S, M, L"
              />
            </Field>
          </div>
        </div>

        {colours.length > 0 && secondValues.length > 0 ? (
          <div className="overflow-x-auto border border-brand-border rounded-md">
            <table className="w-full min-w-[640px]">
              <thead className="bg-brand-beige/60">
                <tr>
                  <th className="px-3 py-2 text-left font-sans text-[10px] font-bold uppercase tracking-widest text-brand-taupe">Colour</th>
                  <th className="px-3 py-2 text-left font-sans text-[10px] font-bold uppercase tracking-widest text-brand-taupe">{secondOptionName}</th>
                  <th className="px-3 py-2 text-left font-sans text-[10px] font-bold uppercase tracking-widest text-brand-taupe">Price (GHS)</th>
                  <th className="px-3 py-2 text-left font-sans text-[10px] font-bold uppercase tracking-widest text-brand-taupe">Compare-at</th>
                  <th className="px-3 py-2 text-left font-sans text-[10px] font-bold uppercase tracking-widest text-brand-taupe">Stock</th>
                  <th className="px-3 py-2 text-left font-sans text-[10px] font-bold uppercase tracking-widest text-brand-taupe">SKU</th>
                  <th className="px-3 py-2 text-left font-sans text-[10px] font-bold uppercase tracking-widest text-brand-taupe">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {colours.map((colour) =>
                  secondValues.map((second) => {
                    const key = `${colour}|${second}`;
                    const edit = editFor(key);
                    return (
                      <tr key={key}>
                        <td className="px-3 py-2 font-sans text-sm text-brand-charcoal">{colour}</td>
                        <td className="px-3 py-2 font-sans text-sm text-brand-charcoal">{second}</td>
                        <td className="px-3 py-2">
                          <input
                            className={`${inputCls} w-24`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={edit.priceGhs}
                            onChange={(e) => setEdit(key, { priceGhs: e.target.value })}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            className={`${inputCls} w-24`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={edit.compareAtGhs}
                            onChange={(e) => setEdit(key, { compareAtGhs: e.target.value })}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            className={`${inputCls} w-20`}
                            type="number"
                            min="0"
                            step="1"
                            value={edit.stock}
                            onChange={(e) => setEdit(key, { stock: e.target.value })}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            className={`${inputCls} w-28`}
                            value={edit.sku}
                            onChange={(e) => setEdit(key, { sku: e.target.value })}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={edit.active}
                            onChange={(e) => setEdit(key, { active: e.target.checked })}
                            className="h-4 w-4 accent-[#9A3B5A]"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="font-sans text-sm text-brand-taupe">
            Add at least one colour and one {secondOptionName.toLowerCase()} to build the variant grid.
          </p>
        )}
      </section>

      {/* SEO */}
      <section className="bg-white border border-brand-border rounded-lg shadow-card p-6 space-y-4">
        <h2 className="font-sans text-[11px] font-bold uppercase tracking-widest text-brand-taupe">
          SEO
        </h2>
        <Field label="SEO title">
          <input
            className={inputCls}
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
          />
        </Field>
        <Field label="SEO description">
          <textarea
            className={`${inputCls} min-h-[70px]`}
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
          />
        </Field>
      </section>

      <div className="flex items-center gap-4">
        <button
          type="button"
          disabled={isPending}
          onClick={handleSubmit}
          className={btnPrimary}
        >
          {isPending
            ? "Saving…"
            : mode === "create"
              ? "Create product"
              : "Save changes"}
        </button>
        <span className={labelCls}>
          {mode === "create"
            ? "You can upload images after creating."
            : "Changes go live on the storefront immediately."}
        </span>
      </div>
    </div>
  );
}
