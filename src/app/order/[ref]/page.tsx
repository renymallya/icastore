import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClearCart } from "@/components/cart";
import { db, orders } from "@/db";
import { LIPA_STEPS, store } from "@/lib/config";
import { formatDate, formatTZS, humanize } from "@/lib/format";
import { PaymentForm } from "./payment-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your order", robots: { index: false } };

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { ref } = await params;
  const { new: isNew } = await searchParams;
  const [order] = await db().select().from(orders).where(eq(orders.ref, ref)).limit(1);
  if (!order) notFound();

  const canPay = order.status === "awaiting_payment" || order.status === "payment_submitted";

  return (
    <div className="container-page max-w-3xl py-12">
      {isNew && <ClearCart />}
      <p className="text-xs uppercase tracking-widest text-muted">Order {order.ref} · {formatDate(order.createdAt)}</p>
      <h1 className="mt-2 font-display text-4xl">
        {order.status === "awaiting_payment" ? "Almost done: pay with M-Pesa" : humanize(order.status)}
      </h1>

      {canPay && (
        <section className="mt-8 rounded-sm border-2 border-olive bg-white p-6">
          <div className="grid gap-4 text-center sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted">Lipa Namba</p>
              <p className="font-display text-3xl tracking-wider">{store.lipaNamba || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted">Business name</p>
              <p className="font-display text-2xl">{store.lipaName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted">Amount</p>
              <p className="font-display text-3xl">{formatTZS(order.total)}</p>
            </div>
          </div>
          <ol className="mt-6 list-decimal space-y-1 pl-5 text-sm">
            {LIPA_STEPS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <div className="mt-6 border-t border-sand pt-6">
            <PaymentForm orderRef={order.ref} submittedCode={order.mpesaCode} />
          </div>
        </section>
      )}

      {order.status === "paid" && <p className="mt-4">Payment received, thank you. We’re preparing your order.</p>}
      {order.status === "shipped" && <p className="mt-4">Your order is on its way.</p>}

      <section className="mt-10 text-sm">
        <h2 className="font-display text-2xl">Items</h2>
        <ul className="mt-3 divide-y divide-sand border-y border-sand">
          {order.items.map((i) => (
            <li key={`${i.productId}-${i.size}`} className="flex justify-between py-3">
              <span>
                {i.name}
                {i.size ? ` (${i.size})` : ""} × {i.quantity}
              </span>
              <span>{formatTZS(i.price * i.quantity)}</span>
            </li>
          ))}
          <li className="flex justify-between py-3"><span>Delivery</span><span>{formatTZS(order.deliveryFee)}</span></li>
          <li className="flex justify-between py-3 font-medium"><span>Total</span><span>{formatTZS(order.total)}</span></li>
        </ul>
        <p className="mt-6 text-muted">Keep this page’s link to check your order status.</p>
      </section>
    </div>
  );
}
