import "server-only";
import { and, eq, isNotNull, sql } from "drizzle-orm";
import { db, products, type OrderItem } from "@/db";

// Not in a "use server" file on purpose: it must never be callable from the browser.
export async function restoreStock(items: OrderItem[]) {
  for (const item of items) {
    await db()
      .update(products)
      .set({ stock: sql`${products.stock} + ${item.quantity}` })
      .where(and(eq(products.id, item.productId), isNotNull(products.stock)));
  }
}
