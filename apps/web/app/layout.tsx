import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { Montserrat, Playfair_Display } from "next/font/google";
import { getChurchSettings } from "@/lib/settings";
import { organizationJsonLd, safeJsonLdString, SITE_URL } from "@/lib/metadata";
import { CookieConsentBanner } from "@/components/consent/cookie-consent-banner";
import "./globals.css";

// Only the admin panel exposes a manual toggle today, but the cookie/class
// is read here at the root so it works for any route. Absence of the cookie
// means "never chosen" — the plain `prefers-color-scheme` media query in
// globals.css keeps following the OS automatically, no class needed.
const THEME_COOKIE = "nbc_theme";

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
  // Set by proxy.ts in production only (dev keeps CSP's script-src on
  // 'unsafe-inline', so no nonce is needed there — undefined is fine, React
  // just omits the attribute).
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const themeCookie = (await cookies()).get(THEME_COOKIE)?.value;
  const resolvedThemeClass =
    themeCookie === "dark" ? "dark" : themeCookie === "light" ? "light" : "";
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
      className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased ${resolvedThemeClass}`.trim()}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: safeJsonLdString(jsonLd) }}
        />
        {children}
        {/* Site-wide since consent is a site-wide concern — covers /admin
            and /linktree too, not just the (site) route group. */}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
