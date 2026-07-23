import { cn } from "@/lib/utils";

const TONES = {
  neutral: "bg-neutral-100 text-neutral-700 dark:bg-white/10 dark:text-neutral-200",
  brand: "bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200",
  green: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  red: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
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
