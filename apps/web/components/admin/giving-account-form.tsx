"use client";

import { useActionState } from "react";
import type { GivingAccount } from "@nb-church/db";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FormStatus } from "@/components/admin/form-status";
import type { ActionResult } from "@/lib/action-result";

export function GivingAccountForm({
  account,
  action,
}: {
  account?: GivingAccount;
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
}) {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    action,
    null
  );
  const err = (f: string) => (state && !state.ok ? state.fieldErrors?.[f] : undefined);

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Fund name" htmlFor="fundName" error={err("fundName")} hint="e.g. Offerings & Tithe">
          <Input id="fundName" name="fundName" defaultValue={account?.fundName} required />
        </Field>
        <Field label="Currency" htmlFor="currency" error={err("currency")}>
          <Input id="currency" name="currency" defaultValue={account?.currency ?? "NGN"} required />
        </Field>
      </div>

      <Field label="Bank name" htmlFor="bankName" error={err("bankName")}>
        <Input id="bankName" name="bankName" defaultValue={account?.bankName} required />
      </Field>

      <Field label="Account number" htmlFor="accountNumber" error={err("accountNumber")}>
        <Input id="accountNumber" name="accountNumber" defaultValue={account?.accountNumber} required />
      </Field>

      <Field label="Account name" htmlFor="accountName" error={err("accountName")}>
        <Input id="accountName" name="accountName" defaultValue={account?.accountName} required />
      </Field>

      <Field label="Swift code (optional)" htmlFor="swiftCode" error={err("swiftCode")}>
        <Input id="swiftCode" name="swiftCode" defaultValue={account?.swiftCode ?? ""} />
      </Field>

      <Field label="Sort order" htmlFor="sortOrder" error={err("sortOrder")}>
        <Input id="sortOrder" name="sortOrder" type="number" defaultValue={account?.sortOrder ?? 0} />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isActive" defaultChecked={account?.isActive ?? true} />
        Active (shown on the public Give page)
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
