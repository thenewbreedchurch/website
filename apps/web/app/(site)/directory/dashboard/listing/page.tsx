import { prisma } from "@nb-church/db";
import { requireDirectoryUser } from "@/lib/directory-session";
import { VendorForm } from "@/components/directory/vendor-form";
import { saveOwnListingAction } from "@/actions/directory-vendor";
import { uploadVendorImageAction } from "@/actions/directory-upload";
import { ResendVerificationButton } from "@/components/directory/auth-forms";
import { VENDOR_STATUS_LABELS } from "@/lib/directory";

export default async function ListingPage() {
  const user = await requireDirectoryUser("/directory/dashboard/listing");
  const [vendor, categories] = await Promise.all([
    prisma.vendor.findFirst({ where: { ownerId: user.id } }),
    prisma.vendorCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true, subcategories: true } }),
  ]);

  return (
    <div className="space-y-8">
      {!user.emailVerifiedAt && (
        <div role="status" className="border border-brand-600 bg-brand-50 p-5 text-sm text-brand-900 dark:bg-white/5 dark:text-white">
          Please verify your email before submitting a listing. <ResendVerificationButton />
        </div>
      )}
      <div>
        <h2 className="font-display text-3xl font-bold uppercase leading-none tracking-tight">{vendor ? "Edit your listing" : "Create your listing"}</h2>
        {vendor && (
          <p className="t-eyebrow mt-3 text-[11px] text-current/60">
            Status: {VENDOR_STATUS_LABELS[vendor.status]}
            {vendor.status === "APPROVED" ? " — changes go live immediately." : ""}
          </p>
        )}
        {!vendor && <p className="t-body mt-3 max-w-xl text-sm text-current/70">Fill this in and submit it. A member of the team reviews every listing before it goes live.</p>}
      </div>
      <VendorForm
        variant="owner"
        categories={categories}
        vendor={vendor ?? undefined}
        action={saveOwnListingAction}
        upload={uploadVendorImageAction}
        submitLabel={vendor ? "Save changes" : "Submit for review"}
      />
    </div>
  );
}
