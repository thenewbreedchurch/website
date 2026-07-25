import Link from "next/link";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable, DataTableHead, DataTableBody, Th, Td, EmptyRow } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { DeleteRowButton } from "@/components/admin/delete-button";
import { ToggleRowButton } from "@/components/admin/toggle-row-button";
import { deleteTestimonyAction, toggleTestimonyApprovalAction } from "@/actions/admin/testimonies";

export default async function AdminTestimoniesPage() {
  await requireAdmin();
  const testimonies = await prisma.testimony.findMany({
    orderBy: { submittedAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Testimonies" newHref="/admin/testimonies/new" />
      <DataTable>
        <DataTableHead>
          <Th>Author</Th>
          <Th>Testimony</Th>
          <Th>Status</Th>
          <Th className="text-right">Actions</Th>
        </DataTableHead>
        <DataTableBody>
          {testimonies.length === 0 && <EmptyRow colSpan={4}>No testimonies yet.</EmptyRow>}
          {testimonies.map((t) => (
            <tr key={t.id}>
              <Td className="font-medium">{t.authorName}</Td>
              <Td className="max-w-sm truncate">{t.body}</Td>
              <Td>
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone={t.isApproved ? "green" : "amber"}>
                    {t.isApproved ? "Approved" : "Pending"}
                  </Badge>
                  {t.isFeatured && <Badge tone="brand">Featured</Badge>}
                </div>
              </Td>
              <Td className="text-right">
                <div className="flex justify-end gap-3">
                  <ToggleRowButton
                    id={t.id}
                    action={toggleTestimonyApprovalAction}
                    label={t.isApproved ? "Unapprove" : "Approve"}
                  />
                  <Link href={`/admin/testimonies/${t.id}`} className="text-xs font-medium text-brand-700 hover:underline admin-dark:text-brand-300">
                    Edit
                  </Link>
                  <DeleteRowButton id={t.id} action={deleteTestimonyAction} />
                </div>
              </Td>
            </tr>
          ))}
        </DataTableBody>
      </DataTable>
    </div>
  );
}
