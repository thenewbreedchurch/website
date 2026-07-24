import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable, DataTableHead, DataTableBody, Th, Td, EmptyRow, Pagination } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { StatusSelect } from "@/components/admin/status-select";
import { setContactMessageStatusAction } from "@/actions/admin/contact-messages";
import type { ContactCategory } from "@nb-church/db";

const PAGE_SIZE = 25;
const CATEGORY_LABELS: Record<ContactCategory, string> = {
  GENERAL: "General",
  PRAYER: "Prayer",
  MEMBERSHIP: "Membership",
  WELFARE: "Welfare",
};
const CATEGORY_TONE: Record<ContactCategory, "neutral" | "brand" | "green" | "amber"> = {
  GENERAL: "neutral",
  PRAYER: "brand",
  MEMBERSHIP: "green",
  WELFARE: "amber",
};

export default async function AdminContactMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const { page } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);

  const [messages, total] = await Promise.all([
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (pageNum - 1) * PAGE_SIZE,
    }),
    prisma.contactMessage.count(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Contact Messages"
        description={`${total} total`}
        newHref="/admin/contact-messages/export"
        newLabel="Export CSV"
      />
      <DataTable>
        <DataTableHead>
          <Th>From</Th>
          <Th>Category</Th>
          <Th>Subject</Th>
          <Th>Message</Th>
          <Th>Status</Th>
          <Th>Received</Th>
        </DataTableHead>
        <DataTableBody>
          {messages.length === 0 && <EmptyRow colSpan={6}>No messages yet.</EmptyRow>}
          {messages.map((m) => (
            <tr key={m.id}>
              <Td>
                <div className="font-medium">{m.name}</div>
                <div className="text-xs text-neutral-500">{m.email}</div>
              </Td>
              <Td>
                <Badge tone={CATEGORY_TONE[m.category]}>{CATEGORY_LABELS[m.category]}</Badge>
              </Td>
              <Td>{m.subject}</Td>
              <Td className="max-w-xs truncate">{m.message}</Td>
              <Td>
                <StatusSelect id={m.id} status={m.status} action={setContactMessageStatusAction} />
              </Td>
              <Td>{m.createdAt.toLocaleDateString()}</Td>
            </tr>
          ))}
        </DataTableBody>
      </DataTable>
      <Pagination page={pageNum} totalPages={Math.ceil(total / PAGE_SIZE)} basePath="/admin/contact-messages" />
    </div>
  );
}
