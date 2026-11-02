"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  size: string | null;
  quantity: number;
};

type CartContext = {
  lines: CartLine[];
  ready: boolean;
  count: number;
  subtotal: number;
  add: (line: CartLine) => void;
  setQuantity: (productId: number, size: string | null, quantity: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartContext | null>(null);
const KEY = "icastore-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setLines(JSON.parse(saved));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, ready]);

  const add = useCallback((line: CartLine) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.productId === line.productId && l.size === line.size);
      if (i === -1) return [...prev, line];
      const next = [...prev];
      next[i] = { ...next[i], quantity: Math.min(20, next[i].quantity + line.quantity) };
      return next;
    });
  }, []);

  const setQuantity = useCallback((productId: number, size: string | null, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => !(l.productId === productId && l.size === size))
        : prev.map((l) => (l.productId === productId && l.size === size ? { ...l, quantity: Math.min(20, quantity) } : l)),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(
    () => ({
      lines,
      ready,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: lines.reduce((n, l) => n + l.price * l.quantity, 0),
      add,
      setQuantity,
      clear,
    }),
    [lines, ready, add, setQuantity, clear],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export function CartCount() {
  const { count } = useCart();
  return <span>Cart{count > 0 ? ` (${count})` : ""}</span>;
}

export function ClearCart() {
  const { clear, ready } = useCart();
  useEffect(() => {
    if (ready) clear();
  }, [ready, clear]);
  return null;
}
