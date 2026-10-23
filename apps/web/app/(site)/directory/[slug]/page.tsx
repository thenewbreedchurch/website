import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Clock, MapPin, Tag, CalendarDays, Star } from "lucide-react";
import { pageMetadata, safeJsonLdString, SITE_URL } from "@/lib/metadata";
import { prisma } from "@nb-church/db";
import { getDirectoryUser } from "@/lib/directory-session";
import { getVendorBySlug } from "@/lib/directory-queries";
import { externalUrl, initialsOf, socialUrl, telHref, whatsappNumber } from "@/lib/directory";
import { SectionBand } from "@/components/ui/section-band";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TrackedLink, ViewTracker } from "@/components/directory/tracked-link";
import { ReviewForm } from "@/components/directory/review-form";
import { ReportForm } from "@/components/directory/report-form";
import { ResendVerificationButton } from "@/components/directory/auth-forms";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await getVendorBySlug(slug);
  if (!vendor || vendor.status !== "APPROVED") return pageMetadata({ title: "Business not found", description: "", path: "/directory" });
  return pageMetadata({
    title: `${vendor.businessName} — ${vendor.category.name}`,
    description: vendor.description.slice(0, 155),
    path: `/directory/${vendor.slug}`,
    ogImage: vendor.logoUrl ?? undefined,
  });
}

const btn = "inline-flex w-full items-center justify-center px-6 py-4 text-sm font-bold uppercase tracking-tight transition-colors";

