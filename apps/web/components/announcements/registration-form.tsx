"use client";

import { useActionState } from "react";
import { registerForEventAction } from "@/actions/register";
import type { ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/utils";

const inputClasses =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-current transition-colors focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/25";

export function RegistrationForm({ announcementId }: { announcementId: string }) {
  const action = async (
    _prevState: ActionResult | null,
    formData: FormData
  ): Promise<ActionResult> => {
    return registerForEventAction(announcementId, {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      guestsCount: formData.get("guestsCount"),
      notes: formData.get("notes"),
    });
  };

  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    action,
    null
  );

  const fieldError = (field: string): string | undefined =>
    state && !state.ok ? state.fieldErrors?.[field]?.[0] : undefined;

  if (state?.ok) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-brand-200 bg-brand-50 p-6 text-brand-900 dark:border-brand-800/60 dark:bg-brand-900/20 dark:text-brand-100"
      >
        <p className="font-display text-lg font-semibold">You&apos;re registered!</p>
        <p className="mt-1 text-sm text-current/80">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="reg-name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="reg-name"
            name="name"
            required
            autoComplete="name"
            className={cn(inputClasses, "mt-1.5")}
          />
          {fieldError("name") && (
            <p className="mt-1 text-xs text-red-600">{fieldError("name")}</p>
          )}
        </div>
        <div>
          <label htmlFor="reg-email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="reg-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={cn(inputClasses, "mt-1.5")}
          />
          {fieldError("email") && (
            <p className="mt-1 text-xs text-red-600">{fieldError("email")}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="reg-phone" className="block text-sm font-medium">
            Phone <span className="font-normal text-current/50">(optional)</span>
          </label>
          <input
            id="reg-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={cn(inputClasses, "mt-1.5")}
          />
        </div>
        <div>
          <label htmlFor="reg-guests" className="block text-sm font-medium">
            Guests
          </label>
          <input
            id="reg-guests"
            name="guestsCount"
            type="number"
            min={1}
            max={50}
            defaultValue={1}
            className={cn(inputClasses, "mt-1.5")}
          />
        </div>
      </div>

      <div>
        <label htmlFor="reg-notes" className="block text-sm font-medium">
          Anything we should know? <span className="font-normal text-current/50">(optional)</span>
        </label>
        <textarea
          id="reg-notes"
          name="notes"
          maxLength={1000}
          rows={3}
          className={cn(inputClasses, "mt-1.5")}
        />
        {fieldError("notes") && (
          <p className="mt-1 text-xs text-red-600">{fieldError("notes")}</p>
        )}
      </div>

      {state && !state.ok && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-brand-700 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-800 disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
      >
        {isPending ? "Registering…" : "Register"}
      </button>
    </form>
  );
}
