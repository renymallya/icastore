"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart, type CartLine } from "@/components/cart";

export function AddToCart({
  product,
  sizes,
  disabled,
}: {
  product: Omit<CartLine, "size" | "quantity">;
  sizes: string[];
  disabled?: boolean;
}) {
  const { add } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const needsSize = sizes.length > 0 && !size;

  return (
    <div className="space-y-5">
      {sizes.length > 0 && (
        <fieldset>
          <legend className="label">Size</legend>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`min-w-12 rounded-sm border px-3 py-2 text-sm ${size === s ? "border-ink bg-ink text-cream" : "border-sand hover:border-ink"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          className="btn"
          disabled={disabled || needsSize}
          onClick={() => {
            add({ ...product, size, quantity: 1 });
            setAdded(true);
          }}
        >
          {disabled ? "Sold out" : needsSize ? "Choose a size" : "Add to cart"}
        </button>
        {added && (
          <Link href="/cart" className="text-sm underline underline-offset-4">
            Added. View cart
          </Link>
        )}
      </div>
    </div>
  );
}
