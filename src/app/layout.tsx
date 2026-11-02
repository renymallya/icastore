import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Link from "next/link";
import { CartCount, CartProvider } from "@/components/cart";
import { store } from "@/lib/config";
import "./globals.css";

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-cormorant" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(store.siteUrl),
  title: { default: "icastore – Handmade clothing", template: "%s · icastore" },
  description:
    "Handmade everyday wear, batik, linen, evening and bridal clothing, plus shoes, handbags and accessories. Custom orders welcome.",
};

const nav = [
  { href: "/shop", label: "Clothing" },
  { href: "/shop?category=bridal", label: "Bridal" },
  { href: "/accessories", label: "Accessories" },
  { href: "/commission", label: "Custom orders" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <CartProvider>
          <header className="sticky top-0 z-20 border-b border-sand bg-cream/95 backdrop-blur">
            <div className="container-page flex h-16 items-center justify-between gap-4">
              <Link href="/" className="font-display text-2xl tracking-[0.2em] text-clay">
                icastore
              </Link>
              <nav className="hidden gap-6 text-sm md:flex">
                {nav.map((n) => (
                  <Link key={n.href} href={n.href} className="hover:text-clay">
                    {n.label}
                  </Link>
                ))}
              </nav>
              <Link href="/cart" className="text-sm hover:text-clay">
                <CartCount />
              </Link>
            </div>
            <nav className="container-page flex gap-5 overflow-x-auto pb-3 text-sm md:hidden">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="whitespace-nowrap">
                  {n.label}
                </Link>
              ))}
            </nav>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="mt-24 border-t border-sand bg-sand/40">
            <div className="container-page grid gap-8 py-12 text-sm md:grid-cols-3">
              <div>
                <p className="font-display text-xl tracking-[0.2em] text-clay">icastore</p>
                <p className="mt-2 text-muted">{store.tagline}</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Shop</p>
                <Link href="/shop" className="block text-muted hover:text-ink">Clothing</Link>
                <Link href="/accessories" className="block text-muted hover:text-ink">Accessories</Link>
                <Link href="/commission" className="block text-muted hover:text-ink">Custom orders</Link>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Payment</p>
                <p className="text-muted">M-Pesa Lipa Namba {store.lipaNamba}</p>
                {store.whatsapp && (
                  <a href={`https://wa.me/${store.whatsapp}`} className="block text-muted hover:text-ink">
                    WhatsApp us
                  </a>
                )}
              </div>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
