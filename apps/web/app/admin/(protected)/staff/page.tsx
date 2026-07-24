import Link from "next/link";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable, DataTableHead, DataTableBody, Th, Td, EmptyRow } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { DeleteRowButton } from "@/components/admin/delete-button";
import { deleteStaffMemberAction } from "@/actions/admin/staff";

export default async function AdminStaffPage() {
  await requireAdmin();
  const staff = await prisma.staffMember.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Staff / Leadership"
        description="Powers the About page's leadership section and the public /leadership directory."
        newHref="/admin/staff/new"
        newLabel="Add Leader"
      />
      <DataTable>
        <DataTableHead>
          <Th>Name</Th>
          <Th>Role</Th>
          <Th>Department</Th>
          <Th>Contact</Th>
          <Th>Status</Th>
          <Th className="text-right">Actions</Th>
        </DataTableHead>
        <DataTableBody>
          {staff.length === 0 && <EmptyRow colSpan={6}>No leaders yet.</EmptyRow>}
          {staff.map((s) => (
            <tr key={s.id}>
              <Td className="font-medium">{s.name}</Td>
              <Td>{s.role}</Td>
              <Td>{s.department ?? <span className="text-neutral-400">—</span>}</Td>
              <Td>
                {s.email || s.phone ? (
                  <div className="text-xs text-neutral-500">
                    {s.email && <div>{s.email}</div>}
                    {s.phone && <div>{s.phone}</div>}
                  </div>
                ) : (
                  <span className="text-neutral-400">—</span>
                )}
              </Td>
              <Td>
                <Badge tone={s.isActive ? "green" : "neutral"}>{s.isActive ? "Active" : "Inactive"}</Badge>
              </Td>
              <Td className="text-right">
                <div className="flex justify-end gap-3">
                  <Link href={`/admin/staff/${s.id}`} className="text-xs font-medium text-brand-700 hover:underline">
                    Edit
                  </Link>
                  <DeleteRowButton id={s.id} action={deleteStaffMemberAction} />
                </div>
              </Td>
            </tr>
          ))}
        </DataTableBody>
      </DataTable>
    </div>
  );
}
