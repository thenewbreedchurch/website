import * as React from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string[];
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

// Label + control + error/hint wrapper used by every admin form field, so
// zod fieldErrors render consistently everywhere.
export function Field({ label, htmlFor, error, hint, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
        {label}
      </label>
      {children}
      {hint && !error?.length && <p className="text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>}
      {error?.length ? <p className="text-xs text-red-600 dark:text-red-400">{error.join(" ")}</p> : null}
    </div>
  );
}
