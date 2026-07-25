import * as React from "react";
import { cn } from "@/lib/utils";

export const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border-neutral-300 text-brand-700 focus:ring-2 focus:ring-brand-600/30 admin-dark:border-neutral-600 admin-dark:bg-neutral-900",
        className
      )}
      {...props}
    />
  )
);
Checkbox.displayName = "Checkbox";
