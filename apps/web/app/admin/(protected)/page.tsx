import { redirect } from "next/navigation";
import Link from "next/link";
import { Megaphone, Inbox, HeartHandshake, ArrowRight } from "lucide-react";
import { prisma } from "@nb-church/db";
import { getSessionFromCookie } from "@/lib/session";
import { ADMIN_NAV_GROUPS } from "@/lib/admin-nav";

async function getStats() {
  const [publishedAnnouncements, newContactMessages, pendingInquiries] = await Promise.all([
    prisma.announcement.count({ where: { status: "PUBLISHED" } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.newConvertInquiry.count({ where: { status: "NEW" } }),
  ]);
  return { publishedAnnouncements, newContactMessages, pendingInquiries };
}

export default async function AdminDashboardPage() {
  const user = await getSessionFromCookie();
  if (!user) {
    redirect("/admin/login");
  }
  if (user.mustChangePassword) {
    redirect("/admin/change-password");
  }

  const stats = await getStats();

  const statTiles = [
    {
      href: "/admin/announcements",
      label: "Published announcements",
      value: stats.publishedAnnouncements,
      icon: Megaphone,
    },
    {
      href: "/admin/contact-messages",
      label: "New contact messages",
      value: stats.newContactMessages,
      icon: Inbox,
    },
    {
      href: "/admin/new-convert-inquiries",
      label: "Pending new-convert inquiries",
      value: stats.pendingInquiries,
      icon: HeartHandshake,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Welcome back</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Signed in as <strong className="text-neutral-700">{user.email}</strong>.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {statTiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="group flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <tile.icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{tile.value}</p>
              <p className="mt-0.5 text-sm text-neutral-500">{tile.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 space-y-8">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
              {group.label}
            </h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-start gap-3 rounded-xl border border-l-4 border-neutral-200 border-l-brand-600 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <item.icon size={18} className="mt-0.5 shrink-0 text-brand-700" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-neutral-900">{item.label}</h3>
                    <p className="mt-0.5 text-sm text-neutral-500">{item.description}</p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="mt-1 shrink-0 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-700"
                  />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
