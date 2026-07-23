import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { GivingAccountForm } from "@/components/admin/giving-account-form";
import { createGivingAccountAction } from "@/actions/admin/giving-accounts";

export default async function NewGivingAccountPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <AdminPageHeader title="New Giving Account" />
      <GivingAccountForm action={createGivingAccountAction} />
    </div>
  );
}
