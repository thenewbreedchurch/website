import { redirect } from "next/navigation";
import { getSessionFromCookie } from "@/lib/session";
import { InactivityWatcher } from "@/components/admin/InactivityWatcher";
import { AdminSidebar } from "@/components/admin/sidebar";

// Route group for every admin page that requires an authenticated session.
// middleware.ts already bounces requests with no session cookie at all, but
// the real check — hash lookup, absolute + idle expiry — happens here via
// getSessionFromCookie(), which is the only place allowed to touch Postgres
// for this (Node runtime, not Edge).
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionFromCookie();
  if (!user) {
    redirect("/admin/login");
  }

  const idleMinutes = Number(process.env.ADMIN_SESSION_IDLE_MINUTES ?? "15");

  return (
    <div className="flex min-h-screen flex-1 flex-col lg:flex-row">
      <InactivityWatcher idleMinutes={idleMinutes} />
      <AdminSidebar email={user.email} />
      <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
