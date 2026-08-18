import Link from "next/link";
import { adminListProducts, ADMIN_PAGE_SIZE } from "@/lib/admin/queries";
import { formatPesewas } from "@/lib/format/money";
import { publicStorageUrl, isSupabaseConfigured } from "@/lib/supabase/config";
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

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const status =
    typeof searchParams.status === "string" ? searchParams.status : "all";
  const page = Math.max(1, parseInt(String(searchParams.page ?? "1"), 10) || 1);

  const { rows, total } = await adminListProducts({
    q,
    status: status as "all" | "draft" | "active" | "archived",
    page,
  });

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  const hrefFor = (nextPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status !== "all") params.set("status", status);
    if (nextPage > 1) params.set("page", String(nextPage));
    const suffix = params.toString();
    return `/admin/products${suffix ? `?${suffix}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${total} product${total === 1 ? "" : "s"}`}
        action={
          <Link href="/admin/products/new" className={btnPrimary}>
            New product
          </Link>
        }
      />

      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name…"
          className={`${inputCls} max-w-xs`}
        />
        <select name="status" defaultValue={status} className={`${inputCls} max-w-[160px]`}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <button type="submit" className={btnPrimary}>
          Filter
        </button>
      </form>

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyNote>No products match — adjust the filters or create one.</EmptyNote>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-brand-beige/60">
                <tr>
                  <th className={thCls}>Product</th>
                  <th className={thCls}>Category</th>
                  <th className={thCls}>Base price</th>
                  <th className={thCls}>Stock</th>
                  <th className={thCls}>Status</th>
                  <th className={thCls}>Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-brand-beige/40">
                    <td className={tdCls}>
                      <div className="flex items-center gap-3">
                        <span className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden bg-brand-beige border border-brand-border">
                          {row.primary_image && isSupabaseConfigured() ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={publicStorageUrl("product-images", row.primary_image)}
                              alt={row.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src="/placeholder.jpg"
                              alt={row.name}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </span>
                        <div>
                          <Link
                            href={`/admin/products/${row.id}`}
                            className="font-semibold text-brand-charcoal hover:text-brand-burgundy transition-colors"
                          >
                            {row.name}
                          </Link>
                          <span className="block text-xs text-brand-taupe">/{row.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className={tdCls}>
                      {row.category
                        ? `${row.category.parent?.name ?? ""} ${row.category.parent ? "›" : ""} ${row.category.name}`
                        : "—"}
                    </td>
                    <td className={tdCls}>{formatPesewas(row.base_price)}</td>
                    <td className={tdCls}>{row.total_stock}</td>
                    <td className={tdCls}>
                      <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                    </td>
                    <td className={`${tdCls} text-xs text-brand-taupe`}>
                      {new Date(row.updated_at).toLocaleDateString()}
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
