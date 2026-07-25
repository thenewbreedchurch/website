import { cn } from "@/lib/utils";

const TONES = {
  neutral: "bg-neutral-100 text-neutral-700 admin-dark:bg-neutral-800 admin-dark:text-neutral-300",
  brand: "bg-brand-50 text-brand-800 admin-dark:bg-brand-500/15 admin-dark:text-brand-300",
  green: "bg-green-50 text-green-700 admin-dark:bg-green-500/15 admin-dark:text-green-400",
  amber: "bg-amber-50 text-amber-700 admin-dark:bg-amber-500/15 admin-dark:text-amber-400",
  red: "bg-red-50 text-red-700 admin-dark:bg-red-500/15 admin-dark:text-red-400",
} as const;

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: keyof typeof TONES;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONES[tone]
      )}
    >
      {children}
    </span>
  );
}
