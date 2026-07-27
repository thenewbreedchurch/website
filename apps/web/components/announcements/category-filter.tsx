"use client";

import Link, { useLinkStatus } from "next/link";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: undefined, label: "All" },
  { value: "SERVICE", label: "Service" },
  { value: "OUTREACH", label: "Outreach" },
  { value: "YOUTH", label: "Youth" },
  { value: "SPECIAL", label: "Special" },
  { value: "FUNDRAISER", label: "Fundraiser" },
  { value: "OTHER", label: "Other" },
] as const;

// useLinkStatus only reports pending state for the specific <Link> it's
// rendered inside of, so this has to be a separate child component rather
// than read inline in CategoryFilter itself.
function ChipLabel({ label }: { label: string }) {
  const { pending } = useLinkStatus();
  return (
    <span className={cn("inline-flex items-center gap-1.5", pending && "opacity-60")}>
      {label}
      {pending && (
        <span
          aria-hidden="true"
          className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
    </span>
  );
}

// searchParams-driven filtering per the plan: a server re-render, no client
// state for the filtering itself — each chip is a plain link. ChipLabel adds
// a per-chip pending indicator so a click gives immediate feedback instead
// of looking inert until the new page finishes rendering.
export function CategoryFilter({ active }: { active?: string }) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Filter announcements by category">
      {CATEGORIES.map((c) => {
        const isActive = active === c.value || (!active && !c.value);
        return (
          <Link
            key={c.label}
            href={c.value ? `/announcements?category=${c.value}` : "/announcements"}
            scroll={false}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors active:scale-[0.98]",
              isActive
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-border bg-surface text-current/70 hover:border-brand-300 hover:text-brand-700 dark:hover:text-brand-300"
            )}
          >
            <ChipLabel label={c.label} />
          </Link>
        );
      })}
    </nav>
  );
}
