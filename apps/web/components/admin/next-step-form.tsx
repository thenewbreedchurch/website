"use client";

import { useActionState } from "react";
import type { NextStep } from "@nb-church/db";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FormStatus } from "@/components/admin/form-status";
import type { ActionResult } from "@/lib/action-result";

export function NextStepForm({
  nextStep,
  action,
}: {
  nextStep?: NextStep;
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
}) {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    action,
    null
  );
  const err = (f: string) => (state && !state.ok ? state.fieldErrors?.[f] : undefined);

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      <Field label="Page" htmlFor="page" error={err("page")}>
        <Select id="page" name="page" defaultValue={nextStep?.page ?? "FIRST_TIMER"}>
          <option value="FIRST_TIMER">First Timers</option>
          <option value="NEW_CONVERT">New Converts</option>
        </Select>
      </Field>

      <Field label="Title" htmlFor="title" error={err("title")}>
        <Input id="title" name="title" defaultValue={nextStep?.title} required />
      </Field>

      <Field label="Body" htmlFor="body" error={err("body")}>
        <Textarea id="body" name="body" defaultValue={nextStep?.body} required />
      </Field>

      <Field label="Image path (optional)" htmlFor="imageUrl" error={err("imageUrl")}>
        <Input id="imageUrl" name="imageUrl" defaultValue={nextStep?.imageUrl ?? ""} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="CTA label (optional)" htmlFor="ctaLabel" error={err("ctaLabel")}>
          <Input id="ctaLabel" name="ctaLabel" defaultValue={nextStep?.ctaLabel ?? ""} />
        </Field>
        <Field label="CTA URL (optional)" htmlFor="ctaUrl" error={err("ctaUrl")}>
          <Input id="ctaUrl" name="ctaUrl" defaultValue={nextStep?.ctaUrl ?? ""} />
        </Field>
      </div>

      <Field label="Sort order" htmlFor="sortOrder" error={err("sortOrder")}>
        <Input id="sortOrder" name="sortOrder" type="number" defaultValue={nextStep?.sortOrder ?? 0} />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isActive" defaultChecked={nextStep?.isActive ?? true} />
        Active
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
