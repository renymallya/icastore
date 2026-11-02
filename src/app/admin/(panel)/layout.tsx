import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="container-page py-8">
      <nav className="mb-8 flex flex-wrap items-center gap-6 border-b border-sand pb-4 text-sm">
        <Link href="/admin" className="font-medium">Dashboard</Link>
        <Link href="/admin/orders">Orders</Link>
        <Link href="/admin/commissions">Custom orders</Link>
        <Link href="/admin/products">Products</Link>
        <form action={logout} className="ml-auto">
          <button className="text-muted underline">Sign out</button>
        </form>
      </nav>
      {children}
    </div>
  );
}
