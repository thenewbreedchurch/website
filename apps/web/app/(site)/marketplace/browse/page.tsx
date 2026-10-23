import type { Metadata } from "next";
import Link from "next/link";
import { X } from "lucide-react";
import { pageMetadata } from "@/lib/metadata";
import { browseVendors, getCategories, type BrowseSort } from "@/lib/directory-queries";
import { SectionBand } from "@/components/ui/section-band";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StaggeredHeading } from "@/components/ui/staggered-heading";
import { LinkButton } from "@/components/ui/link-button";
import { VendorCard } from "@/components/directory/vendor-card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Browse Businesses",
  description: "Search and filter verified businesses, artisans and service providers in The New Breed Church community.",
  path: "/marketplace/browse",
});

const SORTS: { value: BrowseSort; label: string }[] = [
  { value: "featured", label: "Featured first" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top rated" },
  { value: "name", label: "Name A–Z" },
];

type RawParams = { q?: string; category?: string; subcategory?: string; location?: string; verified?: string; sort?: string; page?: string };

function href(p: Record<string, string | undefined>, override: Record<string, string | undefined> = {}) {
  const merged = { ...p, ...override, page: override.page };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) if (v) qs.set(k, v);
  const s = qs.toString();
  return s ? `/marketplace/browse?${s}` : "/marketplace/browse";
}

