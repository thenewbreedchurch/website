import Link from "next/link";
import { prisma } from "@nb-church/db";
import type { ReviewStatus } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable, DataTableHead, DataTableBody, Th, Td, EmptyRow, Pagination } from "@/components/admin/data-table";
import { DeleteRowButton } from "@/components/admin/delete-button";
import { StatusSelectGeneric } from "@/components/admin/moderation-controls";
import { deleteReviewAction, setReviewStatusAction } from "@/actions/admin/directory-moderation";

const PAGE_SIZE = 25;
const OPTIONS: { value: ReviewStatus; label: string }[] = [
  { value: "PUBLISHED", label: "Published" },
  { value: "HIDDEN", label: "Hidden" },
];

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdmin();
  const pageNum = Math.max(1, Number((await searchParams).page) || 1);
  const [reviews, total] = await Promise.all([
    prisma.vendorReview.findMany({
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (pageNum - 1) * PAGE_SIZE,
      include: { vendor: { select: { id: true, businessName: true } }, user: { select: { name: true, email: true } } },
    }),
    prisma.vendorReview.count(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Directory · Reviews" description={`${total} total. Hide anything abusive or off-topic — it disappears from the public profile and the rating is recalculated.`} />
      <DataTable>
        <DataTableHead>
          <Th>Business</Th>
          <Th>Reviewer</Th>
          <Th>Rating</Th>
          <Th>Review</Th>
          <Th>Status</Th>
          <Th className="text-right">Actions</Th>
        </DataTableHead>
        <DataTableBody>
          {reviews.length === 0 && <EmptyRow colSpan={6}>No reviews yet.</EmptyRow>}
          {reviews.map((r) => (
            <tr key={r.id}>
              <Td>
                <Link href={`/admin/directory/vendors/${r.vendor.id}`} className="font-medium text-brand-700 hover:underline admin-dark:text-brand-300">
                  {r.vendor.businessName}
                </Link>
              </Td>
              <Td>
                <div>{r.user.name}</div>
                <div className="text-xs text-neutral-500 admin-dark:text-neutral-400">{r.user.email}</div>
              </Td>
              <Td>{"★".repeat(r.rating)}</Td>
              <Td className="max-w-sm whitespace-pre-line text-xs">{r.body}</Td>
              <Td>
                <StatusSelectGeneric id={r.id} status={r.status} options={OPTIONS} action={setReviewStatusAction} label="Review status" />
              </Td>
              <Td className="text-right">
                <DeleteRowButton id={r.id} action={deleteReviewAction} confirmMessage="Permanently delete this review?" />
              </Td>
            </tr>
          ))}
        </DataTableBody>
      </DataTable>
      <Pagination page={pageNum} totalPages={Math.ceil(total / PAGE_SIZE)} basePath="/admin/directory/reviews" />
    </div>
  );
}
