import Link from "next/link";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable, DataTableHead, DataTableBody, Th, Td, EmptyRow } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { DeleteRowButton } from "@/components/admin/delete-button";
import { deleteServiceTimeAction } from "@/actions/admin/settings";

export default async function ServiceTimesPage() {
  await requireAdmin();
  const serviceTimes = await prisma.serviceTime.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Service Times"
        description="The fixed weekly rhythm shown in the footer, on First Timers, and in the Announcements this-week strip."
        newHref="/admin/service-times/new"
      />
      <DataTable>
        <DataTableHead>
          <Th>Day</Th>
          <Th>Label</Th>
          <Th>Time</Th>
          <Th>Online</Th>
          <Th>Status</Th>
          <Th className="text-right">Actions</Th>
        </DataTableHead>
        <DataTableBody>
          {serviceTimes.length === 0 && <EmptyRow colSpan={6}>No service times yet.</EmptyRow>}
          {serviceTimes.map((st) => (
            <tr key={st.id}>
              <Td>{st.dayOfWeek}</Td>
              <Td>{st.label}</Td>
              <Td>
                {st.startTime}
                {st.endTime ? ` - ${st.endTime}` : ""}
              </Td>
              <Td>{st.isOnline ? "Yes" : "No"}</Td>
              <Td>
                <Badge tone={st.isActive ? "green" : "neutral"}>
                  {st.isActive ? "Active" : "Inactive"}
                </Badge>
              </Td>
              <Td className="text-right">
                <div className="flex justify-end gap-3">
                  <Link
                    href={`/admin/service-times/${st.id}`}
                    className="text-xs font-medium text-brand-700 hover:underline admin-dark:text-brand-300"
                  >
                    Edit
                  </Link>
                  <DeleteRowButton id={st.id} action={deleteServiceTimeAction} />
                </div>
              </Td>
            </tr>
          ))}
        </DataTableBody>
      </DataTable>
    </div>
  );
}
