import { notFound } from "next/navigation";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ServiceTimeForm } from "@/components/admin/service-time-form";
import { updateServiceTimeAction } from "@/actions/admin/settings";

export default async function EditServiceTimePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const serviceTime = await prisma.serviceTime.findUnique({ where: { id } });
  if (!serviceTime) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Edit Service Time"
        breadcrumbs={[{ label: "Service Times", href: "/admin/service-times" }, { label: serviceTime.label }]}
      />
      <ServiceTimeForm serviceTime={serviceTime} action={updateServiceTimeAction.bind(null, id)} />
    </div>
  );
}
