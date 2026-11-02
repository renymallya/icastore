"use client";

import { useActionState } from "react";
import { ImageUploader } from "@/components/image-uploader";
import type { Product } from "@/db/schema";
import { CATEGORIES } from "@/lib/catalog";
import { saveProduct } from "../../actions";

export function ProductForm({ product }: { product?: Product }) {
  const [state, action, pending] = useActionState(saveProduct, undefined);

  return (
    <form action={action} className="max-w-2xl space-y-5">
      {product && <input type="hidden" name="id" value={product.id} />}
      <div>
        <label className="label" htmlFor="name">Name</label>
        <input id="name" name="name" required className="input" defaultValue={product?.name} />
      </div>
      <div>
        <label className="label" htmlFor="slug">URL slug (leave blank to generate from name)</label>
        <input id="slug" name="slug" className="input" defaultValue={product?.slug} />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="category">Category</label>
          <select id="category" name="category" className="input" defaultValue={product?.category ?? "casual"}>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.section === "accessories" ? "Accessories · " : ""}
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="price">Price (TZS)</label>
          <input id="price" name="price" required inputMode="numeric" className="input" defaultValue={product?.price} />
        </div>
        <div>
          <label className="label" htmlFor="compareAtPrice">Was price (optional)</label>
          <input id="compareAtPrice" name="compareAtPrice" inputMode="numeric" className="input" defaultValue={product?.compareAtPrice ?? ""} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="sizes">Sizes, comma separated (blank = one size)</label>
          <input id="sizes" name="sizes" className="input" placeholder="S, M, L, XL" defaultValue={product?.sizes.join(", ")} />
        </div>
        <div>
          <label className="label" htmlFor="stock">Stock (blank = made to order)</label>
          <input id="stock" name="stock" inputMode="numeric" className="input" defaultValue={product?.stock ?? ""} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={6} className="input" defaultValue={product?.description} />
      </div>
      <div>
        <span className="label">Photos (first one is the main image)</span>
        <ImageUploader folder="products" initial={product?.images} max={8} />
      </div>
      <div className="flex gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="active" defaultChecked={product?.active ?? true} /> Visible in shop
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" defaultChecked={product?.featured} /> Featured on home page
        </label>
      </div>
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      <button className="btn" disabled={pending}>{pending ? "Saving…" : "Save product"}</button>
    </form>
  );
}
