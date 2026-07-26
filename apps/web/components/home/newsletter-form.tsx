"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { subscribeAction } from "@/actions/subscribe";
import type { ActionResult } from "@/lib/action-result";

async function submitNewsletter(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return subscribeAction({
    email: formData.get("email"),
    name: formData.get("name") || undefined,
  });
}

export function NewsletterForm() {
  const [result, formAction, isPending] = useActionState(submitNewsletter, null);
  const emailErrors = result?.ok === false ? result.fieldErrors?.email : undefined;

  return (
    <div className="mx-auto max-w-md">
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:gap-2" noValidate>
        <div className="flex-1">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            placeholder="Your email address"
            autoComplete="email"
            required
            aria-invalid={emailErrors ? true : undefined}
            aria-describedby={emailErrors ? "newsletter-email-error" : undefined}
            className="h-12 w-full rounded-full border border-white/40 bg-white/25 px-5 text-sm text-white placeholder:text-white/70 shadow-sm backdrop-blur-sm outline-none focus-visible:ring-2 focus-visible:ring-white"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-brand-800 transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending && <Loader2 size={16} className="animate-spin" />}
          {isPending ? "Subscribing…" : "Subscribe"}
        </button>
      </form>

      {emailErrors && (
        <p id="newsletter-email-error" className="mt-2 text-sm text-red-200">
          {emailErrors[0]}
        </p>
      )}

      {result?.ok === false && !emailErrors && (
        <p role="alert" className="mt-2 text-sm text-red-200">
          {result.error}
        </p>
      )}

      {result?.ok === true && (
        <p role="status" className="mt-2 text-sm text-white/90">
          {result.message}
        </p>
      )}
    </div>
  );
}
