import Link from "next/link";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  DataTable,
  DataTableHead,
  DataTableBody,
  Th,
  Td,
  EmptyRow,
  Pagination,
} from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { DeleteRowButton } from "@/components/admin/delete-button";
import { deleteAnnouncementAction } from "@/actions/admin/announcements";
import { CHURCH_TZ } from "@/lib/announcements";

const PAGE_SIZE = 20;
const dateFmt = new Intl.DateTimeFormat("en-NG", { timeZone: CHURCH_TZ, dateStyle: "medium", timeStyle: "short" });

const STATUS_TONE = { PUBLISHED: "green", DRAFT: "amber", CANCELLED: "red" } as const;

export default async function AdminAnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const { page } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      orderBy: { startDateTime: "desc" },
      take: PAGE_SIZE,
      skip: (pageNum - 1) * PAGE_SIZE,
      include: { _count: { select: { registrations: true } } },
    }),
    prisma.announcement.count(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Announcements"
        description="Powers the This Week strip and Upcoming grid on /announcements."
        newHref="/admin/announcements/new"
      />
      <DataTable>
        <DataTableHead>
          <Th>Title</Th>
          <Th>Category</Th>
          <Th>Starts</Th>
          <Th>Status</Th>
          <Th>Registrations</Th>
          <Th className="text-right">Actions</Th>
        </DataTableHead>
        <DataTableBody>
          {announcements.length === 0 && <EmptyRow colSpan={6}>No announcements yet.</EmptyRow>}
          {announcements.map((a) => (
            <tr key={a.id}>
              <Td className="font-medium">{a.title}</Td>
              <Td>{a.category}</Td>
              <Td>{dateFmt.format(a.startDateTime)}</Td>
              <Td>
                <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge>
              </Td>
              <Td>
                {a.registrationRequired ? (
                  <Link href={`/admin/announcements/${a.id}/registrations`} className="text-brand-700 hover:underline">
                    {a._count.registrations}
                  </Link>
                ) : (
                  <span className="text-neutral-400">—</span>
                )}
              </Td>
              <Td className="text-right">
                <div className="flex justify-end gap-3">
                  <Link href={`/admin/announcements/${a.id}`} className="text-xs font-medium text-brand-700 hover:underline">
                    Edit
                  </Link>
                  <DeleteRowButton id={a.id} action={deleteAnnouncementAction} />
                </div>
              </Td>
            </tr>
          ))}
        </DataTableBody>
      </DataTable>
      <Pagination page={pageNum} totalPages={Math.ceil(total / PAGE_SIZE)} basePath="/admin/announcements" />
    </div>
  );
}
