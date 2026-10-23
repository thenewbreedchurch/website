import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { pageMetadata } from "@/lib/metadata";
import { getDirectoryHome } from "@/lib/directory-queries";
import { SectionBand } from "@/components/ui/section-band";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StaggeredHeading } from "@/components/ui/staggered-heading";
import { TextLink } from "@/components/ui/text-link";
import { VendorCard } from "@/components/directory/vendor-card";

export const metadata: Metadata = pageMetadata({
  title: "Business Directory",
  description:
    "Find trusted businesses, artisans and service providers built by The New Breed Church community — search, compare and contact them directly.",
  path: "/directory",
});

const STEPS = [
  { title: "Search", body: "Look up a service, a business or a category — or filter by where you are." },
  { title: "Compare", body: "Read profiles, see their work, prices and hours, and check what others say." },
  { title: "Contact", body: "Call, WhatsApp or email the business directly. No middleman." },
];

export default async function DirectoryHomePage() {
  const { featured, recent, categories, totalVendors, verifiedVendors } = await getDirectoryHome();
  const usedCategories = categories.filter((c) => c._count.vendors > 0);

  return (
    <>
      <SectionBand tone="night" className="!pb-20 !pt-16 sm:!pt-24">
        <Eyebrow>Business directory</Eyebrow>
        <StaggeredHeading as="h1" className="mt-6" lines={["Find trusted", "businesses"]} haloLine={1} />
        <p className="t-body mt-8 max-w-xl text-base text-white/80 sm:text-lg">
          Built by our community. Discover verified entrepreneurs, artisans and service providers — and contact
          them directly.
        </p>

        <form action="/directory/browse" className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-[1fr_14rem_auto]">
          <label className="sr-only" htmlFor="dir-q">
            Search businesses
          </label>
          <input
            id="dir-q"
            name="q"
            type="search"
            placeholder="Search name, service, category…"
            className="h-12 w-full rounded-none border border-white/30 bg-white/10 px-4 text-sm text-white placeholder:text-white/60 focus:border-white focus:outline-none"
          />
          <label className="sr-only" htmlFor="dir-cat">
            Category
          </label>
          <select
            id="dir-cat"
            name="category"
            defaultValue=""
            className="h-12 w-full rounded-none border border-white/30 bg-night px-3 text-sm text-white focus:border-white focus:outline-none"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-12 rounded-none bg-brand-600 px-8 text-sm font-bold uppercase tracking-tight text-white transition-colors hover:bg-brand-500"
          >
            Search
          </button>
        </form>

        <p className="t-eyebrow mt-10 text-white/60">
          {totalVendors} {totalVendors === 1 ? "business" : "businesses"} · {verifiedVendors} verified · {usedCategories.length}{" "}
          {usedCategories.length === 1 ? "category" : "categories"}
        </p>
      </SectionBand>

      {featured.length > 0 && (
        <SectionBand tone="violet">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow className="text-white/80">Featured</Eyebrow>
              <StaggeredHeading className="mt-6" size="sm" lines={["Featured", "businesses"]} haloLine={1} haloClassName="text-white" />
            </div>
            <div className="[--link-accent:var(--color-white)]">
              <TextLink href="/directory/browse">See all</TextLink>
            </div>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((v) => (
              <VendorCard key={v.id} vendor={v} />
            ))}
          </div>
        </SectionBand>
      )}

      <SectionBand tone="white">
        <Eyebrow className="text-brand-700 dark:text-brand-300">Categories</Eyebrow>
        <StaggeredHeading className="mt-6" size="sm" lines={["Browse by", "category"]} haloLine={1} haloClassName="text-brand-600" />
        <ul className="mt-12 grid gap-x-12 lg:grid-cols-2">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/directory/browse?category=${c.slug}`}
                className="group flex items-center justify-between gap-4 border-t border-current/20 py-5 transition-colors hover:text-brand-700 dark:hover:text-brand-300"
              >
                <span>
                  <span className="block font-display text-xl font-bold uppercase leading-tight tracking-tight sm:text-2xl">{c.name}</span>
                  <span className="t-eyebrow mt-1.5 block text-[10px] text-current/55">
                    {c._count.vendors} {c._count.vendors === 1 ? "business" : "businesses"}
                  </span>
                </span>
                <ArrowUpRight className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={22} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </SectionBand>

      {recent.length > 0 && (
        <SectionBand tone="night">
          <Eyebrow>New</Eyebrow>
          <StaggeredHeading className="mt-6" size="sm" lines={["Recently", "added"]} haloLine={1} />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((v) => (
              <VendorCard key={v.id} vendor={v} />
            ))}
          </div>
        </SectionBand>
      )}

      <SectionBand tone="white">
        <Eyebrow className="text-brand-700 dark:text-brand-300">How it works</Eyebrow>
        <StaggeredHeading className="mt-6" size="sm" lines={["How it", "works"]} haloLine={1} haloClassName="text-brand-600" />
        <ol className="mt-12">
          {STEPS.map((s, i) => (
            <li key={s.title} className="grid gap-4 border-t border-current/20 py-8 last:border-b sm:grid-cols-[5rem_14rem_1fr] sm:gap-8">
              <span className="font-display text-5xl font-bold leading-none text-brand-600">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-2xl font-bold uppercase leading-none tracking-tight sm:text-3xl">{s.title}</h3>
              <p className="t-body max-w-md text-current/75">{s.body}</p>
            </li>
          ))}
        </ol>
      </SectionBand>

      <SectionBand tone="violet" className="text-center">
        <StaggeredHeading size="sm" align="center" lines={["Run a", "business?"]} haloLine={1} haloClassName="text-white" />
        <p className="t-body mx-auto mt-6 max-w-md text-white/85">
          Get your business in front of the church community. It&apos;s free to list.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-4 [--link-accent:var(--color-white)]">
          <TextLink href="/directory/list-your-business">List your business</TextLink>
          <TextLink href="/directory/browse">Find a business</TextLink>
        </div>
      </SectionBand>
    </>
  );
}
