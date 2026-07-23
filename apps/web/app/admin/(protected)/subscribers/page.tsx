import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable, DataTableHead, DataTableBody, Th, Td, EmptyRow, Pagination } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";

const PAGE_SIZE = 30;

export default async function AdminSubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const { page } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);

  const [subscribers, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: "desc" },
      take: PAGE_SIZE,
      skip: (pageNum - 1) * PAGE_SIZE,
    }),
    prisma.newsletterSubscriber.count(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Newsletter Subscribers"
        description={`${total} total`}
        newHref="/admin/subscribers/export"
        newLabel="Export CSV"
      />
      <DataTable>
        <DataTableHead>
          <Th>Email</Th>
          <Th>Name</Th>
          <Th>Status</Th>
          <Th>Subscribed</Th>
        </DataTableHead>
        <DataTableBody>
          {subscribers.length === 0 && <EmptyRow colSpan={4}>No subscribers yet.</EmptyRow>}
          {subscribers.map((s) => (
            <tr key={s.id}>
              <Td className="font-medium">{s.email}</Td>
              <Td>{s.name ?? "—"}</Td>
              <Td>
                <Badge tone={s.status === "ACTIVE" ? "green" : "neutral"}>{s.status}</Badge>
              </Td>
              <Td>{s.subscribedAt.toLocaleDateString()}</Td>
            </tr>
          ))}
        </DataTableBody>
      </DataTable>
      <Pagination page={pageNum} totalPages={Math.ceil(total / PAGE_SIZE)} basePath="/admin/subscribers" />
    </div>
  );
}
