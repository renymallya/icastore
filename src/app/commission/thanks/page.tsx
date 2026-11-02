import Link from "next/link";

export default async function ThanksPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  return (
    <div className="container-page max-w-xl py-24 text-center">
      <h1 className="font-display text-4xl">Thank you</h1>
      <p className="mt-4 text-muted">
        We’ve received your custom order request{ref ? ` (reference ${ref})` : ""}. We’ll contact you with a quote and
        timeline, usually within one working day.
      </p>
      <Link href="/shop" className="btn mt-8">
        Keep browsing
      </Link>
    </div>
  );
}
