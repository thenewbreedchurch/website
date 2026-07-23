import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { InstagramIcon, YoutubeIcon } from "@/components/icons/social-icons";
import { getChurchSettings, getServiceTimes } from "@/lib/settings";
import { NAV_LINKS } from "@/lib/nav-links";
import { groupConsecutiveServiceTimes } from "@/lib/service-times";

// The legacy site hand-duplicated service times, contact info, and social
// links across 4-6 files each; this is now the single rendering of all three,
// sourced live from ChurchSettings/ServiceTime so editing content in /admin
// updates every page that shows it.
export async function Footer() {
  const [settings, serviceTimes] = await Promise.all([
    getChurchSettings(),
    getServiceTimes(),
  ]);

  const grouped = groupConsecutiveServiceTimes(serviceTimes);

  return (
    <footer className="border-t border-border bg-surface-muted">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-lg font-semibold">{settings.orgName}</p>
            <p className="mt-2 text-sm text-current/70">{settings.tagline}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-current/60">
              Contact
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-brand-700" />
                <span>
                  {settings.streetAddress}, {settings.addressLocality},{" "}
                  {settings.addressRegion}, {settings.addressCountry}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="shrink-0 text-brand-700" />
                <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="hover:underline">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="shrink-0 text-brand-700" />
                <a href={`mailto:${settings.email}`} className="hover:underline">
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-current/60">
              Weekly Activities
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {grouped.map((entry) => (
                <li key={entry.key}>
                  <span className="font-medium">{entry.days}: </span>
                  <span className="text-current/80">
                    {entry.time} {entry.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-current/60">
              Follow Us
            </h3>
            <div className="mt-3 flex items-center gap-3">
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-800 transition-colors hover:bg-brand-700 hover:text-white dark:bg-white/10 dark:text-white"
                >
                  <InstagramIcon width={16} height={16} />
                </a>
              )}
              {settings.youtubeUrl && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-800 transition-colors hover:bg-brand-700 hover:text-white dark:bg-white/10 dark:text-white"
                >
                  <YoutubeIcon width={16} height={16} />
                </a>
              )}
              {settings.livestreamUrl && (
                <a
                  href={settings.livestreamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
                >
                  Listen Live
                </a>
              )}
            </div>

            <nav className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-current/70" aria-label="Footer">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="hover:underline">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-sm text-current/60">
          &copy; {new Date().getFullYear()} {settings.orgName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
