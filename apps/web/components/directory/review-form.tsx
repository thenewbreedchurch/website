"use client";

import { useState } from "react";
import { useKeepForm } from "@/lib/use-keep-form";
import { Star } from "lucide-react";
import { submitReviewAction } from "@/actions/directory-review";
import { cn } from "@/lib/utils";

export function ReviewForm({ vendorId, existing }: { vendorId: string; existing?: { rating: number; body: string } | null }) {
  const { state, onSubmit, isPending: pending } = useKeepForm(submitReviewAction);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input type="hidden" name="vendorId" value={vendorId} />
      <fieldset>
        <legend className="text-sm font-medium">Your rating</legend>
        <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer p-1">
              <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} className="sr-only" />
              <Star size={28} aria-label={`${n} star${n > 1 ? "s" : ""}`} className={cn(n <= rating ? "fill-brand-600 text-brand-600" : "text-current/30")} />
            </label>
          ))}
        </div>
        {errors.rating?.[0] && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {errors.rating[0]}
          </p>
        )}
      </fieldset>
      <div>
        <label htmlFor="review-body" className="text-sm font-medium">
          Your review
        </label>
        <textarea
          id="review-body"
          name="body"
          rows={4}
          required
          maxLength={800}
          defaultValue={existing?.body}
          aria-invalid={Boolean(errors.body?.[0])}
          className="mt-2 w-full rounded-none border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/25"
        />
        {errors.body?.[0] && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {errors.body[0]}
          </p>
        )}
      </div>
      {state && !state.ok && !state.fieldErrors && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state?.ok && <p role="status" className="text-sm font-medium">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-none bg-brand-700 px-8 text-sm font-bold uppercase tracking-tight text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
      >
        {pending ? "Posting…" : existing ? "Update review" : "Post review"}
      </button>
    </form>
  );
}
