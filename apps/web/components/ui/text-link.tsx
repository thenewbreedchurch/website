import Link, { type LinkProps } from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type TextLinkProps = LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps | "href"> & {
    external?: boolean;
  };

/** Uppercase link with ↗ arrow and accent underline (wearethenew.org style). */
export function TextLink({ className, children, external, ...props }: TextLinkProps) {
  return (
    <Link
      className={cn("t-link", className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    >
      {children}
      <ArrowUpRight size={16} aria-hidden="true" />
    </Link>
  );
}
