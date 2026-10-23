import Link, { type LinkProps } from "next/link";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button-variants";

type LinkButtonProps = LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps | "href"> &
  VariantProps<typeof buttonVariants> & {
    className?: string;
    children: React.ReactNode;
  };

export function LinkButton({
  className,
  variant,
  size,
  shape,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={cn(buttonVariants({ variant, size, shape }), className)} {...props}>
      {children}
    </Link>
  );
}
