import { cn } from "@/lib/utils";

/** List row separated by a hairline — events/sermons list pattern. */
export function RuledRow({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-current/20 py-6 last:border-b",
        className
      )}
      {...props}
    />
  );
}
