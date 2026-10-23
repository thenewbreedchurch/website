import Link from "next/link";
import { prisma, type VendorStatType } from "@nb-church/db";
import { getVendorStats } from "@/lib/directory-queries";
import { requireDirectoryUser } from "@/lib/directory-session";
import { VENDOR_STATUS_LABELS, VENDOR_STAT_LABELS } from "@/lib/directory";
import { StatsChart } from "@/components/directory/stats-chart";
import { ClaimButton } from "@/components/directory/claim-button";
import { ResendVerificationButton } from "@/components/directory/auth-forms";
import { LinkButton } from "@/components/ui/link-button";

export default async function DashboardOverviewPage() {
  const user = await requireDirectoryUser();
  const vendor = await prisma.vendor.findFirst({ where: { ownerId: user.id }, include: { category: { select: { name: true } } } });

  // Imported listings with no owner whose email matches this verified account.
  const claimable =
    !vendor && user.emailVerifiedAt
      ? await prisma.vendor.findMany({ where: { ownerId: null, email: user.email.toLowerCase() }, select: { id: true, businessName: true, location: true }, take: 5 })
      : [];

  const [{ totals, days, windowDays }, reviews] = vendor
    ? await Promise.all([
        getVendorStats(vendor.id),
        prisma.vendorReview.findMany({
          where: { vendorId: vendor.id, status: "PUBLISHED" },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { user: { select: { name: true } } },
        }),
      ])
    : [{ totals: {}, days: [], windowDays: 30 }, []];

  return (
    <div className="space-y-12">
      {!user.emailVerifiedAt && (
        <div role="status" className="border border-brand-600 bg-brand-50 p-5 text-sm text-brand-900 dark:bg-white/5 dark:text-white">
          Please verify your email address — we sent you a link when you signed up. <ResendVerificationButton />
        </div>
      )}

      {claimable.length > 0 && (
        <section className="border border-current/25 p-6">
          <p className="t-eyebrow text-brand-700 dark:text-brand-300">We found your business</p>
          <p className="t-body mt-3 max-w-xl text-sm text-current/75">
            These listings use your email address. Claim one to manage it yourself.
          </p>
          <ul className="mt-5 space-y-3">
            {claimable.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-current/15 pt-3">
                <span className="font-display text-xl font-bold uppercase tracking-tight">
                  {c.businessName} <span className="t-eyebrow ml-2 text-[10px] text-current/55">{c.location}</span>
                </span>
                <ClaimButton vendorId={c.id} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {!vendor ? (
        claimable.length === 0 && (
          <section>
            <h2 className="font-display text-3xl font-bold uppercase leading-none tracking-tight">Welcome, {user.name.split(" ")[0]}</h2>
            <p className="t-body mt-4 max-w-md text-current/75">You haven&apos;t listed a business yet. It takes a few minutes, and it&apos;s free.</p>
            <div className="mt-6">
              <LinkButton href="/directory/dashboard/listing" size="lg">
                Create your listing
              </LinkButton>
            </div>
          </section>
        )
      ) : (
        <>
          <section className="grid gap-6 border border-current/20 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="t-eyebrow text-[11px] text-current/60">{vendor.category.name}</p>
              <h2 className="mt-2 font-display text-3xl font-bold uppercase leading-none tracking-tight">{vendor.businessName}</h2>
              <p className="t-eyebrow mt-3 text-[11px]">
                <span className="mr-3 bg-brand-700 px-2 py-1 text-white">{VENDOR_STATUS_LABELS[vendor.status]}</span>
                {vendor.isVerified ? "Verified" : "Not verified yet"}
              </p>
              {vendor.adminNotes && (vendor.status === "REJECTED" || vendor.status === "SUSPENDED") && (
                <p className="t-body mt-4 max-w-xl whitespace-pre-line border-l-2 border-brand-600 pl-4 text-sm">{vendor.adminNotes}</p>
              )}
              {vendor.status === "PENDING" && <p className="t-body mt-4 max-w-xl text-sm text-current/70">Your listing is waiting for review. We&apos;ll email you when it&apos;s live.</p>}
            </div>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/directory/dashboard/listing" variant="outline" className="border-current/40">
                Edit listing
              </LinkButton>
              {vendor.status === "APPROVED" && (
                <LinkButton href={`/directory/${vendor.slug}`}>View public page</LinkButton>
              )}
            </div>
          </section>

          <section>
            <h2 className="t-eyebrow text-brand-700 dark:text-brand-300">Last {windowDays} days</h2>
            <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {(Object.keys(VENDOR_STAT_LABELS) as VendorStatType[]).map((t) => (
                <li key={t} className="border border-current/20 p-4">
                  <p className="font-display text-4xl font-bold leading-none">{totals[t] ?? 0}</p>
                  <p className="t-eyebrow mt-2 text-[10px] text-current/60">{VENDOR_STAT_LABELS[t]}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <StatsChart days={days} />
            </div>
          </section>

          <section>
            <h2 className="t-eyebrow text-brand-700 dark:text-brand-300">
              Reviews ({vendor.ratingCount}
              {vendor.ratingCount > 0 ? ` · ${vendor.ratingAvg.toFixed(1)}★` : ""})
            </h2>
            {reviews.length === 0 ? (
              <p className="t-body mt-4 text-sm text-current/65">No reviews yet.</p>
            ) : (
              <ul className="mt-5">
                {reviews.map((r) => (
                  <li key={r.id} className="border-t border-current/20 py-5 last:border-b">
                    <p className="t-eyebrow text-[11px]">
                      {"★".repeat(r.rating)}
                      <span className="text-current/30">{"★".repeat(5 - r.rating)}</span> · {r.user.name} · {r.createdAt.toLocaleDateString()}
                    </p>
                    <p className="t-body mt-2 max-w-2xl whitespace-pre-line text-sm">{r.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <p className="text-sm text-current/60">
        Need help? <Link href="/contact" className="underline">Contact the team</Link>.
      </p>
    </div>
  );
}
