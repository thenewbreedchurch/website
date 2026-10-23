"use client";

import { useAdminForm } from "@/lib/use-admin-form";
import { Textarea } from "@/components/ui/textarea";
import { FormStatus } from "@/components/admin/form-status";
import type { ActionResult } from "@/lib/action-result";

export function WelfareNotesForm({
  defaultValue,
  action,
}: {
  defaultValue: string;
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
}) {
  const { state, formAction, isPending, onFormChange } = useAdminForm(action);
  return (
    <form action={formAction} onChange={onFormChange} className="space-y-3">
      <Textarea
        name="adminNotes"
        rows={5}
        maxLength={4000}
        defaultValue={defaultValue}
        aria-label="Internal notes"
        placeholder="Internal notes for the welfare team (never shown to the applicant)"
      />
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center rounded-none bg-brand-700 px-6 text-sm font-bold uppercase tracking-tight text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save notes"}
        </button>
        <FormStatus state={state} />
      </div>
    </form>
  );
}
