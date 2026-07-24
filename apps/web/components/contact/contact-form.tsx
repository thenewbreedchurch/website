"use client";

import { useActionState, useState } from "react";
import { contactAction } from "@/actions/contact";
import type { ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/utils";

async function submitContact(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return contactAction({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    category: formData.get("category"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
}

const inputClasses =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-current transition-colors focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/25";

const CATEGORY_OPTIONS = [
  { value: "GENERAL", label: "General" },
  { value: "PRAYER", label: "Prayer Request" },
  { value: "MEMBERSHIP", label: "Membership & Follow-up" },
  { value: "WELFARE", label: "Welfare / Member Care" },
] as const;

const MESSAGE_MAX_LENGTH = 500;

export function ContactForm() {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    submitContact,
    null
  );
  const [message, setMessage] = useState("");

  const fieldError = (field: string): string | undefined =>
    state && !state.ok ? state.fieldErrors?.[field]?.[0] : undefined;

  if (state?.ok) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-brand-200 bg-brand-50 p-6 text-brand-900 dark:border-brand-800/60 dark:bg-brand-900/20 dark:text-brand-100"
      >
        <p className="font-display text-lg font-semibold">Message sent</p>
        <p className="mt-1 text-sm text-current/80">{state.message}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            aria-invalid={Boolean(fieldError("name"))}
            className={cn(inputClasses, "mt-2.5")}
          />
          {fieldError("name") && (
            <p className="mt-1 text-xs text-red-600">{fieldError("name")}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={Boolean(fieldError("email"))}
            className={cn(inputClasses, "mt-2.5")}
          />
          {fieldError("email") && (
            <p className="mt-1 text-xs text-red-600">{fieldError("email")}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium">
          Phone <span className="font-normal text-current/50">(optional)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          aria-invalid={Boolean(fieldError("phone"))}
          className={cn(inputClasses, "mt-2.5")}
        />
        {fieldError("phone") && (
          <p className="mt-1 text-xs text-red-600">{fieldError("phone")}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium">
          What&apos;s this about?
        </label>
        <select
          id="category"
          name="category"
          defaultValue="GENERAL"
          className={cn(inputClasses, "mt-2.5")}
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          aria-invalid={Boolean(fieldError("subject"))}
          className={cn(inputClasses, "mt-2.5")}
        />
        {fieldError("subject") && (
          <p className="mt-1 text-xs text-red-600">{fieldError("subject")}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          maxLength={MESSAGE_MAX_LENGTH}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={Boolean(fieldError("message"))}
          className={cn(inputClasses, "mt-2.5 resize-y")}
        />
        <p className="mt-1 text-right text-xs text-current/60">
          {message.length}/{MESSAGE_MAX_LENGTH}
        </p>
        {fieldError("message") && (
          <p className="mt-1 text-xs text-red-600">{fieldError("message")}</p>
        )}
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
        {isPending ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
