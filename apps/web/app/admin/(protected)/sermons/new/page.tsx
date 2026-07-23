import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SermonForm } from "@/components/admin/sermon-form";
import { createSermonAction } from "@/actions/admin/sermons";

export default async function NewSermonPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <AdminPageHeader title="New Sermon" />
      <SermonForm action={createSermonAction} />
    </div>
  );
}
