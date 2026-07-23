import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TestimonyForm } from "@/components/admin/testimony-form";
import { createTestimonyAction } from "@/actions/admin/testimonies";

export default async function NewTestimonyPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <AdminPageHeader title="New Testimony" />
      <TestimonyForm action={createTestimonyAction} />
    </div>
  );
}
