"use client";

import { useActionState } from "react";
import { createCommission } from "@/app/actions";
import { ImageUploader } from "@/components/image-uploader";

const GARMENTS = ["Bridal gown", "Bridesmaid / wedding party", "Evening gown", "Batik / kitenge outfit", "Linen outfit", "Everyday dress", "Shirt / suit", "Other"];

export function CommissionForm({ basedOn }: { basedOn?: string }) {
  const [state, action, pending] = useActionState(createCommission, undefined);

  return (
    <form action={action} className="space-y-5 rounded-sm bg-white p-6 shadow-sm md:p-8">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Your name</label>
          <input id="name" name="name" required className="input" autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone / WhatsApp</label>
          <input id="phone" name="phone" required className="input" inputMode="tel" placeholder="0712 345 678" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="email">Email (optional)</label>
        <input id="email" name="email" type="email" className="input" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="garmentType">What would you like made?</label>
          <select id="garmentType" name="garmentType" required className="input" defaultValue="">
            <option value="" disabled>Choose…</option>
            {GARMENTS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="occasion">Occasion</label>
          <input id="occasion" name="occasion" className="input" placeholder="Wedding, send-off, office…" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="neededBy">Needed by</label>
          <input id="neededBy" name="neededBy" type="date" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="budget">Budget (TZS, optional)</label>
          <input id="budget" name="budget" inputMode="numeric" className="input" placeholder="e.g. 250,000" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="fabric">Fabric preference</label>
        <input id="fabric" name="fabric" className="input" placeholder="Batik, linen, lace, satin, kitenge, not sure…" />
      </div>

      <div>
        <label className="label" htmlFor="details">Describe your idea</label>
        <textarea
          id="details"
          name="details"
          required
          rows={5}
          className="input"
          defaultValue={basedOn ? `Based on: ${basedOn}\n\n` : ""}
          placeholder="Style, colours, length, sleeves, how many people…"
        />
      </div>

      <div>
        <label className="label" htmlFor="measurements">Measurements (optional)</label>
        <textarea id="measurements" name="measurements" rows={3} className="input" placeholder="Bust, waist, hips, height, shoulder… in cm. We can also take them at a fitting." />
      </div>

      <div>
        <span className="label">Inspiration photos (up to 6)</span>
        <ImageUploader folder="commissions" />
      </div>

      {state?.error && <p className="rounded-sm bg-red-50 px-4 py-3 text-sm text-red-800">{state.error}</p>}

      <button type="submit" className="btn w-full" disabled={pending}>
        {pending ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}
