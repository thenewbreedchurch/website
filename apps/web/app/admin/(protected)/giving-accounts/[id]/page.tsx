import { notFound } from "next/navigation";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { GivingAccountForm } from "@/components/admin/giving-account-form";
import { updateGivingAccountAction } from "@/actions/admin/giving-accounts";

export default async function EditGivingAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const account = await prisma.givingAccount.findUnique({ where: { id } });
  if (!account) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Edit Giving Account" />
      <GivingAccountForm account={account} action={updateGivingAccountAction.bind(null, id)} />
    </div>
  );
}
