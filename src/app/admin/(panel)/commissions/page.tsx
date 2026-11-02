import { desc } from "drizzle-orm";
import Image from "next/image";
import { COMMISSION_STATUSES, commissions, db } from "@/db";
import { formatDate, formatTZS, humanize } from "@/lib/format";
import { updateCommission } from "../../actions";

export default async function CommissionsAdmin() {
  const rows = await db().select().from(commissions).orderBy(desc(commissions.createdAt)).limit(200);

  return (
    <div>
      <h1 className="font-display text-3xl">Custom orders</h1>
      <div className="mt-6 space-y-4">
        {rows.map((c) => (
          <div key={c.id} className="rounded-sm border border-sand bg-white p-5 text-sm">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <p className="font-medium">{c.ref} · {c.garmentType}</p>
                <p className="text-muted">{formatDate(c.createdAt)} · {humanize(c.status)}</p>
                <p className="mt-2">
                  {c.name} · <a href={`tel:${c.phone}`} className="underline">{c.phone}</a>{c.email ? ` · ${c.email}` : ""}
                </p>
              </div>
              <div className="text-right text-muted">
                {c.occasion && <p>Occasion: {c.occasion}</p>}
                {c.neededBy && <p>Needed by: {formatDate(c.neededBy)}</p>}
                {c.budget && <p>Budget: {formatTZS(c.budget)}</p>}
                {c.fabric && <p>Fabric: {c.fabric}</p>}
              </div>
            </div>
            <p className="mt-3 whitespace-pre-line">{c.details}</p>
            {c.measurements && <p className="mt-2 whitespace-pre-line text-muted">Measurements: {c.measurements}</p>}
            {c.referenceImages.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {c.referenceImages.map((u) => (
                  <a key={u} href={u} target="_blank" rel="noreferrer" className="relative block h-24 w-20 overflow-hidden rounded-sm bg-sand">
                    <Image src={u} alt="" fill sizes="80px" className="object-cover" />
                  </a>
                ))}
              </div>
            )}
            <form action={updateCommission} className="mt-4 grid gap-2 sm:grid-cols-[auto_auto_1fr_auto]">
              <input type="hidden" name="id" value={c.id} />
              <select name="status" defaultValue={c.status} className="input">
                {COMMISSION_STATUSES.map((s) => (
                  <option key={s} value={s}>{humanize(s)}</option>
                ))}
              </select>
              <input name="quoteAmount" placeholder="Quote TZS" inputMode="numeric" className="input" defaultValue={c.quoteAmount ?? ""} />
              <input name="adminNotes" placeholder="Private notes" className="input" defaultValue={c.adminNotes} />
              <button className="btn-outline py-2">Save</button>
            </form>
          </div>
        ))}
        {!rows.length && <p className="py-10 text-center text-muted">No custom requests yet.</p>}
      </div>
    </div>
  );
}
