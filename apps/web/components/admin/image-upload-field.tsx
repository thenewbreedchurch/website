"use client";

import { useRef, useState, useTransition } from "react";
import { Upload } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { uploadImageAction } from "@/actions/admin/upload";

// Every category here must have a matching entry in the server-side
// CATEGORY_MAX_WIDTH map in actions/admin/upload.ts — kept as a plain union
// (not imported from the server action file, which is "use server" and
// can't be imported for its types into a client bundle) so a typo here is
// still caught by the "Unknown upload category" error path server-side.
type UploadCategory = "announcements" | "sermons" | "staff" | "testimonies" | "next-steps";

interface ImageUploadFieldProps {
  name: string;
  label: string;
  category: UploadCategory;
  defaultValue?: string;
  error?: string[];
  hint?: string;
  placeholder?: string;
  // Shown as the preview when no value is set yet — e.g. sermon-form.tsx's
  // YouTube-derived thumbnail fallback. Purely additive; every other form
  // just omits this and gets no preview until something is uploaded/typed.
  fallbackPreviewSrc?: string | null;
}

// Reusable image field for every admin form that stores an image path/URL
// (announcement hero images, sermon thumbnails, staff photos, testimony
// photos, next-step images). Combines a real file-upload button (goes
// through uploadImageAction -> R2, see actions/admin/upload.ts) with a
// plain, always-editable text input for pasting a path/URL directly —
// both write to the same underlying value, which submits via `name` exactly
// like the plain <Input> this replaces, so no Server Action or Zod schema
// needed to change to support uploads.
export function ImageUploadField({
  name,
  label,
  category,
  defaultValue,
  error,
  hint,
  placeholder,
  fallbackPreviewSrc,
}: ImageUploadFieldProps) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Tracks which src actually 404'd/errored, so the preview only hides for
  // that specific bad value — a later change to a different src gets a
  // fresh attempt rather than staying hidden forever from one earlier
  // failure.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const previewSrc = value.trim() || fallbackPreviewSrc || null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Always clear the native file input's own value, even on success —
    // otherwise selecting the exact same filename a second time (e.g. after
    // fixing and re-exporting a photo under the same name) wouldn't fire
    // this handler again, since the browser only fires `change` on an
    // actual value change.
    e.target.value = "";
    if (!file) return;

    setUploadError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImageAction(category, formData);
      if (result.ok) {
        setValue(result.url);
        setFailedSrc(null);
      } else {
        setUploadError(result.error);
      }
    });
  }

  return (
    <Field label={label} htmlFor={name} error={error} hint={hint}>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60 admin-dark:border-neutral-700 admin-dark:bg-neutral-900 admin-dark:text-neutral-300 admin-dark:hover:bg-neutral-800"
          >
            <Upload size={13} />
            {isPending ? "Uploading…" : "Upload image"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <Input
            id={name}
            name={name}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setUploadError(null);
            }}
            placeholder={placeholder}
          />
        </div>

        {uploadError && <p className="text-xs text-red-600 admin-dark:text-red-400">{uploadError}</p>}

        {previewSrc && previewSrc !== failedSrc && (
          <div className="relative h-20 w-32 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 admin-dark:border-neutral-800 admin-dark:bg-neutral-800">
            {/* eslint-disable-next-line @next/next/no-img-element -- transient
                preview of an external, not-yet-saved URL as the admin
                uploads/types; routing this through next/image's optimizer
                adds no value for a small admin-only preview */}
            <img
              src={previewSrc}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
              onError={() => setFailedSrc(previewSrc)}
            />
          </div>
        )}
      </div>
    </Field>
  );
}
