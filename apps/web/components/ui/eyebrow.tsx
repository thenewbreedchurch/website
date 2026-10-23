import { cn } from "@/lib/utils";

export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("t-eyebrow text-brand-300", className)} {...props} />;
}