export default async function VendorProfilePage({ params }: Props) {
  const { slug } = await params;
  const vendor = await getVendorBySlug(slug);
  if (!vendor || vendor.status !== "APPROVED") notFound();

  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const [user, reviews] = await Promise.all([
    getDirectoryUser(),
    prisma.vendorReview.findMany({
      where: { vendorId: vendor.id, status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: { select: { name: true } } },
    }),
  ]);
  const myReview = user ? await prisma.vendorReview.findUnique({ where: { vendorId_userId: { vendorId: vendor.id, userId: user.id } } }) : null;
  const isOwner = Boolean(user && vendor.ownerId === user.id);
  const tel = telHref(vendor.phone);
  const wa = whatsappNumber(vendor.whatsapp ?? vendor.phone);
  const site = externalUrl(vendor.website);
  const socials: [string, string][] = [];
  for (const [label, url] of [
    ["Instagram", socialUrl("instagram", vendor.instagram)],
    ["Facebook", socialUrl("facebook", vendor.facebook)],
    ["LinkedIn", socialUrl("linkedin", vendor.linkedin)],
    ["TikTok", socialUrl("tiktok", vendor.tiktok)],
  ] as const) {
    if (url) socials.push([label, url]);
  }

  const yearsExperience = vendor.yearStarted ? Math.max(0, new Date().getFullYear() - vendor.yearStarted) : null;
  const facts = [
    vendor.yearStarted && { icon: CalendarDays, label: `${yearsExperience}+ years (since ${vendor.yearStarted})` },
    vendor.businessHours && { icon: Clock, label: vendor.businessHours },
    vendor.serviceAreas && { icon: MapPin, label: `Serves: ${vendor.serviceAreas}` },
    vendor.priceRange && { icon: Tag, label: `Price range: ${vendor.priceRange}` },
  ].filter(Boolean) as { icon: typeof Clock; label: string }[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: vendor.businessName,
    description: vendor.description,
    url: `${SITE_URL}/directory/${vendor.slug}`,
    ...(vendor.logoUrl ? { image: vendor.logoUrl } : {}),
    ...(vendor.phone ? { telephone: vendor.phone } : {}),
    ...(vendor.email ? { email: vendor.email } : {}),
    address: { "@type": "PostalAddress", addressLocality: vendor.location, addressCountry: "NG" },
    ...(vendor.ratingCount > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: vendor.ratingAvg.toFixed(1), reviewCount: vendor.ratingCount } }
      : {}),
  };

  return (
    <>
      <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: safeJsonLdString(jsonLd) }} />
      <ViewTracker vendorId={vendor.id} />

      <SectionBand tone="night" className="relative isolate overflow-hidden !pb-14 !pt-12 sm:!pt-16">
        {vendor.coverUrl && (
          <>
            <Image src={vendor.coverUrl} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-40" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night to-night/30" />
          </>
        )}
        <Link href="/directory/browse" className="t-eyebrow text-white/70 hover:text-white">
          ← All businesses
        </Link>
        <div className="mt-10 flex flex-wrap items-end gap-6">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-brand-800 sm:h-28 sm:w-28">
            {vendor.logoUrl ? (
              <Image src={vendor.logoUrl} alt={`${vendor.businessName} logo`} fill sizes="112px" className="object-cover" />
            ) : (
              <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center font-display text-6xl font-bold text-brand-300">
                {initialsOf(vendor.businessName)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <Eyebrow>
              {vendor.category.name}
              {vendor.subcategory ? ` · ${vendor.subcategory}` : ""}
            </Eyebrow>
            <h1 className="t-display-sm mt-4 break-words">{vendor.businessName}</h1>
            <div className="t-eyebrow mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-white/70">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={12} aria-hidden="true" /> {vendor.location}
              </span>
              {vendor.isVerified && <span className="bg-white px-2 py-1 text-[10px] text-brand-800">Verified</span>}
              {vendor.isFeatured && <span className="bg-brand-600 px-2 py-1 text-[10px] text-white">Featured</span>}
              {vendor.ratingCount > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Star size={12} className="fill-white" aria-hidden="true" /> {vendor.ratingAvg.toFixed(1)} ({vendor.ratingCount})
                </span>
              )}
            </div>
          </div>
        </div>
      </SectionBand>

      <SectionBand tone="white">
        <div className="grid gap-14 lg:grid-cols-[1fr_22rem]">
          <div className="min-w-0 space-y-12">
            <section>
              <Eyebrow className="text-brand-700 dark:text-brand-300">About</Eyebrow>
              <p className="t-body mt-5 max-w-2xl whitespace-pre-line text-base text-current/85">{vendor.description}</p>
              {facts.length > 0 && (
                <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                  {facts.map(({ icon: Icon, label }) => (
                    <li key={label} className="flex items-start gap-3 text-sm">
                      <Icon size={16} className="mt-0.5 shrink-0 text-brand-700 dark:text-brand-300" aria-hidden="true" />
                      {label}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {vendor.services.length > 0 && (
              <section>
                <Eyebrow className="text-brand-700 dark:text-brand-300">Services</Eyebrow>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {vendor.services.map((s) => (
                    <li key={s} className="t-eyebrow border border-current/25 px-3 py-2 text-[11px]">
                      {s}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {vendor.images.length > 0 && (
              <section>
                <Eyebrow className="text-brand-700 dark:text-brand-300">Portfolio</Eyebrow>
                <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {vendor.images.map((img) => (
                    <li key={img.id} className="relative aspect-square overflow-hidden bg-brand-50 dark:bg-white/5">
                      <Image src={img.url} alt={img.caption ?? `${vendor.businessName} work`} fill sizes="(min-width: 640px) 25vw, 50vw" className="object-cover" />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <Eyebrow className="text-brand-700 dark:text-brand-300">
                Reviews{vendor.ratingCount > 0 ? ` · ${vendor.ratingAvg.toFixed(1)} / 5 (${vendor.ratingCount})` : ""}
              </Eyebrow>
              {reviews.length === 0 ? (
                <p className="t-body mt-5 text-sm text-current/65">No reviews yet — be the first to share your experience.</p>
              ) : (
                <ul className="mt-5">
                  {reviews.map((r) => (
                    <li key={r.id} className="border-t border-current/20 py-5 last:border-b">
                      <p className="t-eyebrow text-[11px]">
                        {"★".repeat(r.rating)}
                        <span className="text-current/30">{"★".repeat(5 - r.rating)}</span> · {r.user.name} · {r.createdAt.toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                      <p className="t-body mt-2 max-w-2xl whitespace-pre-line text-sm">{r.body}</p>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-8 max-w-xl">
                {isOwner ? (
                  <p className="t-body text-sm text-current/65">You can&apos;t review your own business.</p>
                ) : !user ? (
                  <p className="t-body text-sm">
                    <Link href={`/directory/sign-in?next=${encodeURIComponent(`/directory/${vendor.slug}`)}`} className="font-semibold underline">
                      Sign in
                    </Link>{" "}
                    or{" "}
                    <Link href="/directory/sign-up" className="font-semibold underline">
                      create an account
                    </Link>{" "}
                    to leave a review.
                  </p>
                ) : !user.emailVerifiedAt ? (
                  <p className="t-body text-sm">
                    Verify your email to leave a review. <ResendVerificationButton />
                  </p>
                ) : (
                  <ReviewForm vendorId={vendor.id} existing={myReview ? { rating: myReview.rating, body: myReview.body } : null} />
                )}
              </div>
            </section>
          </div>

          <aside className="h-fit space-y-3 border border-current/20 p-6 lg:sticky lg:top-28">
            <Eyebrow className="text-brand-700 dark:text-brand-300">Contact</Eyebrow>
            {tel && (
              <TrackedLink vendorId={vendor.id} type="CALL" href={tel} className={`${btn} bg-brand-700 text-white hover:bg-brand-800`}>
                Call {vendor.phone}
              </TrackedLink>
            )}
            {wa && (
              <TrackedLink
                vendorId={vendor.id}
                type="WHATSAPP"
                href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hello ${vendor.businessName}, I found you on The New Breed Church directory.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btn} border border-current/30 hover:bg-current/5`}
              >
                WhatsApp
              </TrackedLink>
            )}
            {vendor.email && (
              <TrackedLink vendorId={vendor.id} type="EMAIL" href={`mailto:${vendor.email}`} className={`${btn} border border-current/30 hover:bg-current/5`}>
                Email
              </TrackedLink>
            )}
            {site && (
              <TrackedLink vendorId={vendor.id} type="WEBSITE" href={site} target="_blank" rel="noopener noreferrer" className={`${btn} border border-current/30 hover:bg-current/5`}>
                Website
              </TrackedLink>
            )}
            {!tel && !wa && !vendor.email && !site && (
              <p className="text-sm text-current/60">This business hasn&apos;t added contact details yet.</p>
            )}
            {socials.length > 0 && (
              <ul className="flex flex-wrap gap-x-5 gap-y-2 border-t border-current/15 pt-4">
                {socials.map(([label, url]) => (
                  <li key={label}>
                    <TrackedLink vendorId={vendor.id} type="SOCIAL" href={url} target="_blank" rel="noopener noreferrer" className="t-eyebrow text-[11px] underline underline-offset-4 hover:text-brand-700 dark:hover:text-brand-300">
                      {label}
                    </TrackedLink>
                  </li>
                ))}
              </ul>
            )}
            <ReportForm vendorId={vendor.id} />
          </aside>
        </div>
      </SectionBand>
    </>
  );
}
