import Link from "next/link";

export function AdminPageHeader({
  title,
  description,
  newHref,
  newLabel = "New",
}: {
  title: string;
  description?: string;
  newHref?: string;
  newLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
      </div>
      {newHref && (
        <Link
          href={newHref}
          className="inline-flex h-9 items-center rounded-full bg-brand-700 px-4 text-sm font-medium text-white hover:bg-brand-800"
        >
          {newLabel}
        </Link>
      )}
    </div>
  );
}
