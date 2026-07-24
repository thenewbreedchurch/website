import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable, DataTableHead, DataTableBody, Th, Td, EmptyRow, Pagination } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { ToggleRowButton } from "@/components/admin/toggle-row-button";
import { advanceContactMessageStatusAction } from "@/actions/admin/contact-messages";
import type { ContactCategory, ContactStatus } from "@nb-church/db";

const PAGE_SIZE = 25;
const STATUS_TONE: Record<ContactStatus, "amber" | "brand" | "green"> = {
  NEW: "amber",
  READ: "brand",
  RESPONDED: "green",
};
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
      <AdminPageHeader title="Contact Messages" description={`${total} total`} />
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
                <ToggleRowButton
                  id={m.id}
                  action={advanceContactMessageStatusAction}
                  label={<Badge tone={STATUS_TONE[m.status]}>{m.status} — click to advance</Badge>}
                />
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
