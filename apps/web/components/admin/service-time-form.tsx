"use client";

import { useActionState } from "react";
import type { ServiceTime } from "@nb-church/db";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FormStatus } from "@/components/admin/form-status";
import type { ActionResult } from "@/lib/action-result";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

export function ServiceTimeForm({
  serviceTime,
  action,
}: {
  serviceTime?: ServiceTime;
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
}) {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    action,
    null
  );
  const err = (f: string) => (state && !state.ok ? state.fieldErrors?.[f] : undefined);

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      <Field label="Day of week" htmlFor="dayOfWeek" error={err("dayOfWeek")}>
        <Select id="dayOfWeek" name="dayOfWeek" defaultValue={serviceTime?.dayOfWeek ?? "SUN"}>
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Label" htmlFor="label" error={err("label")}>
        <Input id="label" name="label" defaultValue={serviceTime?.label} required placeholder="Sunday Service" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start time (HH:MM)" htmlFor="startTime" error={err("startTime")}>
          <Input id="startTime" name="startTime" defaultValue={serviceTime?.startTime} required placeholder="09:00" />
        </Field>
        <Field label="End time (HH:MM, optional)" htmlFor="endTime" error={err("endTime")}>
          <Input id="endTime" name="endTime" defaultValue={serviceTime?.endTime ?? ""} placeholder="11:00" />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isOnline" defaultChecked={serviceTime?.isOnline ?? false} />
        Online
      </label>

      <Field label="Online URL" htmlFor="onlineUrl" error={err("onlineUrl")}>
        <Input id="onlineUrl" name="onlineUrl" defaultValue={serviceTime?.onlineUrl ?? ""} />
      </Field>

      <Field label="Location (optional)" htmlFor="location" error={err("location")}>
        <Input id="location" name="location" defaultValue={serviceTime?.location ?? ""} />
      </Field>

      <Field label="Sort order" htmlFor="sortOrder" error={err("sortOrder")}>
        <Input id="sortOrder" name="sortOrder" type="number" defaultValue={serviceTime?.sortOrder ?? 0} />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isActive" defaultChecked={serviceTime?.isActive ?? true} />
        Active (shown on the public site)
      </label>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center rounded-full bg-brand-700 px-6 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-60 dark:bg-brand-600 dark:hover:bg-brand-500"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        <FormStatus state={state} />
      </div>
    </form>
  );
}
