import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { initialsOf } from "@/lib/directory";
import type { VendorCardData } from "@/lib/directory-queries";

/** Square directory card: logo (or a big initial), mono category, display-serif name. */
export function VendorCard({ vendor }: { vendor: VendorCardData }) {
  return (
    <Link
      href={`/marketplace/${vendor.slug}`}
      className="group flex h-full flex-col border border-border bg-surface text-foreground transition-colors hover:border-brand-500"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-900">
        {vendor.logoUrl ? (
          <Image
            src={vendor.logoUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center font-display text-8xl font-bold text-brand-300/90"
          >
            {initialsOf(vendor.businessName)}
          </span>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          {vendor.isFeatured && <span className="t-eyebrow bg-brand-600 px-2 py-1.5 text-[10px] text-white">Featured</span>}
          {vendor.isVerified && <span className="t-eyebrow bg-white px-2 py-1.5 text-[10px] text-brand-800">Verified</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="t-eyebrow text-[10px] text-brand-700 dark:text-brand-300">
          {vendor.category.name}
          {vendor.subcategory ? ` · ${vendor.subcategory}` : ""}
        </p>
        <h3 className="mt-3 font-display text-2xl font-bold uppercase leading-none tracking-tight">{vendor.businessName}</h3>
        <p className="t-eyebrow mt-3 text-[10px] text-current/60">{vendor.location}</p>
        <p className="t-body mt-3 line-clamp-3 text-sm text-current/75">{vendor.description}</p>
        {vendor.ratingCount > 0 && (
          <p className="mt-auto flex items-center gap-1.5 pt-4 text-sm font-semibold">
            <Star size={14} className="fill-brand-600 text-brand-600" aria-hidden="true" />
            {vendor.ratingAvg.toFixed(1)}
            <span className="font-normal text-current/60">({vendor.ratingCount})</span>
          </p>
        )}
      </div>
    </Link>
  );
}
