import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductImage } from "@/components/product-card";
import { getCategory } from "@/lib/catalog";
import { formatTZS } from "@/lib/format";
import { getProductBySlug } from "@/lib/queries";
import { AddToCart } from "./add-to-cart";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: { images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug((await params).slug);
  if (!product || !product.active) notFound();

  const category = getCategory(product.category);
  const soldOut = product.stock !== null && product.stock <= 0;
  const [main, ...rest] = product.images.length ? product.images : [null];

  return (
    <div className="container-page grid gap-10 py-12 md:grid-cols-2">
      <div className="space-y-3">
        <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-sand">
          <ProductImage src={main} alt={product.name} sizes="(min-width: 768px) 50vw, 100vw" priority />
        </div>
        {rest.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {rest.map((src) => (
              <div key={src} className="relative aspect-[3/4] overflow-hidden rounded-sm bg-sand">
                <ProductImage src={src} alt={product.name} sizes="12vw" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        {category && (
          <Link
            href={`/${category.section === "clothing" ? "shop" : "accessories"}?category=${category.slug}`}
            className="text-xs uppercase tracking-widest text-muted hover:text-olive"
          >
            {category.name}
          </Link>
        )}
        <h1 className="mt-2 font-display text-4xl">{product.name}</h1>
        <p className="mt-3 text-xl">
          {formatTZS(product.price)}
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <s className="ml-3 text-base text-muted">{formatTZS(product.compareAtPrice)}</s>
          )}
        </p>
        {product.stock === null ? (
          <p className="mt-2 text-sm text-muted">Made to order: allow 1–2 weeks.</p>
        ) : soldOut ? (
          <p className="mt-2 text-sm text-olive">Sold out. Ask us about making one for you.</p>
        ) : product.stock <= 3 ? (
          <p className="mt-2 text-sm text-olive">Only {product.stock} left</p>
        ) : null}

        <div className="mt-8">
          <AddToCart
            disabled={soldOut}
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.images[0] ?? null,
            }}
            sizes={product.sizes}
          />
        </div>

        <div className="mt-10 whitespace-pre-line leading-relaxed text-ink/90">{product.description}</div>

        <div className="mt-10 rounded-sm border border-sand p-5 text-sm">
          <p className="font-medium">Want it in a different size, colour or fabric?</p>
          <Link href={`/commission?based_on=${product.slug}`} className="mt-1 inline-block text-olive underline underline-offset-4">
            Request a custom version
          </Link>
        </div>
      </div>
    </div>
  );
}
