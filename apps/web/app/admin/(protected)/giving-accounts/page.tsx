import Link from "next/link";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable, DataTableHead, DataTableBody, Th, Td, EmptyRow } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { DeleteRowButton } from "@/components/admin/delete-button";
import { deleteGivingAccountAction } from "@/actions/admin/giving-accounts";

export default async function AdminGivingAccountsPage() {
  await requireAdmin();
  const accounts = await prisma.givingAccount.findMany({ orderBy: [{ fundName: "asc" }, { sortOrder: "asc" }] });

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Giving Accounts" newHref="/admin/giving-accounts/new" />
      <DataTable>
        <DataTableHead>
          <Th>Fund</Th>
          <Th>Currency</Th>
          <Th>Bank</Th>
          <Th>Account No.</Th>
          <Th>Status</Th>
          <Th className="text-right">Actions</Th>
        </DataTableHead>
        <DataTableBody>
          {accounts.length === 0 && <EmptyRow colSpan={6}>No giving accounts yet.</EmptyRow>}
          {accounts.map((a) => (
            <tr key={a.id}>
              <Td className="font-medium">{a.fundName}</Td>
              <Td>{a.currency}</Td>
              <Td>{a.bankName}</Td>
              <Td>{a.accountNumber}</Td>
              <Td>
                <Badge tone={a.isActive ? "green" : "neutral"}>{a.isActive ? "Active" : "Inactive"}</Badge>
              </Td>
              <Td className="text-right">
                <div className="flex justify-end gap-3">
                  <Link href={`/admin/giving-accounts/${a.id}`} className="text-xs font-medium text-brand-700 hover:underline">
                    Edit
                  </Link>
                  <DeleteRowButton id={a.id} action={deleteGivingAccountAction} />
                </div>
              </Td>
            </tr>
          ))}
        </DataTableBody>
      </DataTable>
    </div>
  );
}
