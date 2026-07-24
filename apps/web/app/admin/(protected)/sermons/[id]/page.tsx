import { notFound } from "next/navigation";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SermonForm } from "@/components/admin/sermon-form";
import { updateSermonAction } from "@/actions/admin/sermons";

export default async function EditSermonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const sermon = await prisma.sermon.findUnique({ where: { id } });
  if (!sermon) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Edit Sermon"
        breadcrumbs={[{ label: "Sermons", href: "/admin/sermons" }, { label: sermon.title }]}
      />
      <SermonForm sermon={sermon} action={updateSermonAction.bind(null, id)} />
    </div>
  );
}
