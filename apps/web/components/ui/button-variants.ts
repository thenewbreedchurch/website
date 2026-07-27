import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[color,background-color,border-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-brand-700 text-white hover:bg-brand-800 active:scale-[0.98]",
        secondary:
          "bg-brand-50 text-brand-800 hover:bg-brand-100 active:scale-[0.98] dark:bg-white/10 dark:text-white dark:hover:bg-white/20",
        outline:
          "border border-current/20 bg-transparent hover:bg-black/[.03] active:scale-[0.98] dark:hover:bg-white/[.06]",
        ghost: "bg-transparent hover:bg-black/[.04] active:scale-[0.98] dark:hover:bg-white/[.08]",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-13 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);
