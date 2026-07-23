import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.thenewbreedchurch.org";
const DEFAULT_OG_IMAGE = "/images/hero/og-default.jpg";

export interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
}

/** Every page should call this for consistent title templating, canonical URL, and OG/Twitter tags — the legacy site only had this on 2 of 5 pages. */
export function pageMetadata({ title, description, path, ogImage }: PageMetaInput): Metadata {
  const url = new URL(path, SITE_URL).toString();
  const image = ogImage ?? DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "The New Breed Church",
      images: [{ url: image }],
      locale: "en_NG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export interface OrganizationJsonLdInput {
  orgName: string;
  tagline: string;
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  addressCountry: string;
  phone: string;
  email: string;
  socialUrls: string[];
}

/** Organization structured data, present sitewide via the root layout. */
export function organizationJsonLd(input: OrganizationJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Church",
    name: input.orgName,
    description: input.tagline,
    url: SITE_URL,
    email: input.email,
    telephone: input.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: input.streetAddress,
      addressLocality: input.addressLocality,
      addressRegion: input.addressRegion,
      addressCountry: input.addressCountry,
    },
    sameAs: input.socialUrls,
  };
}

export interface EventJsonLdInput {
  name: string;
  description: string;
  startDateTime: Date;
  endDateTime?: Date | null;
  location?: string | null;
  isOnline: boolean;
  onlineUrl?: string | null;
  imageUrl?: string | null;
  path: string;
}

/** Per-announcement Event structured data, for the announcements detail pages. */
export function eventJsonLd(input: EventJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: input.name,
    description: input.description,
    startDate: input.startDateTime.toISOString(),
    ...(input.endDateTime ? { endDate: input.endDateTime.toISOString() } : {}),
    eventAttendanceMode: input.isOnline
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    location: input.isOnline
      ? { "@type": "VirtualLocation", url: input.onlineUrl ?? SITE_URL }
      : { "@type": "Place", name: input.location ?? "The New Breed Church" },
    ...(input.imageUrl ? { image: [input.imageUrl] } : {}),
    url: new URL(input.path, SITE_URL).toString(),
  };
}

export { SITE_URL };
