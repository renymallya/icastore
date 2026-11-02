export function formatTZS(amount: number) {
  return `TZS ${amount.toLocaleString("en-US")}`;
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-");
}

// Short reference customers can read out over the phone. No 0/O/1/I.
export function makeRef(prefix: string) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const body = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `${prefix}-${body}`;
}

export function humanize(status: string) {
  return status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}
