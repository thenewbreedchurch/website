import { notFound } from "next/navigation";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { VendorForm } from "@/components/directory/vendor-form";
import { updateVendorAction } from "@/actions/admin/vendors";
import { uploadImageAction } from "@/actions/admin/upload";

export default async function EditVendorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [vendor, categories] = await Promise.all([
    prisma.vendor.findUnique({ where: { id }, include: { owner: { select: { email: true } } } }),
    prisma.vendorCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true, subcategories: true } }),
  ]);
  if (!vendor) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={vendor.businessName}
        description={`${vendor.viewsCount} profile views · ${vendor.contactClicksCount} contact taps · ${vendor.ratingCount} reviews`}
        breadcrumbs={[{ label: "Businesses", href: "/admin/directory/vendors" }, { label: vendor.businessName }]}
      />
      <VendorForm key={id} variant="admin" categories={categories} vendor={vendor} action={updateVendorAction.bind(null, id)} upload={uploadImageAction} />
    </div>
  );
}
