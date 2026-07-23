"use client";

import { useActionState } from "react";
import type { Sermon } from "@nb-church/db";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormStatus } from "@/components/admin/form-status";
import type { ActionResult } from "@/lib/action-result";

export function SermonForm({
  sermon,
  action,
}: {
  sermon?: Sermon;
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
          <Input id="title" name="title" defaultValue={sermon?.title} required />
        </Field>
        <Field label="Slug" htmlFor="slug" error={err("slug")}>
          <Input id="slug" name="slug" defaultValue={sermon?.slug} required />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Speaker" htmlFor="speaker" error={err("speaker")}>
          <Input id="speaker" name="speaker" defaultValue={sermon?.speaker} required />
        </Field>
        <Field label="Series (optional)" htmlFor="series" error={err("series")}>
          <Input id="series" name="series" defaultValue={sermon?.series ?? ""} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Scripture (optional)" htmlFor="scripture" error={err("scripture")}>
          <Input id="scripture" name="scripture" defaultValue={sermon?.scripture ?? ""} />
        </Field>
        <Field label="Published date" htmlFor="publishedAt" error={err("publishedAt")}>
          <Input
            id="publishedAt"
            name="publishedAt"
            type="date"
            defaultValue={sermon?.publishedAt ? sermon.publishedAt.toISOString().slice(0, 10) : ""}
            required
          />
        </Field>
      </div>

      <Field label="Description (optional)" htmlFor="description" error={err("description")}>
        <Textarea id="description" name="description" defaultValue={sermon?.description ?? ""} />
      </Field>

      <Field label="Video URL" htmlFor="videoUrl" error={err("videoUrl")} hint="YouTube link">
        <Input id="videoUrl" name="videoUrl" defaultValue={sermon?.videoUrl} required />
      </Field>

      <Field label="Thumbnail path (optional)" htmlFor="thumbnailUrl" error={err("thumbnailUrl")} hint="Leave blank to auto-derive from the YouTube link">
        <Input id="thumbnailUrl" name="thumbnailUrl" defaultValue={sermon?.thumbnailUrl ?? ""} />
      </Field>

      <Field label="Tags (comma-separated, optional)" htmlFor="tags" error={err("tags")}>
        <Input id="tags" name="tags" defaultValue={sermon?.tags?.join(", ") ?? ""} />
      </Field>

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
