"use client";

import { useActionState, useTransition } from "react";
import type { ActionResult } from "@/lib/action-result";

/**
 * Like useActionState, but submitting never RESETS the form. React clears
 * uncontrolled fields after every <form action> submit — fine for a one-field
 * form, painful when a validation error wipes a long form or a sign-in email.
 * Use: <form onSubmit={onSubmit}>…</form>
 */
export function useKeepForm(action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>) {
  const [state, dispatch, isPending] = useActionState<ActionResult | null, FormData>(action, null);
  const [, startTransition] = useTransition();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => dispatch(formData));
  };
  return { state, onSubmit, isPending };
}
