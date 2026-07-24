import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable, DataTableHead, DataTableBody, Th, Td, EmptyRow, Pagination } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { StatusSelect } from "@/components/admin/status-select";
import { setNewConvertInquiryStatusAction } from "@/actions/admin/new-convert-inquiries";
import type { NewConvertInterest } from "@nb-church/db";

const PAGE_SIZE = 25;
const INTEREST_LABELS: Record<NewConvertInterest, string> = {
  BAPTISM: "Baptism",
  BIBLE_STUDY: "Bible Study",
  MEET_LEADER: "Meet a Leader",
  SERVING: "Serving",
  OTHER: "Other",
};

export default async function AdminNewConvertInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const { page } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);

  const [inquiries, total] = await Promise.all([
    prisma.newConvertInquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (pageNum - 1) * PAGE_SIZE,
    }),
    prisma.newConvertInquiry.count(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="New Convert Inquiries"
        description={`${total} total — submissions from the New Converts page's "Tell Us You're Here" form.`}
        newHref="/admin/new-convert-inquiries/export"
        newLabel="Export CSV"
      />
      <DataTable>
        <DataTableHead>
          <Th>From</Th>
          <Th>Interested In</Th>
          <Th>Message</Th>
          <Th>Status</Th>
          <Th>Received</Th>
        </DataTableHead>
        <DataTableBody>
          {inquiries.length === 0 && <EmptyRow colSpan={5}>No inquiries yet.</EmptyRow>}
          {inquiries.map((inq) => (
            <tr key={inq.id}>
              <Td>
                <div className="font-medium">{inq.name}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">{inq.email}</div>
                {inq.phone && <div className="text-xs text-neutral-500 dark:text-neutral-400">{inq.phone}</div>}
              </Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {inq.interests.map((i) => (
                    <Badge key={i} tone="brand">
                      {INTEREST_LABELS[i]}
                    </Badge>
                  ))}
                </div>
              </Td>
              <Td className="max-w-xs truncate">{inq.message ?? "—"}</Td>
              <Td>
                <StatusSelect id={inq.id} status={inq.status} action={setNewConvertInquiryStatusAction} />
              </Td>
              <Td>{inq.createdAt.toLocaleDateString()}</Td>
            </tr>
          ))}
        </DataTableBody>
      </DataTable>
      <Pagination page={pageNum} totalPages={Math.ceil(total / PAGE_SIZE)} basePath="/admin/new-convert-inquiries" />
    </div>
  );
}
