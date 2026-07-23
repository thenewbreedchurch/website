import { redirect } from "next/navigation";
import { getSessionFromCookie } from "@/lib/session";

// Bare-bones placeholder — the real admin CRUD pages (Announcements, Sermons,
// Testimonies, Giving Accounts, Service Times, Settings, Next Steps) are a
// later phase and belong inside this (protected) route group, following the
// same getSessionFromCookie() + mustChangePassword-guard pattern used here.
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
      <p className="mt-2 text-sm text-neutral-600">
        Signed in as <strong>{user.email}</strong>. Content management pages land here in a later
        phase.
      </p>
    </div>
  );
}
