"use client";

import { useActionState } from "react";
import type { Announcement } from "@nb-church/db";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FormStatus } from "@/components/admin/form-status";
import type { ActionResult } from "@/lib/action-result";
import { CHURCH_TZ } from "@/lib/announcements";

const CATEGORIES = ["SERVICE", "OUTREACH", "YOUTH", "SPECIAL", "FUNDRAISER", "OTHER"] as const;
const STATUSES = ["DRAFT", "PUBLISHED", "CANCELLED"] as const;

function toLocalInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return formatInTimeZone(date, CHURCH_TZ, "yyyy-MM-dd'T'HH:mm");
}

export function AnnouncementForm({
  announcement,
  action,
}: {
  announcement?: Announcement;
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
}) {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    action,
    null
  );
  const err = (f: string) => (state && !state.ok ? state.fieldErrors?.[f] : undefined);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" htmlFor="title" error={err("title")}>
          <Input id="title" name="title" defaultValue={announcement?.title} required placeholder="Sunday Worship Service" />
        </Field>
        <Field label="Slug" htmlFor="slug" error={err("slug")} hint="lowercase-with-hyphens, used in the URL">
          <Input id="slug" name="slug" defaultValue={announcement?.slug} required placeholder="summer-picnic-2026" />
        </Field>
      </div>

      <Field label="Description" htmlFor="description" error={err("description")}>
        <Textarea id="description" name="description" rows={5} defaultValue={announcement?.description} required placeholder="Join us for an evening of worship and fellowship..." />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" htmlFor="category" error={err("category")}>
          <Select id="category" name="category" defaultValue={announcement?.category ?? "OTHER"}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Status"
          htmlFor="status"
          error={err("status")}
          hint="Draft won't appear on the public site until published."
        >
          <Select id="status" name="status" defaultValue={announcement?.status ?? "DRAFT"}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start date/time (Lagos time)" htmlFor="startDateTime" error={err("startDateTime")}>
          <Input
            id="startDateTime"
            name="startDateTime"
            type="datetime-local"
            defaultValue={toLocalInputValue(announcement?.startDateTime ?? null) || toLocalInputValue(toZonedTime(new Date(), CHURCH_TZ))}
            required
          />
        </Field>
        <Field label="End date/time (optional)" htmlFor="endDateTime" error={err("endDateTime")}>
          <Input
            id="endDateTime"
            name="endDateTime"
            type="datetime-local"
            defaultValue={toLocalInputValue(announcement?.endDateTime ?? null)}
          />
        </Field>
      </div>

      <Field
        label="Recurrence rule (optional)"
        htmlFor="recurrenceRule"
        error={err("recurrenceRule")}
        hint="Must be RRULE syntax, not plain English — e.g. FREQ=WEEKLY;BYDAY=SU for every Sunday, or FREQ=MONTHLY;BYDAY=-1SA for the last Saturday of the month. Leave blank for a one-time event."
      >
        <Input id="recurrenceRule" name="recurrenceRule" defaultValue={announcement?.recurrenceRule ?? ""} />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isOnline" defaultChecked={announcement?.isOnline ?? false} />
        Online event
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Location" htmlFor="location" error={err("location")}>
          <Input id="location" name="location" defaultValue={announcement?.location ?? ""} placeholder="Main Sanctuary, or 123 Church Rd" />
        </Field>
        <Field
          label="Online URL"
          htmlFor="onlineUrl"
          error={err("onlineUrl")}
          hint="Full web address starting with https:// (e.g. https://meet.google.com/abc-defg-hij) — only needed if this is online."
        >
          <Input id="onlineUrl" name="onlineUrl" defaultValue={announcement?.onlineUrl ?? ""} />
        </Field>
      </div>

      <Field
        label="Hero image path"
        htmlFor="heroImageUrl"
        error={err("heroImageUrl")}
        hint="Must be a path to an image already uploaded to this website, starting with /images/... (e.g. /images/announcements/announcements-cultural-event.jpg) — not a link copied from Facebook, Google Photos, or another website, which will break the page. Leave blank to use a default image."
      >
        <Input id="heroImageUrl" name="heroImageUrl" defaultValue={announcement?.heroImageUrl ?? ""} />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="registrationRequired" defaultChecked={announcement?.registrationRequired ?? false} />
        Registration required
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Registration deadline" htmlFor="registrationDeadline" error={err("registrationDeadline")}>
          <Input
            id="registrationDeadline"
            name="registrationDeadline"
            type="datetime-local"
            defaultValue={toLocalInputValue(announcement?.registrationDeadline ?? null)}
          />
        </Field>
        <Field label="Capacity" htmlFor="capacity" error={err("capacity")}>
          <Input id="capacity" name="capacity" type="number" min={1} defaultValue={announcement?.capacity ?? ""} />
        </Field>
      </div>

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
