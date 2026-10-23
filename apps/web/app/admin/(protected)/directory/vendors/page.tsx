import Link from "next/link";
import { prisma, type Prisma, type VendorStatus } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable, DataTableHead, DataTableBody, Th, Td, EmptyRow, Pagination } from "@/components/admin/data-table";
import { DeleteRowButton } from "@/components/admin/delete-button";
import { VendorFlagToggle, VendorStatusSelect } from "@/components/admin/vendor-controls";
import { deleteVendorAction, setVendorStatusAction, toggleVendorFlagAction } from "@/actions/admin/vendors";
import { VENDOR_STATUS_LABELS } from "@/lib/directory";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 25;

export default async function AdminVendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>;
}) {
  await requireAdmin();
  const { page, status, q } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);
  const statusFilter = status && status in VENDOR_STATUS_LABELS ? (status as VendorStatus) : undefined;
  const query = q?.trim().slice(0, 80);

  const where: Prisma.VendorWhereInput = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(query
      ? {
          OR: [
            { businessName: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { owner: { email: { contains: query, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [vendors, total, pendingCount] = await Promise.all([
    prisma.vendor.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: PAGE_SIZE,
      skip: (pageNum - 1) * PAGE_SIZE,
      include: { category: { select: { name: true } }, owner: { select: { email: true } } },
    }),
    prisma.vendor.count({ where }),
    prisma.vendor.count({ where: { status: "PENDING" } }),
  ]);

  const tabs: { label: string; value?: VendorStatus }[] = [
    { label: "All" },
    ...(Object.keys(VENDOR_STATUS_LABELS) as VendorStatus[]).map((v) => ({ label: VENDOR_STATUS_LABELS[v], value: v })),
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Directory · Businesses"
        description={`${total} listing${total === 1 ? "" : "s"}${pendingCount ? ` — ${pendingCount} waiting for review` : ""}`}
        newHref="/admin/directory/vendors/new"
        newLabel="Add Business"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-2" aria-label="Filter by status">
          {tabs.map((t) => {
            const active = t.value === statusFilter;
            const qs = new URLSearchParams();
            if (t.value) qs.set("status", t.value);
            if (query) qs.set("q", query);
            return (
              <Link
                key={t.label}
                href={`/admin/directory/vendors${qs.toString() ? `?${qs}` : ""}`}
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
        <form className="flex gap-2">
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          <input
            name="q"
            defaultValue={query}
            placeholder="Search name or email…"
            className="h-9 w-56 rounded-none border border-neutral-300 bg-white px-3 text-sm admin-dark:border-neutral-700 admin-dark:bg-neutral-900"
          />
          <button type="submit" className="t-eyebrow h-9 border border-neutral-300 px-3 admin-dark:border-neutral-700">
            Search
          </button>
        </form>
      </div>

      <DataTable>
        <DataTableHead>
          <Th>Business</Th>
          <Th>Owner</Th>
          <Th>Status</Th>
          <Th>Flags</Th>
          <Th>Views / taps</Th>
          <Th className="text-right">Actions</Th>
        </DataTableHead>
        <DataTableBody>
          {vendors.length === 0 && <EmptyRow colSpan={6}>No businesses match.</EmptyRow>}
          {vendors.map((v) => (
            <tr key={v.id}>
              <Td>
                <Link href={`/admin/directory/vendors/${v.id}`} className="font-medium text-brand-700 hover:underline admin-dark:text-brand-300">
                  {v.businessName}
                </Link>
                <div className="text-xs text-neutral-500 admin-dark:text-neutral-400">
                  {v.category.name} · {v.location}
                </div>
              </Td>
              <Td className="text-xs">{v.owner?.email ?? <span className="text-neutral-400">Unclaimed</span>}</Td>
              <Td>
                <VendorStatusSelect id={v.id} status={v.status} action={setVendorStatusAction} />
              </Td>
              <Td>
                <div className="flex gap-1.5">
                  <VendorFlagToggle id={v.id} flag="isVerified" value={v.isVerified} label="Verified" action={toggleVendorFlagAction} />
                  <VendorFlagToggle id={v.id} flag="isFeatured" value={v.isFeatured} label="Featured" action={toggleVendorFlagAction} />
                </div>
              </Td>
              <Td className="text-xs">
                {v.viewsCount} / {v.contactClicksCount}
              </Td>
              <Td className="text-right">
                <div className="flex justify-end gap-3">
                  {v.status === "APPROVED" && (
                    <Link href={`/directory/${v.slug}`} target="_blank" className="text-xs font-medium text-brand-700 hover:underline admin-dark:text-brand-300">
                      View
                    </Link>
                  )}
                  <Link href={`/admin/directory/vendors/${v.id}`} className="text-xs font-medium text-brand-700 hover:underline admin-dark:text-brand-300">
                    Edit
                  </Link>
                  <DeleteRowButton id={v.id} action={deleteVendorAction} confirmMessage={`Delete ${v.businessName} and all its reviews, reports and images?`} />
                </div>
              </Td>
            </tr>
          ))}
        </DataTableBody>
      </DataTable>
      <Pagination page={pageNum} totalPages={Math.ceil(total / PAGE_SIZE)} basePath="/admin/directory/vendors" />
    </div>
  );
}
