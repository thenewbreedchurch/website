import { notFound } from "next/navigation";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { NextStepForm } from "@/components/admin/next-step-form";
import { updateNextStepAction } from "@/actions/admin/next-steps";

export default async function EditNextStepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const nextStep = await prisma.nextStep.findUnique({ where: { id } });
  if (!nextStep) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Edit Next Step" />
      <NextStepForm nextStep={nextStep} action={updateNextStepAction.bind(null, id)} />
    </div>
  );
}
