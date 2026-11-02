import Link from "next/link";
import { categoriesFor, type Section } from "@/lib/catalog";

export function CategoryNav({ section, basePath, active }: { section: Section; basePath: string; active?: string }) {
  const pill = (on: boolean) =>
    `whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition ${
      on ? "border-ink bg-ink text-cream" : "border-sand hover:border-ink"
    }`;
  return (
    <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2" aria-label="Categories">
      <Link href={basePath} className={pill(!active)}>
        All
      </Link>
      {categoriesFor(section).map((c) => (
        <Link key={c.slug} href={`${basePath}?category=${c.slug}`} className={pill(active === c.slug)}>
          {c.name}
        </Link>
      ))}
    </nav>
  );
}
