import type { Metadata } from "next";
import { CommissionForm } from "./commission-form";

export const metadata: Metadata = {
  title: "Custom orders",
  description: "Commission a handmade outfit: bridal, evening, batik or everyday, made to your measurements.",
};

export default async function CommissionPage({ searchParams }: { searchParams: Promise<{ based_on?: string }> }) {
  const { based_on } = await searchParams;
  return (
    <div className="container-page grid gap-12 py-12 md:grid-cols-[1fr_1.4fr]">
      <div>
        <h1 className="font-display text-4xl">Commission a piece</h1>
        <p className="mt-4 text-muted">
          Tell us what you’d like made. A bridal gown, outfits for the whole wedding party, a batik shirt in your
          size, a copy of something you love in a different fabric.
        </p>
        <ol className="mt-8 space-y-4 text-sm">
          <li><b>1. Send your idea</b><br />Describe it, add photos or sketches, and your measurements if you have them.</li>
          <li><b>2. Get a quote</b><br />We contact you with a price, fabric options and a timeline.</li>
          <li><b>3. Pay a deposit</b><br />A deposit via M-Pesa Lipa Namba starts the work. Fittings are arranged if needed.</li>
          <li><b>4. Collect or receive it</b><br />Pay the balance and we deliver or you pick up.</li>
        </ol>
      </div>
      <CommissionForm basedOn={based_on} />
    </div>
  );
}
