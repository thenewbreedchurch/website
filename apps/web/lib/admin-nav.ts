import {
  Settings,
  Clock,
  Megaphone,
  PlayCircle,
  Quote,
  Landmark,
  ListChecks,
  Users,
  Mail,
  Inbox,
  HeartHandshake,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

// Single source of truth for the admin sidebar AND the dashboard's section
// cards — grouped the same way in both places so the mental model matches.
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Content",
    items: [
      {
        href: "/admin/announcements",
        label: "Announcements",
        description: "Powers the Weekly Announcements page.",
        icon: Megaphone,
      },
      {
        href: "/admin/sermons",
        label: "Sermons",
        description: "The sermon archive and homepage teaser.",
        icon: PlayCircle,
      },
      {
        href: "/admin/testimonies",
        label: "Testimonies",
        description: "Approve and feature congregant testimonies.",
        icon: Quote,
      },
      {
        href: "/admin/next-steps",
        label: "Next Steps",
        description: "Cards on First Timers and New Converts.",
        icon: ListChecks,
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        href: "/admin/contact-messages",
        label: "Contact Messages",
        description: "Messages submitted via the Contact page.",
        icon: Inbox,
      },
      {
        href: "/admin/new-convert-inquiries",
        label: "New Convert Inquiries",
        description: "Submissions from the New Converts intake form.",
        icon: HeartHandshake,
      },
      {
        href: "/admin/staff",
        label: "Staff / Leadership",
        description: "Powers About and the public Leadership directory.",
        icon: Users,
      },
      {
        href: "/admin/subscribers",
        label: "Newsletter Subscribers",
        description: "View and export the mailing list.",
        icon: Mail,
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        href: "/admin/settings",
        label: "Church Settings",
        description: "Contact info, socials, links — shown site-wide.",
        icon: Settings,
      },
      {
        href: "/admin/service-times",
        label: "Service Times",
        description: "The weekly rhythm on the footer and Announcements.",
        icon: Clock,
      },
      {
        href: "/admin/giving-accounts",
        label: "Giving Accounts",
        description: "Bank details shown on the Give page.",
        icon: Landmark,
      },
    ],
  },
];

// Flat lookup used by Breadcrumbs to resolve a route's human label.
export const ADMIN_NAV_LABELS: Record<string, string> = Object.fromEntries(
  ADMIN_NAV_GROUPS.flatMap((g) => g.items).map((item) => [item.href, item.label])
);
