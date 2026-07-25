import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

// Renamed from a full breadcrumb trail to a single "< Back" link per
// request — shorter, and doesn't need the hamburger/sidebar to navigate one
// level up. The back target is the second-to-last item in the caller's own
// `items` array (the immediate parent section — e.g. "Announcements" for an
// edit page, or the announcement's own title for its nested registrations
// page), not the first ("Admin") — going all the way back to the dashboard
// isn't usually what "back" means from a nested page. Every existing
// `breadcrumbs` call site across the app already passes this shape
// unchanged, so no call sites needed updating for this change.
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const back: Crumb = items.length >= 2 ? items[items.length - 2]! : { label: "Admin", href: "/admin" };

  if (!back.href) return null;

  return (
    <Link
      href={back.href}
      className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline admin-dark:text-brand-300"
    >
      <ChevronLeft size={16} className="shrink-0" />
      {back.label}
    </Link>
  );
}
