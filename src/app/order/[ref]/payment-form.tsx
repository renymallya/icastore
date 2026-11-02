"use client";

import { useActionState } from "react";
import { submitPayment } from "@/app/actions";

export function PaymentForm({ orderRef, submittedCode }: { orderRef: string; submittedCode: string | null }) {
  const [state, action, pending] = useActionState(submitPayment, undefined);

  if (state?.ok || submittedCode) {
    return (
      <div className="text-sm">
        <p className="font-medium">Payment code received{submittedCode ? `: ${submittedCode}` : ""}.</p>
        <p className="mt-1 text-muted">
          We’ll confirm it against our M-Pesa statement and email/SMS you once it’s verified, usually within a few hours.
        </p>
        {submittedCode && !state?.ok && (
          <details className="mt-3">
            <summary className="cursor-pointer text-clay">Entered the wrong code?</summary>
            <CodeForm orderRef={orderRef} action={action} pending={pending} error={state?.error} />
          </details>
        )}
      </div>
    );
  }

  return <CodeForm orderRef={orderRef} action={action} pending={pending} error={state?.error} />;
}

function CodeForm({ orderRef, action, pending, error }: { orderRef: string; action: (f: FormData) => void; pending: boolean; error?: string }) {
  return (
    <form action={action} className="mt-2 space-y-3">
      <input type="hidden" name="ref" value={orderRef} />
      <label className="label" htmlFor="mpesaCode">
        After paying, enter the M-Pesa transaction code from your SMS
      </label>
      <div className="flex gap-2">
        <input id="mpesaCode" name="mpesaCode" required className="input uppercase" placeholder="e.g. 9KX7ABC12D" autoComplete="off" />
        <button className="btn shrink-0" disabled={pending}>
          {pending ? "Sending…" : "Submit"}
        </button>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </form>
  );
}
