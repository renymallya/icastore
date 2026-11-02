import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db, products } from "@/db";
import { deleteProduct } from "../../../actions";
import { ProductForm } from "../product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [product] = await db().select().from(products).where(eq(products.id, Number((await params).id)));
  if (!product) notFound();
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Edit: {product.name}</h1>
      <ProductForm product={product} />
      <form action={deleteProduct} className="mt-12 border-t border-sand pt-6">
        <input type="hidden" name="id" value={product.id} />
        <p className="text-sm text-muted">To take it off the shop but keep it, untick “Visible in shop” instead.</p>
        <button className="mt-2 text-sm text-red-700 underline">Delete product permanently</button>
      </form>
    </div>
  );
}
