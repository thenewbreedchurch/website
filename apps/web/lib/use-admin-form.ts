"use client";

import { useActionState, useState } from "react";
import type { ActionResult } from "@/lib/action-result";

/**
 * Wraps useActionState for every admin CRUD form. Bare useActionState
 * leaves its last result (e.g. "Sermon updated.") on screen indefinitely
 * — if an admin saves successfully, then keeps editing the same form
 * without submitting again, the stale success message stays visible next
 * to the Save button, misleadingly implying the *current* unsaved edits
 * are already saved. Confirmed live in production: editing a field right
 * after a real save left "Sermon updated." showing with no save in
 * between. `onFormChange` (wired to the <form>'s onChange, which catches
 * every field via bubbling) marks the result stale as soon as the admin
 * touches anything; the stale flag resets the moment a fresh result
 * actually arrives, so real results still show normally. Reset happens
 * directly during render (comparing against the last-seen rawState) per
 * React's documented pattern for adjusting state on a prop/value change —
 * not in a useEffect, which would cause an extra render pass.
 */
export function useAdminForm(
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>
) {
  const [rawState, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    action,
    null
  );
  const [stale, setStale] = useState(false);
  const [prevRawState, setPrevRawState] = useState(rawState);

  if (rawState !== prevRawState) {
    setPrevRawState(rawState);
    setStale(false);
  }

  return {
    state: stale ? null : rawState,
    formAction,
    isPending,
    onFormChange: () => setStale(true),
  };
}
