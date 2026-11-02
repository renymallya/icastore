import Link from "next/link";
import { ProductGrid } from "@/components/product-card";
import { categoriesFor } from "@/lib/catalog";
import { listProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await listProducts({ featured: true, limit: 8 });

  return (
    <>
      <section className="relative border-b border-sand">
        <div>
          <div className="container-page py-24 md:py-36">
            <p className="text-xs uppercase tracking-[0.3em] text-olive">Handmade in Tanzania</p>
            <h1 className="mt-4 max-w-2xl font-display text-5xl leading-tight md:text-6xl">
              Clothes made by hand, for every day and your biggest day.
            </h1>
            <p className="mt-6 max-w-xl text-muted">
              Everyday wear, batik, linen, evening gowns and bridal, each piece cut and sewn by hand. Want something
              that’s only yours? Commission it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn">
                Shop clothing
              </Link>
              <Link href="/commission" className="btn-outline">
                Start a custom order
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page mt-20">
        <h2 className="font-display text-3xl">Shop by collection</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          {categoriesFor("clothing").map((c) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className="group flex aspect-[4/5] flex-col justify-end rounded-sm bg-sand p-4 transition hover:bg-olive hover:text-cream"
            >
              <span className="font-display text-xl">{c.name}</span>
              <span className="mt-1 text-xs text-muted group-hover:text-cream/80">{c.blurb}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page mt-20">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl">Featured pieces</h2>
          <Link href="/shop" className="text-sm underline underline-offset-4">
            View all
          </Link>
        </div>
        <div className="mt-8">
          <ProductGrid products={featured} />
        </div>
      </section>

      <section className="container-page mt-20 grid gap-8 rounded-sm bg-ink p-10 text-cream md:grid-cols-2 md:p-16">
        <div>
          <h2 className="font-display text-4xl">Made to your measure</h2>
          <p className="mt-4 text-cream/80">
            Bridal gowns, matching family outfits, a batik suit for an event: tell us your idea, share photos and
            measurements, and we’ll send you a quote and timeline.
          </p>
        </div>
        <div className="flex items-center md:justify-end">
          <Link href="/commission" className="btn bg-cream text-ink hover:bg-olive hover:text-cream">
            Commission a piece
          </Link>
        </div>
      </section>

      <section className="container-page mt-20">
        <h2 className="font-display text-3xl">Finish the look</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          {categoriesFor("accessories").map((c) => (
            <Link key={c.slug} href={`/accessories?category=${c.slug}`} className="rounded-sm border border-sand p-5 hover:border-ink">
              <span className="font-display text-xl">{c.name}</span>
              <span className="mt-1 block text-xs text-muted">{c.blurb}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
