import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import { createAnnouncementAction } from "@/actions/admin/announcements";

export default async function NewAnnouncementPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="New Announcement"
        breadcrumbs={[{ label: "Announcements", href: "/admin/announcements" }, { label: "New" }]}
      />
      <AnnouncementForm action={createAnnouncementAction} />
    </div>
  );
}
