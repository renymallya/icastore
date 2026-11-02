import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { db, ORDER_STATUSES, orders, type OrderStatus } from "@/db";
import { DELIVERY_OPTIONS } from "@/lib/config";
import { formatDate, formatTZS, humanize } from "@/lib/format";
import { updateOrderStatus } from "../../actions";

export default async function OrdersAdmin({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const filter = ORDER_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;
  const rows = await db()
    .select()
    .from(orders)
    .where(filter ? eq(orders.status, filter) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(200);

  return (
    <div>
      <h1 className="font-display text-3xl">Orders</h1>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link href="/admin/orders" className={!filter ? "font-medium underline" : ""}>All</Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={filter === s ? "font-medium underline" : "text-muted"}>
            {humanize(s)}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {rows.map((o) => (
          <div key={o.id} className="rounded-sm border border-sand bg-white p-5 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-medium">
                  <Link href={`/order/${o.ref}`} className="underline">{o.ref}</Link> · {formatTZS(o.total)}
                </p>
                <p className="text-muted">{formatDate(o.createdAt)}</p>
                <p className="mt-2">{o.customerName} · <a href={`tel:${o.phone}`} className="underline">{o.phone}</a>{o.email ? ` · ${o.email}` : ""}</p>
                <p className="text-muted">
                  {DELIVERY_OPTIONS.find((d) => d.id === o.deliveryMethod)?.label}
                  {o.address ? ` · ${o.address}` : ""}
                </p>
                {o.notes && <p className="text-muted">Note: {o.notes}</p>}
              </div>
              <div className="text-right">
                <p className={o.status === "payment_submitted" ? "font-medium text-clay" : ""}>{humanize(o.status)}</p>
                {o.mpesaCode && <p className="font-mono">M-Pesa: {o.mpesaCode}</p>}
              </div>
            </div>
            <ul className="mt-3 text-muted">
              {o.items.map((i) => (
                <li key={`${i.productId}-${i.size}`}>
                  {i.name}{i.size ? ` (${i.size})` : ""} × {i.quantity} — {formatTZS(i.price * i.quantity)}
                </li>
              ))}
            </ul>
            <form action={updateOrderStatus} className="mt-4 flex flex-wrap items-center gap-2">
              <input type="hidden" name="id" value={o.id} />
              {o.status === "payment_submitted" && (
                <button name="status" value="paid" className="btn py-2">Confirm payment received</button>
              )}
              <select name="status" defaultValue={o.status} className="input w-auto">
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{humanize(s)}</option>
                ))}
              </select>
              <button className="btn-outline py-2">Update status</button>
            </form>
          </div>
        ))}
        {!rows.length && <p className="py-10 text-center text-muted">No orders.</p>}
      </div>
    </div>
  );
}
