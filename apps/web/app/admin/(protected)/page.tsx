import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionFromCookie } from "@/lib/session";

const SECTIONS = [
  { href: "/admin/settings", label: "Church Settings", description: "Contact info, socials, links — shown site-wide." },
  { href: "/admin/service-times", label: "Service Times", description: "The weekly rhythm on the footer and Announcements." },
  { href: "/admin/announcements", label: "Announcements", description: "Powers the Weekly Announcements page." },
  { href: "/admin/sermons", label: "Sermons", description: "The sermon archive and homepage teaser." },
  { href: "/admin/testimonies", label: "Testimonies", description: "Approve and feature congregant testimonies." },
  { href: "/admin/giving-accounts", label: "Giving Accounts", description: "Bank details shown on the Give page." },
  { href: "/admin/next-steps", label: "Next Steps", description: "Cards on First Timers and New Converts." },
  { href: "/admin/staff", label: "Staff / Leadership", description: "Powers About and the public Leadership directory." },
  { href: "/admin/subscribers", label: "Newsletter Subscribers", description: "View and export the mailing list." },
  { href: "/admin/contact-messages", label: "Contact Messages", description: "Messages submitted via the Contact page." },
  { href: "/admin/new-convert-inquiries", label: "New Convert Inquiries", description: "Submissions from the New Converts intake form." },
];

export default async function AdminDashboardPage() {
  const user = await getSessionFromCookie();
  if (!user) {
    redirect("/admin/login");
  }
  if (user.mustChangePassword) {
    redirect("/admin/change-password");
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Signed in as <strong>{user.email}</strong>.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <h2 className="font-semibold text-neutral-900">{s.label}</h2>
            <p className="mt-1 text-sm text-neutral-500">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
