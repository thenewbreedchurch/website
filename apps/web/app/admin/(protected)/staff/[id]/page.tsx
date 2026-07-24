import { notFound } from "next/navigation";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StaffMemberForm } from "@/components/admin/staff-member-form";
import { updateStaffMemberAction } from "@/actions/admin/staff";

export default async function EditStaffMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const staffMember = await prisma.staffMember.findUnique({ where: { id } });
  if (!staffMember) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Edit Leader" />
      <StaffMemberForm staffMember={staffMember} action={updateStaffMemberAction.bind(null, id)} />
    </div>
  );
}
