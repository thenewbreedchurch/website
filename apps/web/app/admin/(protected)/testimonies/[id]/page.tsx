import { notFound } from "next/navigation";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TestimonyForm } from "@/components/admin/testimony-form";
import { updateTestimonyAction } from "@/actions/admin/testimonies";

export default async function EditTestimonyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const testimony = await prisma.testimony.findUnique({ where: { id } });
  if (!testimony) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Edit Testimony" />
      <TestimonyForm testimony={testimony} action={updateTestimonyAction.bind(null, id)} />
    </div>
  );
}
