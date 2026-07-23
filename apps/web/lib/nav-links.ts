export interface NavLink {
  label: string;
  href: string;
}

// Single source of truth for primary navigation — the legacy site duplicated
// (and drifted between) a different nav per page. "I'm New" and "New
// Converts" are new per the rebuild plan; ~75% of church sites use "I'm New"
// over "About"-style labels for first-time-visitor wayfinding.
export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "I'm New", href: "/first-timers" },
  { label: "New Converts", href: "/new-converts" },
  { label: "Announcements", href: "/announcements" },
  { label: "Sermons", href: "/sermons" },
  { label: "Contact", href: "/contact" },
];

export const GIVE_LINK: NavLink = { label: "Give", href: "/give" };
