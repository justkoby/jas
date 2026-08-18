"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteDeliveryMethod, saveDeliveryMethod } from "@/app/admin/actions/commerce";
import { formatPesewas, pesewasToGhs } from "@/lib/format/money";
import type { DbDeliveryMethod } from "@/types/database";
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
  name: string;
  code: string;
  description: string;
  feeGhs: string;
  freeThresholdGhs: string;
  estimatedDuration: string;
  displayOrder: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  id: null,
  name: "",
  code: "",
  description: "",
  feeGhs: "0",
  freeThresholdGhs: "",
  estimatedDuration: "",
  displayOrder: "0",
  isActive: true,
};

function toNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function DeliveryManager({ methods }: { methods: DbDeliveryMethod[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [feedback, setFeedback] = useState<{ kind: "saved" | "error"; text: string } | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startEdit(method: DbDeliveryMethod) {
    setFeedback(null);
    setForm({
      id: method.id,
      name: method.name,
      code: method.code,
      description: method.description ?? "",
      feeGhs: String(pesewasToGhs(method.fee)),
      freeThresholdGhs:
        method.free_delivery_threshold === null
          ? ""
          : String(pesewasToGhs(method.free_delivery_threshold)),
      estimatedDuration: method.estimated_duration ?? "",
      displayOrder: String(method.display_order),
      isActive: method.is_active,
    });
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setFeedback(null);
  }

  function handleSubmit() {
    setFeedback(null);
    const feeGhs = toNumber(form.feeGhs);
    if (feeGhs === null || Number.isNaN(feeGhs) || feeGhs < 0) {
      setFeedback({ kind: "error", text: "Enter a valid fee." });
      return;
    }
    const freeThresholdGhs = toNumber(form.freeThresholdGhs);
    if (freeThresholdGhs !== null && (Number.isNaN(freeThresholdGhs) || freeThresholdGhs <= 0)) {
      setFeedback({ kind: "error", text: "Free threshold must be a positive number." });
      return;
    }
    const displayOrder = toNumber(form.displayOrder);
    if (displayOrder === null || Number.isNaN(displayOrder)) {
      setFeedback({ kind: "error", text: "Enter a display order." });
      return;
    }

    startTransition(async () => {
      const result = await saveDeliveryMethod({
        id: form.id ?? undefined,
        name: form.name,
        code: form.code,
        description: form.description || undefined,
        feeGhs,
        freeThresholdGhs,
        estimatedDuration: form.estimatedDuration || undefined,
        isActive: form.isActive,
        displayOrder: Math.round(displayOrder),
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
    if (!window.confirm("Delete this delivery method?")) return;
    setFeedback(null);
    startTransition(async () => {
      const result = await deleteDeliveryMethod(id);
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
          {form.id ? "Edit delivery method" : "New delivery method"}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Name">
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Standard delivery"
            />
          </Field>
          <Field label="Code" hint="Lowercase letters, numbers, underscores.">
            <input
              className={inputCls}
              value={form.code}
              onChange={(e) => set("code", e.target.value.toLowerCase())}
              placeholder="standard"
            />
          </Field>
          <Field label="Fee (GHS)">
            <input
              type="number"
              min="0"
              step="any"
              className={inputCls}
              value={form.feeGhs}
              onChange={(e) => set("feeGhs", e.target.value)}
            />
          </Field>
          <Field label="Free threshold (GHS)" hint="Blank = never free.">
            <input
              type="number"
              min="0"
              step="any"
              className={inputCls}
              value={form.freeThresholdGhs}
              onChange={(e) => set("freeThresholdGhs", e.target.value)}
            />
          </Field>
          <Field label="Estimated duration">
            <input
              className={inputCls}
              value={form.estimatedDuration}
              onChange={(e) => set("estimatedDuration", e.target.value)}
              placeholder="2–4 working days"
            />
          </Field>
          <Field label="Display order">
            <input
              type="number"
              step="1"
              className={inputCls}
              value={form.displayOrder}
              onChange={(e) => set("displayOrder", e.target.value)}
            />
          </Field>
          <Field label="Description">
            <input
              className={inputCls}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Shown at checkout…"
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
            {isPending ? "Saving…" : form.id ? "Save changes" : "Create method"}
          </button>
          {form.id ? (
            <button type="button" onClick={resetForm} className={btnSecondary}>
              Cancel
            </button>
          ) : null}
        </div>
      </section>

      <Card className="overflow-hidden">
        {methods.length === 0 ? (
          <EmptyNote>No delivery methods yet.</EmptyNote>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-brand-beige/60">
                <tr>
                  <th className={thCls}>Method</th>
                  <th className={thCls}>Fee</th>
                  <th className={thCls}>Free over</th>
                  <th className={thCls}>Duration</th>
                  <th className={thCls}>Status</th>
                  <th className={thCls}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {methods.map((method) => (
                  <tr key={method.id} className="hover:bg-brand-beige/40">
                    <td className={tdCls}>
                      <span className="font-semibold">{method.name}</span>
                      <span className="block text-xs text-brand-taupe">{method.code}</span>
                    </td>
                    <td className={tdCls}>{formatPesewas(method.fee)}</td>
                    <td className={tdCls}>
                      {method.free_delivery_threshold !== null
                        ? formatPesewas(method.free_delivery_threshold)
                        : "—"}
                    </td>
                    <td className={`${tdCls} text-xs text-brand-taupe`}>
                      {method.estimated_duration ?? "—"}
                    </td>
                    <td className={tdCls}>
                      <Badge tone={method.is_active ? "green" : "gray"}>
                        {method.is_active ? "active" : "inactive"}
                      </Badge>
                    </td>
                    <td className={`${tdCls} text-right whitespace-nowrap`}>
                      <button
                        type="button"
                        onClick={() => startEdit(method)}
                        className={btnSecondary}
                      >
                        Edit
                      </button>{" "}
                      <button
                        type="button"
                        onClick={() => handleDelete(method.id)}
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
