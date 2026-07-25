import Link from "next/link";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable, DataTableHead, DataTableBody, Th, Td, EmptyRow } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { DeleteRowButton } from "@/components/admin/delete-button";
import { deleteNextStepAction } from "@/actions/admin/next-steps";

export default async function AdminNextStepsPage() {
  await requireAdmin();
  const steps = await prisma.nextStep.findMany({ orderBy: [{ page: "asc" }, { sortOrder: "asc" }] });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Next Steps"
        description="Cards shown on the First Timers and New Converts pages."
        newHref="/admin/next-steps/new"
      />
      <DataTable>
        <DataTableHead>
          <Th>Page</Th>
          <Th>Title</Th>
          <Th>Status</Th>
          <Th className="text-right">Actions</Th>
        </DataTableHead>
        <DataTableBody>
          {steps.length === 0 && <EmptyRow colSpan={4}>No next steps yet.</EmptyRow>}
          {steps.map((s) => (
            <tr key={s.id}>
              <Td>{s.page === "FIRST_TIMER" ? "First Timers" : "New Converts"}</Td>
              <Td className="font-medium">{s.title}</Td>
              <Td>
                <Badge tone={s.isActive ? "green" : "neutral"}>{s.isActive ? "Active" : "Inactive"}</Badge>
              </Td>
              <Td className="text-right">
                <div className="flex justify-end gap-3">
                  <Link href={`/admin/next-steps/${s.id}`} className="text-xs font-medium text-brand-700 hover:underline admin-dark:text-brand-300">
                    Edit
                  </Link>
                  <DeleteRowButton id={s.id} action={deleteNextStepAction} />
                </div>
              </Td>
            </tr>
          ))}
        </DataTableBody>
      </DataTable>
    </div>
  );
}
