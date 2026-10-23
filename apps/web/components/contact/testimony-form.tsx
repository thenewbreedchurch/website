"use client";

import { useActionState, useState } from "react";
import { testimonySubmissionAction } from "@/actions/testimony-submission";
import type { ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/utils";

const inputClasses =
  "w-full rounded-none border border-border bg-surface px-4 py-2.5 text-sm text-current transition-colors focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/25 aria-[invalid=true]:border-red-500";

const BODY_MAX = 2000;

async function submit(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return testimonySubmissionAction({
    name: formData.get("name"),
    email: formData.get("email"),
    body: formData.get("body"),
    consent: formData.get("consent") ?? undefined,
  });
}

export function TestimonyForm() {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(submit, null);
  const [body, setBody] = useState("");
  const fieldError = (f: string) => (state && !state.ok ? state.fieldErrors?.[f]?.[0] : undefined);

  if (state?.ok) {
    return (
      <div
        role="status"
        className="rounded-none border border-brand-200 bg-brand-50 p-6 text-brand-900 dark:border-brand-800/60 dark:bg-brand-900/20 dark:text-brand-100"
      >
        <p className="font-display text-lg font-semibold">Thank you for sharing</p>
        <p className="mt-1 text-sm text-current/80">{state.message}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
        >
          Share another testimony
        </button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      className="space-y-6 rounded-none border border-border bg-surface p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="t-name" className="block text-sm font-medium">
            Your name
          </label>
          <p className="mt-1 text-xs text-current/60">As you&apos;d like it to appear if we share it.</p>
          <input
            id="t-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            aria-invalid={Boolean(fieldError("name"))}
            className={cn(inputClasses, "mt-2.5")}
          />
          {fieldError("name") && <p className="mt-1 text-xs text-red-600">{fieldError("name")}</p>}
        </div>
        <div>
          <label htmlFor="t-email" className="block text-sm font-medium">
            Email
          </label>
          <p className="mt-1 text-xs text-current/60">Only our team sees this. It is never published.</p>
          <input
            id="t-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={Boolean(fieldError("email"))}
            className={cn(inputClasses, "mt-2.5")}
          />
          {fieldError("email") && <p className="mt-1 text-xs text-red-600">{fieldError("email")}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="t-body" className="block text-sm font-medium">
          Your testimony
        </label>
        <textarea
          id="t-body"
          name="body"
          rows={8}
          required
          maxLength={BODY_MAX}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          aria-invalid={Boolean(fieldError("body"))}
          className={cn(inputClasses, "mt-2.5 resize-y")}
        />
        <p className="mt-1 text-right text-xs text-current/60">
          {body.length}/{BODY_MAX}
        </p>
        {fieldError("body") && <p className="mt-1 text-xs text-red-600">{fieldError("body")}</p>}
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="consent" className="mt-1 h-4 w-4 shrink-0 accent-brand-700" />
          <span>I&apos;m happy for The New Breed Church to share this testimony on its website.</span>
        </label>
        {fieldError("consent") && <p className="mt-1 text-xs text-red-600">{fieldError("consent")}</p>}
      </div>

      {state && !state.ok && !state.fieldErrors && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state && !state.ok && state.fieldErrors && (
        <p role="alert" className="text-sm text-red-600">
          Please check the form for errors.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 w-full items-center justify-center rounded-none bg-brand-700 px-6 text-sm font-bold uppercase tracking-tight text-white transition-colors hover:bg-brand-800 disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
      >
        {isPending ? "Sending…" : "Share Testimony"}
      </button>
    </form>
  );
}
