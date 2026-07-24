import { notFound } from "next/navigation";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable, DataTableHead, DataTableBody, Th, Td, EmptyRow } from "@/components/admin/data-table";

const EXPORT_LIMIT = 5000;

export default async function AnnouncementRegistrationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) notFound();

  const registrations = await prisma.eventRegistration.findMany({
    where: { announcementId: id },
    orderBy: { createdAt: "desc" },
    take: EXPORT_LIMIT,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Registrations — ${announcement.title}`}
        description={`${registrations.length} registered`}
        newHref={`/admin/announcements/${id}/registrations/export`}
        newLabel="Export CSV"
        breadcrumbs={[
          { label: "Announcements", href: "/admin/announcements" },
          { label: announcement.title, href: `/admin/announcements/${id}` },
          { label: "Registrations" },
        ]}
      />
      <DataTable>
        <DataTableHead>
          <Th>Name</Th>
          <Th>Email</Th>
          <Th>Phone</Th>
          <Th>Guests</Th>
          <Th>Registered</Th>
        </DataTableHead>
        <DataTableBody>
          {registrations.length === 0 && <EmptyRow colSpan={5}>No registrations yet.</EmptyRow>}
          {registrations.map((r) => (
            <tr key={r.id}>
              <Td>{r.name}</Td>
              <Td>{r.email}</Td>
              <Td>{r.phone ?? "—"}</Td>
              <Td>{r.guestsCount}</Td>
              <Td>{r.createdAt.toLocaleDateString()}</Td>
            </tr>
          ))}
        </DataTableBody>
      </DataTable>
    </div>
  );
}
