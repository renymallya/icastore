"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createOrder } from "@/app/actions";
import { useCart } from "@/components/cart";
import { DELIVERY_OPTIONS, type DeliveryId } from "@/lib/config";
import { formatTZS } from "@/lib/format";

export default function CheckoutPage() {
  const { lines, ready, subtotal } = useCart();
  const [state, action, pending] = useActionState(createOrder, undefined);
  const [delivery, setDelivery] = useState<DeliveryId>("dar");
  const fee = DELIVERY_OPTIONS.find((d) => d.id === delivery)!.fee;

  if (!ready) return <div className="container-page py-12" />;
  if (!lines.length) {
    return (
      <div className="container-page py-24 text-center">
        <p>Your cart is empty.</p>
        <Link href="/shop" className="btn mt-6">
          Browse the shop
        </Link>
      </div>
    );
  }

  const cart = JSON.stringify(lines.map((l) => ({ productId: l.productId, size: l.size, quantity: l.quantity })));

  return (
    <div className="container-page grid gap-12 py-12 md:grid-cols-[1fr_340px]">
      <form action={action} className="space-y-5">
        <h1 className="font-display text-4xl">Checkout</h1>
        <input type="hidden" name="cart" value={cart} />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

        <div>
          <label className="label" htmlFor="customerName">Full name</label>
          <input id="customerName" name="customerName" required className="input" autoComplete="name" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="phone">Phone (M-Pesa number)</label>
            <input id="phone" name="phone" required className="input" inputMode="tel" placeholder="0712 345 678" autoComplete="tel" />
          </div>
          <div>
            <label className="label" htmlFor="email">Email (for receipts)</label>
            <input id="email" name="email" type="email" className="input" autoComplete="email" />
          </div>
        </div>

        <fieldset>
          <legend className="label">Delivery</legend>
          <div className="space-y-2">
            {DELIVERY_OPTIONS.map((d) => (
              <label key={d.id} className="flex cursor-pointer items-center justify-between rounded-sm border border-sand bg-white px-4 py-3 text-sm has-[:checked]:border-ink">
                <span className="flex items-center gap-3">
                  <input type="radio" name="deliveryMethod" value={d.id} checked={delivery === d.id} onChange={() => setDelivery(d.id)} />
                  {d.label}
                </span>
                <span>{d.fee ? formatTZS(d.fee) : "Free"}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {delivery !== "pickup" && (
          <div>
            <label className="label" htmlFor="address">Delivery address</label>
            <textarea id="address" name="address" rows={3} className="input" placeholder="Area, street, landmark, town" />
          </div>
        )}
        <div>
          <label className="label" htmlFor="notes">Notes (optional)</label>
          <textarea id="notes" name="notes" rows={2} className="input" />
        </div>

        {state?.error && <p className="rounded-sm bg-red-50 px-4 py-3 text-sm text-red-800">{state.error}</p>}

        <button type="submit" className="btn w-full" disabled={pending}>
          {pending ? "Placing order…" : `Place order · ${formatTZS(subtotal + fee)}`}
        </button>
        <p className="text-center text-xs text-muted">You’ll pay by M-Pesa Lipa Namba on the next page.</p>
      </form>

      <aside className="h-fit rounded-sm bg-sand/50 p-6 text-sm">
        <h2 className="font-display text-2xl">Summary</h2>
        <ul className="mt-4 space-y-2">
          {lines.map((l) => (
            <li key={`${l.productId}-${l.size}`} className="flex justify-between gap-4">
              <span>
                {l.name}
                {l.size ? ` (${l.size})` : ""} × {l.quantity}
              </span>
              <span>{formatTZS(l.price * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-sand pt-4">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatTZS(subtotal)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>{fee ? formatTZS(fee) : "Free"}</span></div>
          <div className="flex justify-between text-base font-medium"><span>Total</span><span>{formatTZS(subtotal + fee)}</span></div>
        </div>
      </aside>
    </div>
  );
}
