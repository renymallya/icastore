"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { FormState } from "@/app/actions";
import { COMMISSION_STATUSES, commissions, db, ORDER_STATUSES, orders, products } from "@/db";
import { endSession, passwordMatches, requireAdmin, startSession } from "@/lib/auth";
import { CATEGORIES } from "@/lib/catalog";
import { sendOrderStatus } from "@/lib/email";
import { slugify } from "@/lib/format";
import { restoreStock } from "@/lib/stock";

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  if (!passwordMatches(String(form.get("password") ?? ""))) {
    await new Promise((r) => setTimeout(r, 800));
    return { error: "Wrong password" };
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

// ---------- Products ----------

const money = z
  .string()
  .trim()
  .transform((v) => (v ? Number(v.replace(/[^\d]/g, "")) : null));

const productSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(160),
  description: z.string().trim().max(5000),
  category: z.enum(CATEGORIES.map((c) => c.slug) as [string, ...string[]]),
  price: money.pipe(z.number().int().positive("Price is required")),
  compareAtPrice: money.pipe(z.number().int().positive().nullable()),
  sizes: z.string().transform((v) =>
    v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  ),
  stock: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v)))
    .pipe(z.number().int().min(0).nullable()),
});

export async function saveProduct(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = productSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: `${issue.path.join(".")}: ${issue.message}` };
  }
  const data = {
    ...parsed.data,
    slug: slugify(parsed.data.slug || parsed.data.name),
    images: form.getAll("images").map(String),
    featured: form.get("featured") === "on",
    active: form.get("active") === "on",
  };
  const id = Number(form.get("id")) || null;

  const [clash] = await db()
    .select({ id: products.id })
    .from(products)
    .where(id ? and(eq(products.slug, data.slug), ne(products.id, id)) : eq(products.slug, data.slug));
  if (clash) return { error: `Another product already uses the URL "${data.slug}". Change the slug.` };

  if (id) await db().update(products).set(data).where(eq(products.id, id));
  else await db().insert(products).values(data);

  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function deleteProduct(form: FormData) {
  await requireAdmin();
  await db().delete(products).where(eq(products.id, Number(form.get("id"))));
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

// ---------- Orders ----------

export async function updateOrderStatus(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  const status = z.enum(ORDER_STATUSES).parse(form.get("status"));

  const [before] = await db().select().from(orders).where(eq(orders.id, id));
  // Cancelled is final: its stock has already been returned.
  if (!before || before.status === status || before.status === "cancelled") return;

  const [order] = await db().update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id)).returning();
  if (status === "cancelled") await restoreStock(order.items);

  await sendOrderStatus(order);
  revalidatePath("/admin/orders");
}

// ---------- Commissions ----------

export async function updateCommission(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  const quote = String(form.get("quoteAmount") ?? "").replace(/[^\d]/g, "");
  await db()
    .update(commissions)
    .set({
      status: z.enum(COMMISSION_STATUSES).parse(form.get("status")),
      quoteAmount: quote ? Number(quote) : null,
      adminNotes: String(form.get("adminNotes") ?? "").slice(0, 4000),
    })
    .where(eq(commissions.id, id));
  revalidatePath("/admin/commissions");
}
