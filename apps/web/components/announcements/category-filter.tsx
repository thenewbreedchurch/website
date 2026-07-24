import Link from "next/link";
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

// searchParams-driven filtering per the plan: a server re-render, no client
// state — each chip is a plain link.
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
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-border bg-surface text-current/70 hover:border-brand-300 hover:text-brand-700 dark:hover:text-brand-300"
            )}
          >
            {c.label}
          </Link>
        );
      })}
    </nav>
  );
}
