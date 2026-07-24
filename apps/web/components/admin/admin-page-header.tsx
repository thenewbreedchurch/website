import Link from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";

export function AdminPageHeader({
  title,
  description,
  newHref,
  newLabel = "New",
  breadcrumbs,
}: {
  title: string;
  description?: string;
  newHref?: string;
  newLabel?: string;
  breadcrumbs?: Crumb[];
}) {
  return (
    <div className="space-y-3">
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{title}</h1>
          {description && <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>}
        </div>
        {newHref && (
          <Link
            href={newHref}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-700 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500"
          >
            <Plus size={15} /> {newLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
