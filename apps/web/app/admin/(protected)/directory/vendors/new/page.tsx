import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { VendorForm } from "@/components/directory/vendor-form";
import { createVendorAction } from "@/actions/admin/vendors";
import { uploadImageAction } from "@/actions/admin/upload";

export default async function NewVendorPage() {
  await requireAdmin();
  const categories = await prisma.vendorCategory.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, subcategories: true },
  });
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Add Business"
        breadcrumbs={[{ label: "Businesses", href: "/admin/directory/vendors" }, { label: "New" }]}
      />
      <VendorForm variant="admin" categories={categories} action={createVendorAction} upload={uploadImageAction} submitLabel="Create listing" />
    </div>
  );
}
