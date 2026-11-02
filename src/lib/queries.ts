import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db, products } from "@/db";
import { categoriesFor, type Section } from "./catalog";

export async function listProducts(opts: { section?: Section; category?: string; featured?: boolean; limit?: number }) {
  const filters = [eq(products.active, true)];
  if (opts.category) filters.push(eq(products.category, opts.category));
  else if (opts.section) filters.push(inArray(products.category, categoriesFor(opts.section).map((c) => c.slug)));
  if (opts.featured) filters.push(eq(products.featured, true));

  return db()
    .select()
    .from(products)
    .where(and(...filters))
    .orderBy(desc(products.featured), desc(products.createdAt))
    .limit(opts.limit ?? 200);
}

export async function getProductBySlug(slug: string) {
  const [row] = await db().select().from(products).where(eq(products.slug, slug)).limit(1);
  return row ?? null;
}
