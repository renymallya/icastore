"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart";
import { formatTZS } from "@/lib/format";

export default function CartPage() {
  const { lines, ready, subtotal, setQuantity } = useCart();

  if (!ready) return <div className="container-page py-12" />;

  if (!lines.length) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-4xl">Your cart is empty</h1>
        <Link href="/shop" className="btn mt-8">
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="font-display text-4xl">Your cart</h1>
      <ul className="mt-8 divide-y divide-sand border-y border-sand">
        {lines.map((l) => (
          <li key={`${l.productId}-${l.size}`} className="flex gap-4 py-5">
            <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-sm bg-sand">
              {l.image ? <Image src={l.image} alt={l.name} fill sizes="80px" className="object-cover" /> : <div className="batik-placeholder absolute inset-0" />}
            </div>
            <div className="flex flex-1 flex-col">
              <Link href={`/product/${l.slug}`} className="font-display text-lg">
                {l.name}
              </Link>
              {l.size && <span className="text-sm text-muted">Size {l.size}</span>}
              <div className="mt-auto flex items-center gap-3 text-sm">
                <button type="button" aria-label="Decrease" className="h-8 w-8 rounded-sm border border-sand" onClick={() => setQuantity(l.productId, l.size, l.quantity - 1)}>
                  −
                </button>
                <span>{l.quantity}</span>
                <button type="button" aria-label="Increase" className="h-8 w-8 rounded-sm border border-sand" onClick={() => setQuantity(l.productId, l.size, l.quantity + 1)}>
                  +
                </button>
                <button type="button" className="ml-4 text-muted underline" onClick={() => setQuantity(l.productId, l.size, 0)}>
                  Remove
                </button>
              </div>
            </div>
            <p className="text-sm">{formatTZS(l.price * l.quantity)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-between">
        <span className="text-muted">Subtotal (delivery calculated at checkout)</span>
        <span className="text-xl">{formatTZS(subtotal)}</span>
      </div>
      <div className="mt-8 flex justify-end">
        <Link href="/checkout" className="btn">
          Checkout
        </Link>
      </div>
    </div>
  );
}
