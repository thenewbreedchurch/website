"use client";

import { useActionState } from "react";
import type { Testimony } from "@nb-church/db";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FormStatus } from "@/components/admin/form-status";
import type { ActionResult } from "@/lib/action-result";

export function TestimonyForm({
  testimony,
  action,
}: {
  testimony?: Testimony;
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
}) {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    action,
    null
  );
  const err = (f: string) => (state && !state.ok ? state.fieldErrors?.[f] : undefined);

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <Field label="Author name" htmlFor="authorName" error={err("authorName")}>
        <Input id="authorName" name="authorName" defaultValue={testimony?.authorName} required />
      </Field>

      <Field label="Author photo path (optional)" htmlFor="authorPhotoUrl" error={err("authorPhotoUrl")}>
        <Input id="authorPhotoUrl" name="authorPhotoUrl" defaultValue={testimony?.authorPhotoUrl ?? ""} />
      </Field>

      <Field label="Testimony" htmlFor="body" error={err("body")}>
        <Textarea id="body" name="body" rows={5} defaultValue={testimony?.body} required />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isFeatured" defaultChecked={testimony?.isFeatured ?? false} />
        Featured
      </label>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isApproved" defaultChecked={testimony?.isApproved ?? false} />
        Approved (shown on the public homepage)
      </label>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center rounded-full bg-brand-700 px-6 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        <FormStatus state={state} />
      </div>
    </form>
  );
}
