import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await prisma.churchSettings.findUniqueOrThrow({
    where: { id: "singleton" },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Church Settings"
        description="Contact info, socials, and links shown across the whole site — changes apply immediately."
      />
      <SettingsForm settings={settings} />
    </div>
  );
}
