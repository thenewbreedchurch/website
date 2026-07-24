import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail: Crumb[] = [{ label: "Admin", href: "/admin" }, ...items];

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
      {trail.map((crumb, i) => {
        const isLast = i === trail.length - 1;
        return (
          <span key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={14} className="shrink-0 text-neutral-300 dark:text-neutral-600" />}
            {crumb.href && !isLast ? (
              <Link href={crumb.href} className="hover:text-neutral-900 hover:underline dark:hover:text-neutral-100">
                {crumb.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-neutral-900 dark:text-neutral-100" : undefined}>
                {crumb.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
