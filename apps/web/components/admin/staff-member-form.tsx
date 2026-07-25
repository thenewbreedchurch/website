"use client";

import { useActionState } from "react";
import type { StaffMember } from "@nb-church/db";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FormStatus } from "@/components/admin/form-status";
import type { ActionResult } from "@/lib/action-result";

export function StaffMemberForm({
  staffMember,
  action,
}: {
  staffMember?: StaffMember;
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
}) {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    action,
    null
  );
  const err = (f: string) => (state && !state.ok ? state.fieldErrors?.[f] : undefined);

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      <Field label="Name" htmlFor="name" error={err("name")}>
        <Input id="name" name="name" defaultValue={staffMember?.name} required />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Role / Title" htmlFor="role" error={err("role")} hint="e.g. Senior Pastor">
          <Input id="role" name="role" defaultValue={staffMember?.role} required />
        </Field>
        <Field
          label="Department (optional)"
          htmlFor="department"
          error={err("department")}
          hint="e.g. Baptism & Discipleship"
        >
          <Input id="department" name="department" defaultValue={staffMember?.department ?? ""} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email (optional)" htmlFor="email" error={err("email")}>
          <Input id="email" name="email" type="email" defaultValue={staffMember?.email ?? ""} placeholder="pastor@yourchurch.org" />
        </Field>
        <Field label="Phone (optional)" htmlFor="phone" error={err("phone")}>
          <Input id="phone" name="phone" defaultValue={staffMember?.phone ?? ""} placeholder="+234 801 234 5678" />
        </Field>
      </div>

      <Field label="Photo path (optional)" htmlFor="photoUrl" error={err("photoUrl")}>
        <Input id="photoUrl" name="photoUrl" defaultValue={staffMember?.photoUrl ?? ""} placeholder="/images/staff/jane-doe.jpg" />
      </Field>

      <Field label="Bio (optional)" htmlFor="bio" error={err("bio")}>
        <Textarea id="bio" name="bio" defaultValue={staffMember?.bio ?? ""} />
      </Field>

      <Field label="Sort order" htmlFor="sortOrder" error={err("sortOrder")}>
        <Input id="sortOrder" name="sortOrder" type="number" defaultValue={staffMember?.sortOrder ?? 0} placeholder="0" />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isActive" defaultChecked={staffMember?.isActive ?? true} />
        Active (shown on About and the Leadership page)
      </label>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center rounded-full bg-brand-700 px-6 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-60 admin-dark:bg-brand-600 admin-dark:hover:bg-brand-500"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        <FormStatus state={state} />
      </div>
    </form>
  );
}
