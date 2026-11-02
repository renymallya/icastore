"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <div className="container-page max-w-sm py-24">
      <h1 className="font-display text-3xl">Admin sign in</h1>
      <form action={action} className="mt-6 space-y-4">
        <input name="password" type="password" required className="input" placeholder="Password" autoComplete="current-password" />
        {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
        <button className="btn w-full" disabled={pending}>
          Sign in
        </button>
      </form>
    </div>
  );
}
