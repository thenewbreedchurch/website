import { cn } from "@/lib/utils";

// Admin panel is a fixed light-mode surface (see app/admin/layout.tsx) —
// no dark: variants, so tones stay readable regardless of the visitor's OS
// color-scheme preference.
const TONES = {
  neutral: "bg-neutral-100 text-neutral-700",
  brand: "bg-brand-50 text-brand-800",
  green: "bg-green-50 text-green-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
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
