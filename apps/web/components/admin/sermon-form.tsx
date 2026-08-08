"use client";

import { useActionState, useState } from "react";
import type { Sermon } from "@nb-church/db";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormStatus } from "@/components/admin/form-status";
import type { ActionResult } from "@/lib/action-result";
import { youtubeThumbnailUrl } from "@/lib/youtube";

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

  // Controlled (not defaultValue) so the preview below can react as the
  // admin types/pastes — the fields still submit via their name attributes
  // exactly as before, this doesn't change what the Server Action receives.
  const [videoUrl, setVideoUrl] = useState(sermon?.videoUrl ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(sermon?.thumbnailUrl ?? "");
  // Tracks which src actually 404'd/errored, so the preview only hides for
  // that specific bad value — typing further (a new src) gets a fresh
  // attempt rather than staying hidden forever from one earlier failure.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const previewSrc = thumbnailUrl.trim() || youtubeThumbnailUrl(videoUrl);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" htmlFor="title" error={err("title")}>
          <Input id="title" name="title" defaultValue={sermon?.title} required placeholder="Walking in Faith" />
        </Field>
        <Field label="Slug" htmlFor="slug" error={err("slug")} hint="lowercase-with-hyphens, used in the URL">
          <Input id="slug" name="slug" defaultValue={sermon?.slug} required placeholder="sunday-service-june-2026" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Speaker" htmlFor="speaker" error={err("speaker")}>
          <Input id="speaker" name="speaker" defaultValue={sermon?.speaker} required placeholder="Pastor Gbenga Olaniyan" />
        </Field>
        <Field label="Series (optional)" htmlFor="series" error={err("series")}>
          <Input id="series" name="series" defaultValue={sermon?.series ?? ""} placeholder="Faith Foundations" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Scripture (optional)" htmlFor="scripture" error={err("scripture")}>
          <Input id="scripture" name="scripture" defaultValue={sermon?.scripture ?? ""} placeholder="John 3:16" />
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
        <Textarea id="description" name="description" defaultValue={sermon?.description ?? ""} placeholder="A brief summary of this sermon's message..." />
      </Field>

      <Field label="Video URL" htmlFor="videoUrl" error={err("videoUrl")} hint="YouTube link">
        <Input
          id="videoUrl"
          name="videoUrl"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          required
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </Field>

      <Field
        label="Thumbnail path (optional)"
        htmlFor="thumbnailUrl"
        error={err("thumbnailUrl")}
        hint="Leave blank to use the preview below (auto-derived from the YouTube link) — only fill this in to override it with your own image."
      >
        <Input
          id="thumbnailUrl"
          name="thumbnailUrl"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          placeholder="/images/sermons/sermon-2026-06.jpg"
        />
      </Field>

      {previewSrc && previewSrc !== failedSrc && (
        <div className="flex items-center gap-3">
          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 admin-dark:border-neutral-800 admin-dark:bg-neutral-800">
            {/* eslint-disable-next-line @next/next/no-img-element -- transient
                preview of an external, not-yet-saved URL as the admin types;
                routing this through next/image's optimizer adds no value here */}
            <img
              src={previewSrc}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
              onError={() => setFailedSrc(previewSrc)}
            />
          </div>
          <p className="text-xs text-neutral-500 admin-dark:text-neutral-400">
            {thumbnailUrl.trim() ? "Preview of the thumbnail path above." : "Preview of the thumbnail that will be used (derived from the YouTube link)."}
          </p>
        </div>
      )}

      <Field label="Tags (comma-separated, optional)" htmlFor="tags" error={err("tags")}>
        <Input id="tags" name="tags" defaultValue={sermon?.tags?.join(", ") ?? ""} placeholder="faith, prayer, healing" />
      </Field>

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
