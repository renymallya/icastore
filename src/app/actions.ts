"use server";

import { and, eq, gte, inArray, isNotNull, or, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { commissions, db, orders, products, type OrderItem } from "@/db";
import { DELIVERY_OPTIONS } from "@/lib/config";
import { sendCommissionReceived, sendOrderPlaced, sendPaymentSubmitted } from "@/lib/email";
import { makeRef } from "@/lib/format";
import { restoreStock } from "@/lib/stock";

export type FormState = { error?: string; ok?: boolean } | undefined;

const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine((v) => /^(\+?255|0)\d{9}$/.test(v), "Enter a valid phone number, e.g. 0712 345 678");
const optionalEmail = z
  .string()
  .trim()
  .transform((v) => v || null)
  .pipe(z.email("Enter a valid email address").nullable());

// ---------- Orders ----------

const cartSchema = z
  .array(
    z.object({
      productId: z.number().int().positive(),
      size: z.string().max(40).nullable(),
      quantity: z.number().int().min(1).max(20),
    }),
  )
  .min(1, "Your cart is empty")
  .max(30);

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Enter your name").max(120),
  phone,
  email: optionalEmail,
  deliveryMethod: z.enum(DELIVERY_OPTIONS.map((d) => d.id) as [string, ...string[]]),
  address: z.string().trim().max(500),
  notes: z.string().trim().max(1000),
});

export async function createOrder(_prev: FormState, form: FormData): Promise<FormState> {
  if (form.get("website")) return { error: "Something went wrong" }; // honeypot

  const parsed = checkoutSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const input = parsed.data;
  if (input.deliveryMethod !== "pickup" && input.address.length < 5) {
    return { error: "Enter a delivery address" };
  }

  let cart: z.infer<typeof cartSchema>;
  try {
    const c = cartSchema.safeParse(JSON.parse(String(form.get("cart") ?? "[]")));
    if (!c.success) return { error: c.error.issues[0].message };
    cart = c.data;
  } catch {
    return { error: "Your cart could not be read. Please refresh and try again." };
  }

  // Prices always come from the database, never from the browser.
  const ids = [...new Set(cart.map((i) => i.productId))];
  const rows = await db().select().from(products).where(and(inArray(products.id, ids), eq(products.active, true)));
  const byId = new Map(rows.map((p) => [p.id, p]));

  const items: OrderItem[] = [];
  for (const line of cart) {
    const p = byId.get(line.productId);
    if (!p) return { error: "An item in your cart is no longer available. Please remove it and try again." };
    if (p.sizes.length && (!line.size || !p.sizes.includes(line.size))) {
      return { error: `Please choose a size for ${p.name}` };
    }
    items.push({
      productId: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      size: p.sizes.length ? line.size : null,
      quantity: line.quantity,
      image: p.images[0] ?? null,
    });
  }

  // Reserve stock for limited items; each update only succeeds if enough is left.
  const reserved: OrderItem[] = [];
  for (const item of items) {
    if (byId.get(item.productId)!.stock === null) continue;
    const res = await db()
      .update(products)
      .set({ stock: sql`${products.stock} - ${item.quantity}` })
      .where(and(eq(products.id, item.productId), isNotNull(products.stock), gte(products.stock, item.quantity)))
      .returning({ id: products.id });
    if (!res.length) {
      await restoreStock(reserved);
      return { error: `Sorry, there isn't enough stock left of ${item.name}.` };
    }
    reserved.push(item);
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = DELIVERY_OPTIONS.find((d) => d.id === input.deliveryMethod)!.fee;

  const [order] = await db()
    .insert(orders)
    .values({
      ref: makeRef("ICA"),
      ...input,
      items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
    })
    .returning();

  await sendOrderPlaced(order);
  redirect(`/order/${order.ref}?new=1`);
}

export async function submitPayment(_prev: FormState, form: FormData): Promise<FormState> {
  const ref = String(form.get("ref") ?? "");
  const code = String(form.get("mpesaCode") ?? "")
    .trim()
    .toUpperCase();
  if (!/^[A-Z0-9]{8,12}$/.test(code)) {
    return { error: "That doesn't look like an M-Pesa transaction code. It is usually 10 letters and numbers." };
  }

  const [order] = await db()
    .update(orders)
    .set({ mpesaCode: code, status: "payment_submitted", updatedAt: new Date() })
    .where(and(eq(orders.ref, ref), or(eq(orders.status, "awaiting_payment"), eq(orders.status, "payment_submitted"))))
    .returning();
  if (!order) return { error: "This order can no longer be updated. Please contact us." };

  await sendPaymentSubmitted(order);
  return { ok: true };
}

// ---------- Commissions ----------

const commissionSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120),
  phone,
  email: optionalEmail,
  garmentType: z.string().trim().min(2, "Tell us what you'd like made").max(120),
  occasion: z.string().trim().max(120),
  fabric: z.string().trim().max(200),
  measurements: z.string().trim().max(2000),
  budget: z
    .string()
    .trim()
    .transform((v) => (v ? Number(v.replace(/[^\d]/g, "")) : null))
    .pipe(z.number().int().positive().max(100_000_000).nullable()),
  neededBy: z
    .string()
    .trim()
    .transform((v) => v || null),
  details: z.string().trim().min(10, "Please describe your idea in a little more detail").max(4000),
});

const BLOB_HOST = /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/commissions\//;

export async function createCommission(_prev: FormState, form: FormData): Promise<FormState> {
  if (form.get("website")) return { error: "Something went wrong" }; // honeypot

  const parsed = commissionSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const referenceImages = form
    .getAll("images")
    .map(String)
    .filter((u) => BLOB_HOST.test(u))
    .slice(0, 6);

  const [row] = await db()
    .insert(commissions)
    .values({ ref: makeRef("CUS"), ...parsed.data, referenceImages })
    .returning();

  await sendCommissionReceived(row);
  redirect(`/commission/thanks?ref=${row.ref}`);
}