export default async function BrowsePage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const raw = await searchParams;
  const sort = SORTS.some((s) => s.value === raw.sort) ? (raw.sort as BrowseSort) : "featured";
  const params = {
    q: raw.q?.trim() || undefined,
    category: raw.category || undefined,
    subcategory: raw.subcategory || undefined,
    location: raw.location?.trim() || undefined,
    verified: raw.verified === "1" ? "1" : undefined,
    sort: sort === "featured" ? undefined : sort,
  };

  const [categories, { vendors, total, page, totalPages }] = await Promise.all([
    getCategories(),
    browseVendors({
      q: params.q,
      category: params.category,
      subcategory: params.subcategory,
      location: params.location,
      verified: Boolean(params.verified),
      sort,
      page: Math.max(1, Number(raw.page) || 1),
    }),
  ]);

  const activeCategory = categories.find((c) => c.slug === params.category);
  const chips: { label: string; remove: string }[] = [
    params.q && { label: `“${params.q}”`, remove: href(params, { q: undefined }) },
    activeCategory && { label: activeCategory.name, remove: href(params, { category: undefined, subcategory: undefined }) },
    params.subcategory && { label: params.subcategory, remove: href(params, { subcategory: undefined }) },
    params.location && { label: params.location, remove: href(params, { location: undefined }) },
    params.verified && { label: "Verified only", remove: href(params, { verified: undefined }) },
  ].filter((c): c is { label: string; remove: string } => Boolean(c));

  const field =
    "h-11 w-full rounded-none border border-border bg-surface px-3 text-sm text-foreground focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/25";

  const renderFilters = (idp: string) => (
    <>
      <form action="/marketplace/browse" className="mt-4 space-y-5 lg:mt-0">
                      <div>
                        <label htmlFor={`${idp}-q`} className="t-eyebrow text-[10px] text-current/60">
                          Search
                        </label>
                        <input id={`${idp}-q`} name="q" type="search" defaultValue={params.q} placeholder="Name, service…" className={cn(field, "mt-2")} />
                      </div>
                      <div>
                        <label htmlFor={`${idp}-loc`} className="t-eyebrow text-[10px] text-current/60">
                          Location
                        </label>
                        <input id={`${idp}-loc`} name="location" defaultValue={params.location} placeholder="e.g. Lekki, Ikeja" className={cn(field, "mt-2")} />
                      </div>
                      <div>
                        <label htmlFor={`${idp}-sort`} className="t-eyebrow text-[10px] text-current/60">
                          Sort by
                        </label>
                        <select id={`${idp}-sort`} name="sort" defaultValue={sort} className={cn(field, "mt-2")}>
                          {SORTS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                        <input type="checkbox" name="verified" value="1" defaultChecked={Boolean(params.verified)} className="h-4 w-4 accent-brand-700" />
                        Verified businesses only
                      </label>
                      {params.category && <input type="hidden" name="category" value={params.category} />}
                      {params.subcategory && <input type="hidden" name="subcategory" value={params.subcategory} />}
                      <button
                        type="submit"
                        className="h-11 w-full rounded-none bg-brand-700 text-sm font-bold uppercase tracking-tight text-white transition-colors hover:bg-brand-800"
                      >
                        Apply filters
                      </button>
                    </form>
      
                    <nav aria-label="Categories" className="mt-8">
                      <p className="t-eyebrow text-[10px] text-current/60">Category</p>
                      <ul className="mt-3 border-t border-current/15">
                        <li>
                          <Link
                            href={href(params, { category: undefined, subcategory: undefined })}
                            className={cn("flex justify-between border-b border-current/15 py-2.5 text-sm hover:text-brand-700 dark:hover:text-brand-300", !params.category && "font-bold text-brand-700 dark:text-brand-300")}
                          >
                            All categories
                          </Link>
                        </li>
                        {categories.map((c) => {
                          const active = c.slug === params.category;
                          return (
                            <li key={c.id}>
                              <Link
                                href={href(params, { category: c.slug, subcategory: undefined })}
                                aria-current={active ? "true" : undefined}
                                className={cn("flex justify-between gap-3 border-b border-current/15 py-2.5 text-sm hover:text-brand-700 dark:hover:text-brand-300", active && "font-bold text-brand-700 dark:text-brand-300")}
                              >
                                <span>{c.name}</span>
                                <span className="t-eyebrow text-[10px] text-current/50">{c._count.vendors}</span>
                              </Link>
                              {active && c.subcategories.length > 0 && (
                                <ul className="mb-2 ml-3 border-l border-current/20 pl-3">
                                  {c.subcategories.map((sub) => (
                                    <li key={sub}>
                                      <Link
                                        href={href(params, { subcategory: params.subcategory === sub ? undefined : sub })}
                                        className={cn("block py-1.5 text-xs hover:text-brand-700 dark:hover:text-brand-300", params.subcategory === sub && "font-bold text-brand-700 dark:text-brand-300")}
                                      >
                                        {sub}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </nav>
      
    </>
  );

  return (
    <>
      <SectionBand tone="night" className="!pb-12 !pt-14 sm:!pt-20">
        <Eyebrow>Marketplace</Eyebrow>
        <StaggeredHeading as="h1" className="mt-6" size="sm" lines={["Browse", "businesses"]} haloLine={1} />
      </SectionBand>

      <SectionBand tone="white" className="!pt-10">
        <div className="grid gap-10 lg:grid-cols-[17rem_1fr]">
          <aside>
            {/* Phones: collapsed behind a "Filters" button so results come first. Desktop: always-open sidebar. */}
            <details className="lg:hidden">
              <summary className="t-eyebrow cursor-pointer list-none border border-current/25 px-4 py-3">Filters{chips.length ? ` (${chips.length})` : ""}</summary>
              <div className="mt-4">{renderFilters("m")}</div>
            </details>
            <div className="hidden lg:block">{renderFilters("d")}</div>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="t-eyebrow text-current/60" aria-live="polite">
                {total} {total === 1 ? "business" : "businesses"} found
              </p>
              {chips.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {chips.map((c) => (
                    <li key={c.label}>
                      <Link href={c.remove} className="t-eyebrow inline-flex items-center gap-2 border border-current/25 px-3 py-2 text-[10px] hover:border-brand-600">
                        {c.label} <X size={12} aria-label="Remove filter" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {vendors.length === 0 ? (
              <div className="mt-10 border border-dashed border-current/25 p-10 text-center">
                <p className="font-display text-2xl font-bold uppercase tracking-tight">No businesses found</p>
                <p className="t-body mt-3 text-sm text-current/70">Try a different search or remove a filter.</p>
                <div className="mt-6 flex justify-center">
                  <LinkButton href="/marketplace/browse" shape="square">
                    Clear all filters
                  </LinkButton>
                </div>
              </div>
            ) : (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {vendors.map((v) => (
                  <VendorCard key={v.id} vendor={v} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                {page > 1 && (
                  <LinkButton href={href(params, { page: String(page - 1) })} variant="outline" size="sm" shape="square">
                    Previous
                  </LinkButton>
                )}
                <span className="t-eyebrow text-current/60">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <LinkButton href={href(params, { page: String(page + 1) })} variant="outline" size="sm" shape="square">
                    Next
                  </LinkButton>
                )}
              </div>
            )}
          </div>
        </div>
      </SectionBand>
    </>
  );
}
