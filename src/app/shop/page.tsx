import type { Metadata } from "next";
import { CategoryNav } from "@/components/category-nav";
import { ProductGrid } from "@/components/product-card";
import { getCategory } from "@/lib/catalog";
import { listProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Clothing" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const cat = getCategory(category);
  const active = cat?.section === "clothing" ? cat : undefined;
  const items = await listProducts({ section: "clothing", category: active?.slug });

  return (
    <div className="container-page py-12">
      <h1 className="font-display text-4xl">{active?.name ?? "Clothing"}</h1>
      <p className="mt-2 text-muted">{active?.blurb ?? "Everyday, traditional, linen, evening and bridal, all handmade."}</p>
      <div className="mt-8">
        <CategoryNav section="clothing" basePath="/shop" active={active?.slug} />
      </div>
      <div className="mt-8">
        <ProductGrid products={items} />
      </div>
    </div>
  );
}
