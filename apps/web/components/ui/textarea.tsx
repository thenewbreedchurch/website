import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/30 disabled:cursor-not-allowed disabled:opacity-50 admin-dark:border-neutral-700 admin-dark:bg-neutral-900 admin-dark:text-neutral-100 admin-dark:placeholder:text-neutral-500",
      className
    )}
    rows={4}
    {...props}
  />
));
Textarea.displayName = "Textarea";
