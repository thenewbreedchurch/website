import Link from "next/link";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable, DataTableHead, DataTableBody, Th, Td, EmptyRow, Pagination } from "@/components/admin/data-table";
import { DeleteRowButton } from "@/components/admin/delete-button";
import { deleteSermonAction } from "@/actions/admin/sermons";

const PAGE_SIZE = 20;

export default async function AdminSermonsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const { page } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);

  const [sermons, total] = await Promise.all([
    prisma.sermon.findMany({
      orderBy: { publishedAt: "desc" },
      take: PAGE_SIZE,
      skip: (pageNum - 1) * PAGE_SIZE,
    }),
    prisma.sermon.count(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Sermons" newHref="/admin/sermons/new" />
      <DataTable>
        <DataTableHead>
          <Th>Title</Th>
          <Th>Speaker</Th>
          <Th>Published</Th>
          <Th className="text-right">Actions</Th>
        </DataTableHead>
        <DataTableBody>
          {sermons.length === 0 && <EmptyRow colSpan={4}>No sermons yet.</EmptyRow>}
          {sermons.map((s) => (
            <tr key={s.id}>
              <Td className="font-medium">{s.title}</Td>
              <Td>{s.speaker}</Td>
              <Td>{s.publishedAt.toLocaleDateString()}</Td>
              <Td className="text-right">
                <div className="flex justify-end gap-3">
                  <Link href={`/admin/sermons/${s.id}`} className="text-xs font-medium text-brand-700 hover:underline">
                    Edit
                  </Link>
                  <DeleteRowButton id={s.id} action={deleteSermonAction} />
                </div>
              </Td>
            </tr>
          ))}
        </DataTableBody>
      </DataTable>
      <Pagination page={pageNum} totalPages={Math.ceil(total / PAGE_SIZE)} basePath="/admin/sermons" />
    </div>
  );
}
