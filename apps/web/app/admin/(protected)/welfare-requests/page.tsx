import Link from "next/link";
import { prisma } from "@nb-church/db";
import type { WelfareStatus } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable, DataTableHead, DataTableBody, Th, Td, EmptyRow, Pagination } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { WelfareStatusSelect } from "@/components/admin/welfare-status-select";
import { setWelfareStatusAction } from "@/actions/admin/welfare-requests";
import { WELFARE_STATUS_LABELS, describeSupport } from "@/lib/welfare";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 25;
const STATUS_TONE: Record<WelfareStatus, "amber" | "brand" | "green" | "neutral"> = {
  NEW: "amber",
  IN_REVIEW: "brand",
  ASSISTED: "green",
  CLOSED: "neutral",
};

export default async function AdminWelfareRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  await requireAdmin();
  const { page, status } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);
  const statusFilter = status && status in WELFARE_STATUS_LABELS ? (status as WelfareStatus) : undefined;
  const where = statusFilter ? { status: statusFilter } : {};

  const [requests, total] = await Promise.all([
    prisma.welfareRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (pageNum - 1) * PAGE_SIZE,
    }),
    prisma.welfareRequest.count({ where }),
  ]);

  const tabs: { label: string; value?: WelfareStatus }[] = [
    { label: "All" },
    ...(Object.keys(WELFARE_STATUS_LABELS) as WelfareStatus[]).map((v) => ({ label: WELFARE_STATUS_LABELS[v], value: v })),
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Welfare Requests"
        description={`${total} ${statusFilter ? WELFARE_STATUS_LABELS[statusFilter].toLowerCase() : "total"} — confidential. Submissions from the welfare form on the Contact page.`}
        newHref="/admin/welfare-requests/export"
        newLabel="Export CSV"
      />

      <nav className="flex flex-wrap gap-2" aria-label="Filter by status">
        {tabs.map((t) => {
          const active = t.value === statusFilter;
          return (
            <Link
              key={t.label}
              href={t.value ? `/admin/welfare-requests?status=${t.value}` : "/admin/welfare-requests"}
              className={cn(
                "t-eyebrow border px-3 py-2",
                active
                  ? "border-brand-700 bg-brand-700 text-white"
                  : "border-neutral-300 text-neutral-600 hover:border-brand-500 admin-dark:border-neutral-700 admin-dark:text-neutral-300"
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      <DataTable>
        <DataTableHead>
          <Th>Applicant</Th>
          <Th>Support</Th>
          <Th>Request</Th>
          <Th>Status</Th>
          <Th>Received</Th>
        </DataTableHead>
        <DataTableBody>
          {requests.length === 0 && <EmptyRow colSpan={5}>No welfare requests.</EmptyRow>}
          {requests.map((r) => (
            <tr key={r.id}>
              <Td>
                <Link href={`/admin/welfare-requests/${r.id}`} className="font-medium text-brand-700 hover:underline admin-dark:text-brand-300">
                  {r.fullName}
                </Link>
                <div className="text-xs text-neutral-500 admin-dark:text-neutral-400">{r.phone}</div>
              </Td>
              <Td>
                <Badge tone={STATUS_TONE[r.status]}>{describeSupport(r.supportType, r.supportOther)}</Badge>
              </Td>
              <Td className="max-w-xs truncate">{r.specificRequest}</Td>
              <Td>
                <WelfareStatusSelect id={r.id} status={r.status} action={setWelfareStatusAction} />
              </Td>
              <Td>{r.createdAt.toLocaleDateString()}</Td>
            </tr>
          ))}
        </DataTableBody>
      </DataTable>
      <Pagination page={pageNum} totalPages={Math.ceil(total / PAGE_SIZE)} basePath="/admin/welfare-requests" />
    </div>
  );
}
