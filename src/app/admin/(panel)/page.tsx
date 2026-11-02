import { count, eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { commissions, db, orders, products } from "@/db";

export default async function Dashboard() {
  const [[toVerify], [awaiting], [newCommissions], [productCount]] = await Promise.all([
    db().select({ n: count() }).from(orders).where(eq(orders.status, "payment_submitted")),
    db().select({ n: count() }).from(orders).where(eq(orders.status, "awaiting_payment")),
    db().select({ n: count() }).from(commissions).where(inArray(commissions.status, ["new"])),
    db().select({ n: count() }).from(products),
  ]);

  const tiles = [
    { label: "Payments to verify", n: toVerify.n, href: "/admin/orders?status=payment_submitted" },
    { label: "Awaiting payment", n: awaiting.n, href: "/admin/orders?status=awaiting_payment" },
    { label: "New custom requests", n: newCommissions.n, href: "/admin/commissions" },
    { label: "Products", n: productCount.n, href: "/admin/products" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {tiles.map((t) => (
        <Link key={t.label} href={t.href} className="rounded-sm border border-sand bg-white p-5 hover:border-ink">
          <p className="text-3xl">{t.n}</p>
          <p className="mt-1 text-sm text-muted">{t.label}</p>
        </Link>
      ))}
    </div>
  );
}
