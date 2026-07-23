import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ServiceTimeForm } from "@/components/admin/service-time-form";
import { createServiceTimeAction } from "@/actions/admin/settings";

export default async function NewServiceTimePage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <AdminPageHeader title="New Service Time" />
      <ServiceTimeForm action={createServiceTimeAction} />
    </div>
  );
}
