import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import { getChurchSettings } from "@/lib/settings";
import { organizationJsonLd, SITE_URL } from "@/lib/metadata";
import "./globals.css";

// Carried forward from the legacy site's actual brand fonts (Montserrat body
// / Playfair Display headings, loaded from Google Fonts CDN there) — now
// self-hosted via next/font so there's no third-party font request at all.
const bodyFont = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const headingFont = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getChurchSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${settings.orgName} — ${settings.tagline}`,
      template: `%s — ${settings.orgName}`,
    },
    description: settings.tagline,
    // icons are picked up automatically from app/icon.png, app/apple-icon.png,
    // and app/favicon.ico via Next.js's file-based metadata convention.
  };
}

// Deliberately no Header/Footer here — this wraps EVERY route including
// /admin/** and /linktree, which must not show the public marketing nav.
// The public site chrome lives in app/(site)/layout.tsx instead.
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getChurchSettings();
  const jsonLd = organizationJsonLd({
    orgName: settings.orgName,
    tagline: settings.tagline,
    streetAddress: settings.streetAddress,
    addressLocality: settings.addressLocality,
    addressRegion: settings.addressRegion,
    addressCountry: settings.addressCountry,
    phone: settings.phone,
    email: settings.email,
    socialUrls: [settings.instagramUrl, settings.youtubeUrl].filter(
      (v): v is string => Boolean(v)
    ),
  });

  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
