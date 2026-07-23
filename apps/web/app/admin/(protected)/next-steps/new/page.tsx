import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { NextStepForm } from "@/components/admin/next-step-form";
import { createNextStepAction } from "@/actions/admin/next-steps";

export default async function NewNextStepPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <AdminPageHeader title="New Next Step" />
      <NextStepForm action={createNextStepAction} />
    </div>
  );
}
