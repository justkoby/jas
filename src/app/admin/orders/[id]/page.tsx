import Link from "next/link";
import { notFound } from "next/navigation";
import { adminGetOrder } from "@/lib/admin/queries";
import { formatPesewas } from "@/lib/format/money";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import {
  Badge,
  Card,
  EmptyNote,
  statusTone,
  tdCls,
  thCls,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

/** Best-effort rendering of the jsonb delivery address snapshot. */
function AddressSnapshot({ snapshot }: { snapshot: unknown }) {
  if (!snapshot || typeof snapshot !== "object") {
    return <p className="text-sm text-brand-taupe">No address recorded.</p>;
  }
  const record = snapshot as Record<string, unknown>;
  const lines = Object.entries(record)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => ({
      key: key.replace(/_/g, " "),
      value: String(value),
    }));
  if (lines.length === 0) {
    return <p className="text-sm text-brand-taupe">No address recorded.</p>;
  }
  return (
    <dl className="space-y-1 text-sm">
      {lines.map((line) => (
        <div key={line.key} className="flex gap-2">
          <dt className="capitalize text-brand-taupe min-w-[110px]">{line.key}</dt>
          <dd className="text-brand-charcoal">{line.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await adminGetOrder(params.id);
  if (!result) notFound();
  const { order, items, payments } = result;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/orders"
          className="text-sm text-brand-taupe hover:text-brand-charcoal"
        >
          ← Orders
        </Link>
        <h1 className="font-serif text-2xl text-brand-charcoal">
          Order {order.order_number}
        </h1>
        <Badge tone={statusTone(order.status)}>{order.status}</Badge>
        <Badge tone={statusTone(order.payment_status)}>{order.payment_status}</Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column: items + payments */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-brand-border">
              <h2 className="font-sans text-[11px] font-bold uppercase tracking-widest text-brand-taupe">
                Items
              </h2>
            </div>
            {items.length === 0 ? (
              <EmptyNote>No items recorded.</EmptyNote>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px]">
                  <thead className="bg-brand-beige/60">
                    <tr>
                      <th className={thCls}>Product</th>
                      <th className={thCls}>SKU</th>
                      <th className={thCls}>Qty</th>
                      <th className={thCls}>Unit price</th>
                      <th className={thCls}>Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className={tdCls}>
                          {item.product_name}
                          {item.variant_name ? (
                            <span className="block text-xs text-brand-taupe">
                              {item.variant_name}
                            </span>
                          ) : null}
                        </td>
                        <td className={`${tdCls} text-xs text-brand-taupe`}>
                          {item.sku ?? "—"}
                        </td>
                        <td className={tdCls}>{item.quantity}</td>
                        <td className={tdCls}>{formatPesewas(item.unit_price)}</td>
                        <td className={tdCls}>{formatPesewas(item.line_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-6 py-4 border-t border-brand-border space-y-1 text-sm">
              <div className="flex justify-between text-brand-taupe">
                <span>Subtotal</span>
                <span>{formatPesewas(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-brand-taupe">
                <span>Discount</span>
                <span>−{formatPesewas(order.discount_amount)}</span>
              </div>
              <div className="flex justify-between text-brand-taupe">
                <span>Delivery</span>
                <span>{formatPesewas(order.delivery_fee)}</span>
              </div>
              <div className="flex justify-between font-semibold text-brand-charcoal text-base pt-1">
                <span>Total</span>
                <span>{formatPesewas(order.total)}</span>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-brand-border">
              <h2 className="font-sans text-[11px] font-bold uppercase tracking-widest text-brand-taupe">
                Payments
              </h2>
            </div>
            {payments.length === 0 ? (
              <EmptyNote>No payment attempts recorded.</EmptyNote>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px]">
                  <thead className="bg-brand-beige/60">
                    <tr>
                      <th className={thCls}>Provider</th>
                      <th className={thCls}>Reference</th>
                      <th className={thCls}>Amount</th>
                      <th className={thCls}>Status</th>
                      <th className={thCls}>Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className={tdCls}>{payment.provider}</td>
                        <td className={`${tdCls} text-xs text-brand-taupe`}>
                          {payment.provider_reference ?? "—"}
                        </td>
                        <td className={tdCls}>{formatPesewas(payment.amount)}</td>
                        <td className={tdCls}>
                          <Badge tone={statusTone(payment.status)}>
                            {payment.status}
                          </Badge>
                        </td>
                        <td className={`${tdCls} text-xs text-brand-taupe`}>
                          {new Date(payment.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right column: customer, address, status form */}
        <div className="space-y-6">
          <section className="bg-white border border-brand-border rounded-lg shadow-card p-6 space-y-3">
            <h2 className="font-sans text-[11px] font-bold uppercase tracking-widest text-brand-taupe">
              Customer
            </h2>
            <p className="text-sm font-semibold text-brand-charcoal">
              {order.customer_name}
            </p>
            <p className="text-sm text-brand-taupe">{order.customer_email}</p>
            {order.customer_phone ? (
              <p className="text-sm text-brand-taupe">{order.customer_phone}</p>
            ) : null}
            <p className="text-xs text-brand-taupe">
              Placed {new Date(order.created_at).toLocaleString()}
            </p>
            {order.paid_at ? (
              <p className="text-xs text-brand-taupe">
                Paid {new Date(order.paid_at).toLocaleString()}
              </p>
            ) : null}
            {order.payment_method ? (
              <p className="text-xs text-brand-taupe">
                Payment method: {order.payment_method}
              </p>
            ) : null}
            {order.fulfilment_method ? (
              <p className="text-xs text-brand-taupe">
                Fulfilment: {order.fulfilment_method}
              </p>
            ) : null}
          </section>

          <section className="bg-white border border-brand-border rounded-lg shadow-card p-6 space-y-3">
            <h2 className="font-sans text-[11px] font-bold uppercase tracking-widest text-brand-taupe">
              Delivery address
            </h2>
            <AddressSnapshot snapshot={order.delivery_address_snapshot} />
            {order.customer_notes ? (
              <div className="pt-3 border-t border-brand-border">
                <h3 className="text-xs font-semibold text-brand-taupe mb-1">
                  Customer notes
                </h3>
                <p className="text-sm text-brand-charcoal whitespace-pre-wrap">
                  {order.customer_notes}
                </p>
              </div>
            ) : null}
          </section>

          <OrderStatusForm
            orderId={order.id}
            status={order.status}
            paymentStatus={order.payment_status}
            adminNotes={order.admin_notes}
          />
        </div>
      </div>
    </div>
  );
}
