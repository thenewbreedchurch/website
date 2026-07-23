import type { Metadata } from "next";
import Image from "next/image";
import { Radio, Music2, Globe, UserPlus } from "lucide-react";
import { getChurchSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/metadata";
import { InstagramIcon, YoutubeIcon } from "@/components/icons/social-icons";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getChurchSettings();
  const title = `${settings.orgName} — Links`;
  const description = "All our links in one place.";
  return {
    title,
    description,
    openGraph: { title, description, url: new URL("/linktree", SITE_URL).toString() },
    twitter: { card: "summary", title, description },
  };
}

// Deliberately outside the (site) route group — no shared header/footer, a
// standalone bio-link microsite matching the legacy linktree.html's intent.
export default async function LinktreePage() {
  const settings = await getChurchSettings();

  const links = [
    { label: "Visit Our Website", href: SITE_URL, icon: Globe },
    ...(settings.instagramUrl
      ? [{ label: "Follow on Instagram", href: settings.instagramUrl, icon: InstagramIcon }]
      : []),
    ...(settings.youtubeUrl
      ? [{ label: "Watch on YouTube", href: settings.youtubeUrl, icon: YoutubeIcon }]
      : []),
    ...(settings.livestreamUrl
      ? [{ label: "Listen on Mixlr", href: settings.livestreamUrl, icon: Radio }]
      : []),
    {
      label: "Follow on TikTok",
      href: "https://www.tiktok.com/@the_newbreedchurch",
      icon: Music2,
    },
    ...(settings.memberRegistrationUrl
      ? [
          {
            label: "Membership Form",
            href: settings.memberRegistrationUrl,
            icon: UserPlus,
          },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand-900 via-brand-800 to-brand-950 px-4 py-16 text-white">
      <Image
        src="/logo.png"
        alt={settings.orgName}
        width={72}
        height={72}
        className="h-18 w-18 rounded-full bg-white/10 object-contain p-2"
      />
      <h1 className="mt-4 font-display text-2xl font-bold">{settings.orgName}</h1>
      <p className="mt-1 text-sm text-white/70">{settings.tagline}</p>

      <nav className="mt-8 flex w-full max-w-sm flex-col gap-3">
        {links.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-sm font-medium backdrop-blur transition-colors hover:bg-white/20"
          >
            <Icon size={18} className="shrink-0" />
            {label}
          </a>
        ))}
      </nav>

      <p className="mt-10 text-xs text-white/50">
        &copy; {new Date().getFullYear()} {settings.orgName}. All rights reserved.
      </p>
    </div>
  );
}
