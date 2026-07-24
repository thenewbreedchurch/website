"use client";

import { useActionState } from "react";
import { newConvertInquiryAction } from "@/actions/new-convert-inquiry";
import type { ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/utils";

const inputClasses =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-current transition-colors focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/25";

const INTEREST_OPTIONS = [
  { value: "BAPTISM", label: "Getting baptized" },
  { value: "BIBLE_STUDY", label: "Joining Bible Study" },
  { value: "MEET_LEADER", label: "Meeting a leader" },
  { value: "SERVING", label: "Serving on a team" },
  { value: "OTHER", label: "Something else" },
] as const;

async function submitInquiry(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return newConvertInquiryAction({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    interests: formData.getAll("interests"),
    message: formData.get("message"),
  });
}

export function NewConvertInquiryForm() {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    submitInquiry,
    null
  );

  const fieldError = (field: string): string | undefined =>
    state && !state.ok ? state.fieldErrors?.[field]?.[0] : undefined;

  if (state?.ok) {
    return (
      <div
        role="status"
        className="rounded-3xl border border-brand-200 bg-brand-50 p-8 text-center text-brand-900 dark:border-brand-800/60 dark:bg-brand-900/20 dark:text-brand-100"
      >
        <p className="font-display text-xl font-semibold">You&apos;re on our radar! 💜</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-current/80">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6 rounded-3xl border border-border bg-surface p-6 sm:p-8" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="nc-name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="nc-name"
            name="name"
            required
            autoComplete="name"
            aria-invalid={Boolean(fieldError("name"))}
            className={cn(inputClasses, "mt-1.5")}
          />
          {fieldError("name") && <p className="mt-1 text-xs text-red-600">{fieldError("name")}</p>}
        </div>
        <div>
          <label htmlFor="nc-email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="nc-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={Boolean(fieldError("email"))}
            className={cn(inputClasses, "mt-1.5")}
          />
          {fieldError("email") && <p className="mt-1 text-xs text-red-600">{fieldError("email")}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="nc-phone" className="block text-sm font-medium">
          Phone <span className="font-normal text-current/50">(optional)</span>
        </label>
        <input
          id="nc-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className={cn(inputClasses, "mt-1.5 sm:max-w-xs")}
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium">What would you like help with?</legend>
        <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
          {INTEREST_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-sm has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50 dark:has-[:checked]:bg-white/5"
            >
              <input
                type="checkbox"
                name="interests"
                value={opt.value}
                className="h-4 w-4 rounded border-border text-brand-700 focus:ring-2 focus:ring-brand-600/30"
              />
              {opt.label}
            </label>
          ))}
        </div>
        {fieldError("interests") && (
          <p className="mt-1.5 text-xs text-red-600">{fieldError("interests")}</p>
        )}
      </fieldset>

      <div>
        <label htmlFor="nc-message" className="block text-sm font-medium">
          Anything you&apos;d like us to know? <span className="font-normal text-current/50">(optional)</span>
        </label>
        <textarea
          id="nc-message"
          name="message"
          rows={4}
          className={cn(inputClasses, "mt-1.5 resize-y")}
        />
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
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-brand-700 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-800 disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
      >
        {isPending ? "Sending…" : "Let Us Know You're Here"}
      </button>
    </form>
  );
}
