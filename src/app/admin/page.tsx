import Link from "next/link";
import { adminDashboardStats } from "@/lib/admin/queries";
import { formatPesewas } from "@/lib/format/money";
import {
  Badge,
  Card,
  EmptyNote,
  PageHeader,
  StatCard,
  statusTone,
  tdCls,
  thCls,
} from "@/components/admin/ui";

export default async function AdminDashboardPage() {
  const stats = await adminDashboardStats();

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="A live view of the catalogue and incoming orders."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Products"
          value={String(
            stats.productCounts.active +
              stats.productCounts.draft +
              stats.productCounts.archived
          )}
          hint={`${stats.productCounts.active} active · ${stats.productCounts.draft} draft`}
        />
        <StatCard
          label="Orders"
          value={String(stats.orderCount)}
          hint={`${stats.pendingOrders} need attention`}
        />
        <StatCard
          label="Revenue (paid)"
          value={formatPesewas(stats.revenuePesewas)}
          hint="All paid orders"
        />
        <StatCard
          label="Subscribers"
          value={String(stats.activeSubscribers)}
          hint="Active newsletter"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border">
            <h2 className="font-sans text-[11px] font-bold uppercase tracking-widest text-brand-taupe">
              Recent orders
            </h2>
            <Link
              href="/admin/orders"
              className="font-sans text-xs font-semibold text-brand-burgundy hover:text-brand-charcoal transition-colors"
            >
              View all
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <EmptyNote>
              No orders yet — they will appear here once checkout goes live.
            </EmptyNote>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-brand-beige/60">
                  <tr>
                    <th className={thCls}>Order</th>
                    <th className={thCls}>Customer</th>
                    <th className={thCls}>Total</th>
                    <th className={thCls}>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-brand-beige/40">
                      <td className={tdCls}>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-semibold text-brand-burgundy hover:underline"
                        >
                          {order.order_number}
                        </Link>
                        <span className="block text-xs text-brand-taupe">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className={tdCls}>{order.customer_name}</td>
                      <td className={tdCls}>{formatPesewas(order.total)}</td>
                      <td className={tdCls}>
                        <Badge tone={statusTone(order.status)}>{order.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b border-brand-border">
            <h2 className="font-sans text-[11px] font-bold uppercase tracking-widest text-brand-taupe">
              Low stock (≤ 5)
            </h2>
          </div>
          {stats.lowStock.length === 0 ? (
            <EmptyNote>No tracked variants are running low.</EmptyNote>
          ) : (
            <ul className="divide-y divide-brand-border">
              {stats.lowStock.map((item) => (
                <li key={item.productId + item.variantTitle} className="px-4 py-3">
                  <Link
                    href={`/admin/products/${item.productId}`}
                    className="font-sans text-sm font-semibold text-brand-charcoal hover:text-brand-burgundy transition-colors"
                  >
                    {item.productName}
                  </Link>
                  <p className="font-sans text-xs text-brand-taupe mt-0.5">
                    {item.variantTitle} ·{" "}
                    <span className={item.stock === 0 ? "text-red-700 font-bold" : "text-amber-700 font-bold"}>
                      {item.stock} left
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
