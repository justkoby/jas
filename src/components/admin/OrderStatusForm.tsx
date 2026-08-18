"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrder } from "@/app/admin/actions/orders";
import type { OrderStatus, PaymentStatus } from "@/types/database";
import { Banner, Field, btnPrimary, inputCls } from "@/components/admin/ui";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "ready_for_pickup",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  "unpaid",
  "pending",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
];

/** Status / payment / notes editor for a single order. */
export function OrderStatusForm({
  orderId,
  status,
  paymentStatus,
  adminNotes,
}: {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  adminNotes: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nextStatus, setNextStatus] = useState<OrderStatus>(status);
  const [nextPayment, setNextPayment] = useState<PaymentStatus>(paymentStatus);
  const [notes, setNotes] = useState(adminNotes ?? "");
  const [feedback, setFeedback] = useState<{ kind: "saved" | "error"; text: string } | null>(null);

  function handleSubmit() {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateOrder({
        orderId,
        status: nextStatus,
        paymentStatus: nextPayment,
        adminNotes: notes,
      });
      if (result.error) {
        setFeedback({ kind: "error", text: result.error });
        return;
      }
      setFeedback({ kind: "saved", text: result.message ?? "Order updated." });
      router.refresh();
    });
  }

  return (
    <section className="bg-white border border-brand-border rounded-lg shadow-card p-6 space-y-4">
      <h2 className="font-sans text-[11px] font-bold uppercase tracking-widest text-brand-taupe">
        Manage order
      </h2>
      {feedback ? <Banner kind={feedback.kind} text={feedback.text} /> : null}
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Order status">
          <select
            className={inputCls}
            value={nextStatus}
            onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Payment status">
          <select
            className={inputCls}
            value={nextPayment}
            onChange={(e) => setNextPayment(e.target.value as PaymentStatus)}
          >
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Admin notes" hint="Internal only — never shown to the customer.">
        <textarea
          className={`${inputCls} min-h-[90px]`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>
      <button
        type="button"
        disabled={isPending}
        onClick={handleSubmit}
        className={btnPrimary}
      >
        {isPending ? "Saving…" : "Save order"}
      </button>
    </section>
  );
}
