import Link from "next/link";
import { adminListOrders, ADMIN_PAGE_SIZE } from "@/lib/admin/queries";
import { formatPesewas } from "@/lib/format/money";
import {
  Badge,
  Card,
  EmptyNote,
  PageHeader,
  Pagination,
  btnPrimary,
  inputCls,
  statusTone,
  tdCls,
  thCls,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "ready_for_pickup",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
];

const PAYMENT_STATUSES = ["unpaid", "pending", "paid", "failed", "refunded", "partially_refunded"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const status = typeof searchParams.status === "string" ? searchParams.status : "all";
  const payment = typeof searchParams.payment === "string" ? searchParams.payment : "all";
  const page = Math.max(1, parseInt(String(searchParams.page ?? "1"), 10) || 1);

  const { rows, total } = await adminListOrders({ q, status, payment, page });
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  const hrefFor = (nextPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status !== "all") params.set("status", status);
    if (payment !== "all") params.set("payment", payment);
    if (nextPage > 1) params.set("page", String(nextPage));
    const suffix = params.toString();
    return `/admin/orders${suffix ? `?${suffix}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Orders" subtitle={`${total} order${total === 1 ? "" : "s"}`} />

      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Order number, email or name…"
          className={`${inputCls} max-w-xs`}
        />
        <select name="status" defaultValue={status} className={`${inputCls} max-w-[170px]`}>
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <select name="payment" defaultValue={payment} className={`${inputCls} max-w-[170px]`}>
          <option value="all">All payments</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <button type="submit" className={btnPrimary}>
          Filter
        </button>
      </form>

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyNote>
            No orders yet — they will land here as soon as checkout is live.
          </EmptyNote>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-brand-beige/60">
                <tr>
                  <th className={thCls}>Order</th>
                  <th className={thCls}>Customer</th>
                  <th className={thCls}>Total</th>
                  <th className={thCls}>Payment</th>
                  <th className={thCls}>Status</th>
                  <th className={thCls}>Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {rows.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-beige/40">
                    <td className={tdCls}>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold text-brand-burgundy hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className={tdCls}>
                      {order.customer_name}
                      <span className="block text-xs text-brand-taupe">{order.customer_email}</span>
                    </td>
                    <td className={tdCls}>{formatPesewas(order.total)}</td>
                    <td className={tdCls}>
                      <Badge tone={statusTone(order.payment_status)}>
                        {order.payment_status}
                      </Badge>
                    </td>
                    <td className={tdCls}>
                      <Badge tone={statusTone(order.status)}>{order.status}</Badge>
                    </td>
                    <td className={`${tdCls} text-xs text-brand-taupe`}>
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pagination page={page} totalPages={totalPages} hrefFor={hrefFor} />
    </>
  );
}
