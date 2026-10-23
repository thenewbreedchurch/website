"use client";

import { useActionState } from "react";
import { reportVendorAction } from "@/actions/directory-review";
import { REPORT_REASON_LABELS } from "@/lib/directory";

const field =
  "mt-2 w-full rounded-none border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/25";

/** "Report this business" disclosure with a small anonymous form. */
export function ReportForm({ vendorId }: { vendorId: string }) {
  const [state, action, pending] = useActionState(reportVendorAction, null);
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  return (
    <details className="group border-t border-current/15 pt-4">
      <summary className="t-eyebrow cursor-pointer list-none text-[11px] text-current/60 hover:text-current">Report this business</summary>
      {state?.ok ? (
        <p role="status" className="mt-4 text-sm">
          {state.message}
        </p>
      ) : (
        <form action={action} className="mt-4 space-y-4">
          <input type="hidden" name="vendorId" value={vendorId} />
          <div>
            <label htmlFor="report-reason" className="text-sm font-medium">
              What&apos;s the problem?
            </label>
            <select id="report-reason" name="reason" required defaultValue="" className={field}>
              <option value="" disabled>
                Choose a reason…
              </option>
              {Object.entries(REPORT_REASON_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errors.reason?.[0] && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.reason[0]}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="report-details" className="text-sm font-medium">
              Details <span className="font-normal text-current/50">(optional)</span>
            </label>
            <textarea id="report-details" name="details" rows={3} maxLength={600} className={field} />
          </div>
          <div>
            <label htmlFor="report-email" className="text-sm font-medium">
              Your email <span className="font-normal text-current/50">(optional, if you&apos;d like a reply)</span>
            </label>
            <input id="report-email" name="reporterEmail" type="email" className={field} />
            {errors.reporterEmail?.[0] && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.reporterEmail[0]}
              </p>
            )}
          </div>
          {state && !state.ok && !state.fieldErrors && (
            <p role="alert" className="text-sm text-red-600">
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="h-10 rounded-none border border-current/40 px-5 text-xs font-bold uppercase tracking-tight hover:bg-current/5 disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send report"}
          </button>
        </form>
      )}
    </details>
  );
}
