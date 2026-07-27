"use client";

import Link, { useLinkStatus } from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";

// useLinkStatus only reports pending state for the <Link> it's rendered
// inside of, so this has to be a separate child component. Doubles as the
// pending indicator for "New" links and, since a few pages reuse this same
// prop to render a relabeled "Export CSV" link, for CSV exports too.
function NewLinkLabel({ label }: { label: string }) {
  const { pending } = useLinkStatus();
  return (
    <span className="inline-flex items-center gap-1.5">
      <Plus size={15} className={pending ? "animate-spin" : undefined} /> {pending ? "Please wait…" : label}
    </span>
  );
}

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
          <h1 className="text-2xl font-bold text-neutral-900 admin-dark:text-neutral-100">{title}</h1>
          {description && <p className="mt-1 text-sm text-neutral-500 admin-dark:text-neutral-400">{description}</p>}
        </div>
        {newHref && (
          <Link
            href={newHref}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-700 px-4 text-sm font-medium text-white transition-colors active:scale-[0.98] hover:bg-brand-800 admin-dark:bg-brand-600 admin-dark:hover:bg-brand-500"
          >
            <NewLinkLabel label={newLabel} />
          </Link>
        )}
      </div>
    </div>
  );
}
