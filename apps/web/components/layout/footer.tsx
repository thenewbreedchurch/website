import Link from "next/link";
import Image from "next/image";
import { getChurchSettings, getServiceTimes } from "@/lib/settings";
import { NAV_LINKS, GIVE_LINK } from "@/lib/nav-links";
import { groupConsecutiveServiceTimes } from "@/lib/service-times";

// Single rendering of contact info, service times and socials, sourced live
// from ChurchSettings/ServiceTime so /admin edits update every page. Styled
// after wearethenew.org: black field, mono uppercase meta, hairline rules.
export async function Footer() {
  const [settings, serviceTimes] = await Promise.all([
    getChurchSettings(),
    getServiceTimes(),
  ]);

  const grouped = groupConsecutiveServiceTimes(serviceTimes);
  const socials = [
    settings.instagramUrl && { label: "Instagram", href: settings.instagramUrl },
    settings.youtubeUrl && { label: "YouTube", href: settings.youtubeUrl },
    settings.livestreamUrl && { label: "Watch Live", href: settings.livestreamUrl },
  ].filter((s): s is { label: string; href: string } => Boolean(s));

  return (
    <footer className="bg-night text-white">
      <div className="grid gap-12 px-4 pb-12 pt-20 sm:px-6 lg:grid-cols-[1fr_auto_auto] lg:px-9">
        <div className="max-w-sm">
          <Image
            src="/logo-mark.png"
            alt=""
            width={166}
            height={160}
            className="h-16 w-auto"
          />
          <p className="mt-4 font-display text-2xl font-bold uppercase leading-none tracking-tight">
            {settings.orgName}
          </p>
          <p className="t-body mt-3 text-sm text-white/65">{settings.tagline}</p>
        </div>

        <div>
          <p className="t-eyebrow text-brand-300">Weekly</p>
          <ul className="t-eyebrow mt-4 hidden space-y-2.5 text-white/85 sm:block">
            {grouped.map((entry) => (
              <li key={entry.key}>
                {entry.days} · {entry.time} {entry.label}
              </li>
            ))}
          </ul>
          <Link href="/about" className="t-eyebrow mt-4 inline-block text-white/85 underline sm:hidden">
            See service times
          </Link>
        </div>

        <nav aria-label="Footer" className="t-eyebrow grid grid-cols-2 gap-x-10 gap-y-2.5 text-white/85">
          {[...NAV_LINKS.filter((l) => l.href !== "/"), GIVE_LINK].map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {socials.length > 0 && (
        <div className="t-eyebrow flex flex-wrap justify-between gap-4 border-t border-white/15 px-4 py-5 text-white/70 sm:px-6 lg:px-9">
          {socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              {s.label}
            </a>
          ))}
        </div>
      )}

      <div className="t-eyebrow flex flex-col gap-3 border-t border-white/15 px-4 py-5 text-white/60 sm:px-6 lg:flex-row lg:justify-between lg:px-9">
        <span>
          &copy; {new Date().getFullYear()} {settings.orgName}
        </span>
        <span>
          {settings.streetAddress}, {settings.addressLocality}, {settings.addressRegion},{" "}
          {settings.addressCountry}
        </span>
        <span>
          <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="hover:text-white">
            {settings.phone}
          </a>{" "}
          ·{" "}
          <a href={`mailto:${settings.email}`} className="hover:text-white">
            {settings.email}
          </a>
        </span>
      </div>
    </footer>
  );
}
