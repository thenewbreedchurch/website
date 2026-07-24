import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StaffMemberForm } from "@/components/admin/staff-member-form";
import { createStaffMemberAction } from "@/actions/admin/staff";

export default async function NewStaffMemberPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Add Leader"
        breadcrumbs={[{ label: "Staff / Leadership", href: "/admin/staff" }, { label: "New" }]}
      />
      <StaffMemberForm action={createStaffMemberAction} />
    </div>
  );
}
