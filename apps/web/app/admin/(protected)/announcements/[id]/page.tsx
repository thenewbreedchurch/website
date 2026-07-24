import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import { updateAnnouncementAction } from "@/actions/admin/announcements";

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Edit Announcement"
        breadcrumbs={[{ label: "Announcements", href: "/admin/announcements" }, { label: announcement.title }]}
      />
      {announcement.registrationRequired && (
        <Link
          href={`/admin/announcements/${id}/registrations`}
          className="inline-block text-sm font-medium text-brand-700 hover:underline"
        >
          View registrations &rarr;
        </Link>
      )}
      <AnnouncementForm announcement={announcement} action={updateAnnouncementAction.bind(null, id)} />
    </div>
  );
}
