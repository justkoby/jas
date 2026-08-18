"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveCategory } from "@/app/admin/actions/categories";
import type { CategoryInput } from "@/lib/validation/schemas";
import type { DbCategoryRow } from "@/types/database";
import {
  Banner,
  Card,
  Field,
  btnPrimary,
  btnSecondary,
  inputCls,
  tdCls,
  thCls,
} from "@/components/admin/ui";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface FormState {
  id?: string;
  name: string;
  slug: string;
  parentId: string;
  displayOrder: string;
  isActive: boolean;
  isHomepageVisible: boolean;
}

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  parentId: "",
  displayOrder: "0",
  isActive: true,
  isHomepageVisible: true,
};

/** Category tree table with an inline create/edit form. */
export function CategoryManager({ rows }: { rows: DbCategoryRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "saved" | "error"; text: string } | null>(null);

  const parents = rows.filter((row) => !row.parent_id);

  function startEdit(row: DbCategoryRow) {
    setForm({
      id: row.id,
      name: row.name,
      slug: row.slug,
      parentId: row.parent_id ?? "",
      displayOrder: String(row.display_order),
      isActive: row.is_active,
      isHomepageVisible: row.is_homepage_visible,
    });
    setSlugTouched(true);
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setFeedback(null);
  }

  function handleSubmit() {
    const input: CategoryInput = {
      id: form.id,
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      parentId: form.parentId || null,
      displayOrder: parseInt(form.displayOrder, 10) || 0,
      isActive: form.isActive,
      isHomepageVisible: form.isHomepageVisible,
    };

    startTransition(async () => {
      const result = await saveCategory(input);
      if (result.error) {
        setFeedback({ kind: "error", text: result.error });
        return;
      }
      setFeedback({ kind: "saved", text: result.message ?? "Category saved." });
      resetForm();
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="font-sans text-[11px] font-bold uppercase tracking-widest text-brand-taupe mb-4">
          {form.id ? "Edit category" : "New category"}
        </h2>
        {feedback ? <Banner kind={feedback.kind} text={feedback.text} /> : null}
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Name">
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, name: e.target.value }));
                if (!slugTouched) {
                  setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }));
                }
              }}
            />
          </Field>
          <Field label="Slug">
            <input
              className={inputCls}
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setForm((prev) => ({ ...prev, slug: e.target.value }));
              }}
            />
          </Field>
          <Field label="Parent">
            <select
              className={inputCls}
              value={form.parentId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, parentId: e.target.value }))
              }
            >
              <option value="">None (top level)</option>
              {parents
                .filter((parent) => parent.id !== form.id)
                .map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Display order">
            <input
              className={inputCls}
              type="number"
              step="1"
              value={form.displayOrder}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, displayOrder: e.target.value }))
              }
            />
          </Field>
          <div className="flex items-end gap-6 pb-2">
            <label className="flex items-center gap-2 font-sans text-sm text-brand-charcoal">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                }
                className="h-4 w-4 accent-[#9A3B5A]"
              />
              Active
            </label>
            <label className="flex items-center gap-2 font-sans text-sm text-brand-charcoal">
              <input
                type="checkbox"
                checked={form.isHomepageVisible}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    isHomepageVisible: e.target.checked,
                  }))
                }
                className="h-4 w-4 accent-[#9A3B5A]"
              />
              On homepage
            </label>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            type="button"
            disabled={isPending}
            onClick={handleSubmit}
            className={btnPrimary}
          >
            {isPending ? "Saving…" : form.id ? "Save changes" : "Add category"}
          </button>
          {form.id ? (
            <button type="button" onClick={resetForm} className={btnSecondary}>
              Cancel
            </button>
          ) : null}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-brand-beige/60">
              <tr>
                <th className={thCls}>Name</th>
                <th className={thCls}>Slug</th>
                <th className={thCls}>Order</th>
                <th className={thCls}>Status</th>
                <th className={thCls}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-brand-beige/40">
                  <td className={tdCls}>
                    {row.parent_id ? (
                      <span className="text-brand-taupe">└ </span>
                    ) : null}
                    <span className={row.parent_id ? "" : "font-semibold"}>
                      {row.name}
                    </span>
                  </td>
                  <td className={`${tdCls} text-xs text-brand-taupe`}>/{row.slug}</td>
                  <td className={tdCls}>{row.display_order}</td>
                  <td className={tdCls}>
                    {row.is_active ? (
                      <span className="text-emerald-700 font-semibold text-xs">Active</span>
                    ) : (
                      <span className="text-brand-taupe text-xs">Hidden</span>
                    )}
                  </td>
                  <td className={`${tdCls} text-right`}>
                    <button
                      type="button"
                      onClick={() => startEdit(row)}
                      className="font-sans text-xs font-semibold text-brand-burgundy hover:text-brand-charcoal transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
