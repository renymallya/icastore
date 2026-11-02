import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/db/schema";
import { getCategory } from "@/lib/catalog";
import { formatTZS } from "@/lib/format";

export function ProductImage({ src, alt, sizes, priority }: { src?: string | null; alt: string; sizes: string; priority?: boolean }) {
  if (!src) {
    return <div className="batik-placeholder absolute inset-0" aria-hidden />;
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />;
}

export function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock !== null && product.stock <= 0;
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-sand">
        <div className="absolute inset-0 transition duration-500 group-hover:scale-105">
          <ProductImage src={product.images[0]} alt={product.name} sizes="(min-width: 1024px) 25vw, 50vw" />
        </div>
        {soldOut && <span className="absolute left-2 top-2 bg-ink px-2 py-0.5 text-xs text-cream">Sold out</span>}
      </div>
      <p className="mt-3 text-xs uppercase tracking-widest text-muted">{getCategory(product.category)?.name}</p>
      <h3 className="font-display text-lg leading-snug">{product.name}</h3>
      <p className="text-sm">
        {formatTZS(product.price)}
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <s className="ml-2 text-muted">{formatTZS(product.compareAtPrice)}</s>
        )}
      </p>
    </Link>
  );
}

export function ProductGrid({ products, empty }: { products: Product[]; empty?: string }) {
  if (!products.length) {
    return <p className="py-16 text-center text-muted">{empty ?? "New pieces are on the way. Check back soon."}</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
