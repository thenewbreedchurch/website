export interface NavLink {
  label: string;
  href: string;
  /** Photo shown in the full-screen menu while this link is hovered/focused. */
  image?: string;
}

// Single source of truth for primary navigation — the legacy site duplicated
// (and drifted between) a different nav per page. "I'm New" and "New
// Converts" are new per the rebuild plan; ~75% of church sites use "I'm New"
// over "About"-style labels for first-time-visitor wayfinding.
export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/", image: "/images/hero/hero-congregation-worship.jpg" },
  { label: "About", href: "/about", image: "/images/about/about-mission-worship.jpg" },
  { label: "Leadership", href: "/leadership", image: "/images/staff/staff-gbenga-olaniyan.jpg" },
  { label: "I'm New", href: "/first-timers", image: "/images/first-timers/first-timers-welcome-smiles.jpg" },
  { label: "New Converts", href: "/new-converts", image: "/images/new-converts/new-converts-prayer-1.jpg" },
  { label: "Announcements", href: "/announcements", image: "/images/announcements/announcements-worship-experience.jpg" },
  { label: "Marketplace", href: "/marketplace", image: "/images/marketplace/marketplace-menu.jpg" },
  { label: "Sermons", href: "/sermons", image: "/images/sermons/sermons-preaching-1.jpg" },
  { label: "Contact", href: "/contact", image: "/images/general/general-connect-with-us.jpg" },
];

export const GIVE_LINK: NavLink = {
  label: "Give",
  href: "/give",
  image: "/images/general/general-worship-vocals-branded.jpg",
};
