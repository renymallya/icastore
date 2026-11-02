import { desc } from "drizzle-orm";
import Link from "next/link";
import { db, products } from "@/db";
import { getCategory } from "@/lib/catalog";
import { formatTZS } from "@/lib/format";

export default async function ProductsAdmin() {
  const rows = await db().select().from(products).orderBy(desc(products.createdAt));
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Products</h1>
        <Link href="/admin/products/new" className="btn">Add product</Link>
      </div>
      <table className="mt-6 w-full text-left text-sm">
        <thead className="border-b border-sand text-muted">
          <tr><th className="py-2">Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className="border-b border-sand">
              <td className="py-2"><Link href={`/admin/products/${p.id}`} className="underline">{p.name}</Link></td>
              <td>{getCategory(p.category)?.name ?? p.category}</td>
              <td>{formatTZS(p.price)}</td>
              <td>{p.stock ?? "Made to order"}</td>
              <td>{p.active ? (p.featured ? "Live · featured" : "Live") : "Hidden"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <p className="py-10 text-center text-muted">No products yet.</p>}
    </div>
  );
}
