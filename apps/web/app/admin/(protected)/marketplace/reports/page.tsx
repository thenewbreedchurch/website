import Link from "next/link";
import { prisma } from "@nb-church/db";
import type { ReportStatus } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable, DataTableHead, DataTableBody, Th, Td, EmptyRow, Pagination } from "@/components/admin/data-table";
import { DeleteRowButton } from "@/components/admin/delete-button";
import { StatusSelectGeneric } from "@/components/admin/moderation-controls";
import { deleteReportAction, setReportStatusAction } from "@/actions/admin/directory-moderation";
import { REPORT_REASON_LABELS } from "@/lib/directory";

const PAGE_SIZE = 25;
const OPTIONS: { value: ReportStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "REVIEWED", label: "Reviewed" },
  { value: "ACTIONED", label: "Actioned" },
];

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdmin();
  const pageNum = Math.max(1, Number((await searchParams).page) || 1);
  const [reports, total] = await Promise.all([
    prisma.vendorReport.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: PAGE_SIZE,
      skip: (pageNum - 1) * PAGE_SIZE,
      include: { vendor: { select: { id: true, businessName: true, status: true } } },
    }),
    prisma.vendorReport.count(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Marketplace · Reports" description={`${total} total. Reports submitted with “Report this business” on a profile.`} />
      <DataTable>
        <DataTableHead>
          <Th>Business</Th>
          <Th>Reason</Th>
          <Th>Details</Th>
          <Th>Reporter</Th>
          <Th>Status</Th>
          <Th>Received</Th>
          <Th className="text-right">Actions</Th>
        </DataTableHead>
        <DataTableBody>
          {reports.length === 0 && <EmptyRow colSpan={7}>No reports.</EmptyRow>}
          {reports.map((r) => (
            <tr key={r.id}>
              <Td>
                <Link href={`/admin/marketplace/vendors/${r.vendor.id}`} className="font-medium text-brand-700 hover:underline admin-dark:text-brand-300">
                  {r.vendor.businessName}
                </Link>
              </Td>
              <Td>{REPORT_REASON_LABELS[r.reason]}</Td>
              <Td className="max-w-xs whitespace-pre-line text-xs">{r.details ?? "—"}</Td>
              <Td className="text-xs">{r.reporterEmail ?? "Anonymous"}</Td>
              <Td>
                <StatusSelectGeneric id={r.id} status={r.status} options={OPTIONS} action={setReportStatusAction} label="Report status" />
              </Td>
              <Td>{r.createdAt.toLocaleDateString()}</Td>
              <Td className="text-right">
                <DeleteRowButton id={r.id} action={deleteReportAction} confirmMessage="Delete this report?" />
              </Td>
            </tr>
          ))}
        </DataTableBody>
      </DataTable>
      <Pagination page={pageNum} totalPages={Math.ceil(total / PAGE_SIZE)} basePath="/admin/marketplace/reports" />
    </div>
  );
}
